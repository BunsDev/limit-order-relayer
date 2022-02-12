import { BigNumber } from '@ethersproject/bignumber'
import { ILimitOrder } from '../models/models'
import { PriceUpdate, PRICE_MULTIPLIER } from '../pairs/pairUpdates'
import { getMinRate } from '../utils/price'

export interface ExecutableOrder {
  limitOrderData: ILimitOrder
  profitGwei: BigNumber
  inAmount: BigNumber
  outAmount: BigNumber
  outDiff: BigNumber
  minAmountIn: BigNumber
}

/**
 * @param priceUpdate Current state of SoulSwap pool
 * @param orders Orders that can be executed & if gas is 0 are already profitable
 * @returns Array of orders that when executed will net some profit for the relayer
 */
export async function profitableOrders(
  priceUpdate: PriceUpdate,
  orders: ILimitOrder[],
  { gasPrice, token0EthPrice, token1EthPrice }: { [key: string]: BigNumber }
): Promise<ExecutableOrder[]> {
  if (orders.length === 0) return []

  const sellingToken0 = orders[0].order.tokenIn === priceUpdate.token0.address

  return await _getProfitableOrders(priceUpdate, orders, sellingToken0, gasPrice, token0EthPrice, token1EthPrice)
}

export async function _getProfitableOrders(
  priceUpdate: PriceUpdate,
  orders: ILimitOrder[],
  sellingToken0: boolean,
  gasPrice: BigNumber,
  token0EthPrice: BigNumber,
  token1EthPrice: BigNumber
): Promise<ExecutableOrder[]> {
  orders = sortOrders(orders)

  const profitable: ExecutableOrder[] = []

  orders.forEach((orderData) => {
    // how much of the order can be filled without crossing limit price ? e.g. huge orders will be partially filled because their price impact is too high
    const effects = getOrderEffects(orderData, sellingToken0, priceUpdate, token0EthPrice, token1EthPrice)

    if (!!effects) {
      const {
        partialFill,
        inAmount,
        outAmount,
        outDiff,
        profitGwei,
        newPrice,
        newToken0Amount,
        newToken1Amount,
        minAmountIn,
      } = effects

      if (profitGwei.gt(gasPrice.mul('500000').div(1e9))) {
        // ~ 100k gas profit

        profitable.push({
          limitOrderData: orderData,
          profitGwei,
          inAmount,
          outDiff,
          outAmount,
          minAmountIn,
        })

        priceUpdate.token0.poolBalance = newToken0Amount
        priceUpdate.token1.poolBalance = newToken1Amount
        priceUpdate.token0.price = priceUpdate.token1.poolBalance
          .mul(PRICE_MULTIPLIER)
          .div(priceUpdate.token0.poolBalance)
        priceUpdate.token1.price = priceUpdate.token0.poolBalance
          .mul(PRICE_MULTIPLIER)
          .div(priceUpdate.token1.poolBalance)
      }
    }
  })

  return profitable
}

// lowest sell order first
export function sortOrders(orders: ILimitOrder[]) {
  return orders.sort((a, b) =>
    BigNumber.from(a.price.toString()).sub(BigNumber.from(b.price.toString())).lt(0) ? -1 : 1
  )
}

/**
 * Calculate the effects of optimally executing the order.
 * Calculate the correct fill amount, the profit amount, new pool balances...
 */
export function getOrderEffects(
  orderData: ILimitOrder,
  sellingToken0: boolean,
  priceUpdate: PriceUpdate,
  token0EthPrice: BigNumber,
  token1EthPrice: BigNumber
):
  | false
  | {
      partialFill: boolean
      inAmount: BigNumber
      outAmount: BigNumber
      outDiff: BigNumber
      minAmountIn: BigNumber
      profitGwei: BigNumber
      newPrice: BigNumber
      newToken0Amount: BigNumber
      newToken1Amount: BigNumber
    } {
  const _inAmount = BigNumber.from(orderData.order.amountIn)

  const limitPrice = BigNumber.from(orderData.price.toString())

  const { inAmount, outAmount, newPrice, newToken0Amount, newToken1Amount } = maxMarketSell(
    limitPrice,
    sellingToken0 ? priceUpdate.token0.price : priceUpdate.token1.price,
    sellingToken0,
    _inAmount,
    priceUpdate.token0.poolBalance,
    priceUpdate.token1.poolBalance,
    orderData.filledAmount,
    orderData.userBalance
  )

  if (inAmount.lte('0')) return false

  const partialFill: boolean = inAmount.lt(_inAmount)

  const minRate = getMinRate(orderData.order.amountIn, orderData.order.amountOut)

  const minOutAmount = inAmount.mul(minRate).div(PRICE_MULTIPLIER)

  const outDiff = outAmount.sub(minOutAmount) // relayer profit in out tokens

  const minAmountIn = getMinAmountIn(
    minOutAmount,
    sellingToken0,
    priceUpdate.token0.poolBalance,
    priceUpdate.token1.poolBalance
  )

  let profitGwei: BigNumber

  // todo test case for tokens with diferent decimal count
  if (outDiff.lt('0')) {
    profitGwei = BigNumber.from('0')
  } else {
    const price = sellingToken0 ? token1EthPrice : token0EthPrice

    profitGwei = outDiff.mul(price).div(BigNumber.from('10').pow(18 + 9))
  }

  return {
    partialFill,
    inAmount,
    outAmount,
    outDiff,
    profitGwei,
    newPrice,
    newToken0Amount,
    newToken1Amount,
    minAmountIn,
  }
}

/**
 * How much can we sell so that the new price won't cross the limit order price
 * note: limitPrice & currentPrice are both multiplied by PRICE_MULTIPLIER
 * @param limitPrice price of the order
 * @param currentPrice current price in pool
 * @param sellingToken0 true if inputToken is token0
 * @param inAmount amount that we want to sell
 * @param token0Amount balance of token0 in pool
 * @param token1Amount balance of token1 in pool
 * @returns amountIn that we can sell so that limitPrice is not surpassed (due to price impact), amountOut, newPrice, newToken0Balance, newToken1Balance
 */
export function maxMarketSell(
  limitPrice: BigNumber,
  currentPrice: BigNumber,
  sellingToken0: boolean,
  inAmount: BigNumber,
  token0Amount: BigNumber,
  token1Amount: BigNumber,
  filledAmount: string,
  userBalance?: string
) {
  if (currentPrice.lt(limitPrice)) return { inAmount: BigNumber.from('0') } as any

  inAmount = inAmount.sub(filledAmount || '0')

  if (!!userBalance) {
    inAmount = inAmount.lt(userBalance) ? inAmount : BigNumber.from(userBalance)
  }

  const marketSell = marketSellOutput(sellingToken0, inAmount, token0Amount, token1Amount)

  if (marketSell.newPrice.lt(limitPrice)) {
    // price impact is too high - we need to do a partial fill
    // calculating the amountIn (a) to get such a price impact that newPrice === price is a quadratic equation [ aa + 2ax + xx - xy/price = 0 ]
    // alternatively estimate amountIn with the following approach:

    // executionPrice = currentPrice + limitPrice / 2

    // limitPrice = (y - amountIn * executionPrice) / (x + amountIn)
    // amountIn = (y - x * limitPrice) / (limitPrice + executionPrice)

    const executionPrice = limitPrice.add(currentPrice).div(2)
    const x = sellingToken0 ? token0Amount : token1Amount
    const y = sellingToken0 ? token1Amount : token0Amount
    inAmount = y.sub(x.mul(limitPrice).div(PRICE_MULTIPLIER)).mul(PRICE_MULTIPLIER).div(executionPrice.add(limitPrice))

    return { inAmount, ...marketSellOutput(sellingToken0, inAmount, token0Amount, token1Amount) }
  } else {
    return { inAmount, ...marketSell }
  }
}

export function marketSellOutput(
  sellingToken0: boolean,
  inAmount: BigNumber,
  token0Amount: BigNumber,
  token1Amount: BigNumber
) {
  let outAmount: BigNumber, newPrice: BigNumber, newToken0Amount: BigNumber, newToken1Amount: BigNumber

  if (sellingToken0) {
    outAmount = getAmountOut(inAmount, token0Amount, token1Amount)
    newToken0Amount = token0Amount.add(inAmount)
    newToken1Amount = token1Amount.sub(outAmount)
    newPrice = newToken1Amount.mul(PRICE_MULTIPLIER).div(newToken0Amount) // price should be in terms of token1 / token0 when selling token0
  } else {
    outAmount = getAmountOut(inAmount, token1Amount, token0Amount)
    newToken0Amount = token0Amount.sub(outAmount)
    newToken1Amount = token1Amount.add(inAmount)
    newPrice = newToken0Amount.mul(PRICE_MULTIPLIER).div(newToken1Amount) // price should be in terms of token0 / token1 when selling token1
  }

  return { outAmount, newPrice, newToken0Amount, newToken1Amount }
}

export function getAmountIn(amountOut: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber) {
  const numerator = reserveIn.mul(amountOut).mul(1000)
  const denominator = reserveOut.sub(amountOut).mul(997)
  return numerator.div(denominator).add(1)
}

export function getAmountOut(amountIn: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber) {
  const amountInWithFee = amountIn.mul(BigNumber.from(997))
  const numerator = amountInWithFee.mul(reserveOut)
  const denominator = reserveIn.mul(BigNumber.from(1000)).add(amountInWithFee)
  return numerator.div(denominator)
}

export function getMinAmountIn(amountOut: BigNumber, sellingToken0: boolean, reserve0: BigNumber, reserve1: BigNumber) {
  if (sellingToken0) {
    return getAmountIn(amountOut, reserve0, reserve1)
  } else {
    return getAmountIn(amountOut, reserve1, reserve0)
  }
}
