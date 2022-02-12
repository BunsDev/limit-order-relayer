/* script used to seed the relayers database with orders */

import axios from 'axios'
import dotenv from 'dotenv'
import { Database } from './database'
import { ILimitOrder } from '../models/models'
import { getOrderPriceString } from '../utils/price'
// import { refreshOrderStatus } from '../orders/validOrders'
import { LAMBDA_URL } from '../utils/constants'
import { ILimitOrderData } from '../utils/limitOrderData'

dotenv.config()

export async function copyRemoteOrders() {
  const orderData: ILimitOrderData[] = (
    await axios(`${LAMBDA_URL}/orders/pending`, {
      method: 'POST',
      data: {
        chainId: process.env.CHAINID,
      },
    })
  ).data?.data?.orders

  if (!Array.isArray(orderData)) throw new Error(`Couldn't fetch orders from remote DB`)

  const database = Database.Instance

  await database.connectDB()

  const orders: ILimitOrder[] = orderData.map((order) => {
    return {
      price: getOrderPriceString(order.amountIn, order.amountOut),
      digest: order.orderTypeHash,
      order,
    }
  })

  await database.saveLimitOrders(orders)
}

copyRemoteOrders().then(() => {
  process.exit()
})
