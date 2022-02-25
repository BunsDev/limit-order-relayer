import dotenv from 'dotenv'
import { ChainId } from '../entities/ChainId';

dotenv.config()

export const fetchLimitOrderPairs = function (chainId: ChainId): string[][] {
  const limitOrderPairs = _limitOrderPairs[chainId]

  limitOrderPairs.forEach((pair0, i) => {
    limitOrderPairs.forEach((pair1, j) => {
      if (
        i !== j &&
        ((pair0[0] === pair1[0] && pair0[1] === pair1[1]) || (pair0[0] === pair1[1] && pair0[1] === pair1[0]))
      ) {
        throw new Error(`Doubled pairs ${i}, ${j}`)
      }
    })
  })

  return limitOrderPairs
}

export const _limitOrderPairs = {
  [1]: [['WETH', 'SUSHI']],
  [137]: [
    ['WETH', 'WMATIC'],
    ['WETH', 'USDC'],
    ['WETH', 'DAI'],
    ['WBTC', 'WETH'],
    ['USDC', 'USDT'],
    ['USDC', 'IRON'],
    ['WETH', 'USDT'],
    ['USDC', 'DAI'],
    ['WETH', 'AAVE'],
    ['LINK', 'WETH'],
    ['FRAX', 'USDC']
  ],
  [250]: [
    ['WFTM', 'USDC'],
    ['WFTM', 'DAI'],
    ['WFTM', 'WETH'],
    ['WFTM', 'WBTC'],
    ['WFTM', 'CRV'],
    ['WFTM', 'LUX'],
    ['WFTM', 'WLUM'],
    ['WFTM', 'SOUL'],
    ['WFTM', 'SEANCE'],
  ]

  // [ChainId.AVALANCHE]: [
  //   ['wMEMO', 'MIM'],
  //   ['MIM', 'WAVAX'],
  //   ['MIM', 'USDC'],
  //   ['MIM', 'BSGG'],
  //   ['USDC', 'WAVAX'],
  //   ['SPELL', 'WAVAX'],
  //   ['sSPELL', 'SPELL'],
  //   ['WETH', 'WAVAX'],
  //   ['wMEMO', 'WAVAX'],
  //   ['SUSHI', 'WAVAX'],
  //   ['WBTC', 'WAVAX'],
  //   ['USDT', 'WAVAX'],
  // ],
} as { [chainId in ChainId]: string[][] }

export const getDesiredProfitToken = function (chainId: ChainId): string[] {
  if (chainId === ChainId.MATIC) {
    return ['WMATIC', 'WETH', 'SUSHI', 'WBTC', 'USDC', 'DAI', 'USDT']
  } else if (chainId == ChainId.FANTOM) {
    return ['WFTM', 'USDC', 'SOUL']
  }
  // } else if (chainId == ChainId.AVALANCHE) {
  //   return ['WAVAX', 'TIME', 'MIM']
  // }
}
