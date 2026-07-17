import type { Order, PlaceOrderRequest } from "./types"

export const mockPendingOrders: Order[] = [
  {
    id: "ord-001",
    ticker: "FPT",
    side: "BUY",
    orderType: "LIMIT",
    status: "PENDING",
    requestedShares: 100,
    filledShares: 0,
    limitPrice: 110000,
    timeInForce: "GTC",
    createdAt: "2024-01-15T09:30:00Z",
  },
  {
    id: "ord-002",
    ticker: "VCB",
    side: "SELL",
    orderType: "STOP",
    status: "PENDING",
    requestedShares: 50,
    filledShares: 0,
    stopPrice: 85000,
    timeInForce: "DAY",
    createdAt: "2024-01-15T10:15:00Z",
  },
  {
    id: "ord-003",
    ticker: "TCB",
    side: "BUY",
    orderType: "STOP_LIMIT",
    status: "PENDING",
    requestedShares: 200,
    filledShares: 0,
    stopPrice: 36000,
    limitPrice: 36500,
    timeInForce: "GTC",
    createdAt: "2024-01-15T11:00:00Z",
  },
]

export const mockOrderHistory: Order[] = [
  {
    id: "ord-100",
    ticker: "FPT",
    side: "BUY",
    orderType: "MARKET",
    status: "FILLED",
    requestedShares: 200,
    filledShares: 200,
    executedPrice: 108000,
    total: 21600000,
    timeInForce: "DAY",
    createdAt: "2024-01-10T09:15:00Z",
    executedAt: "2024-01-10T09:15:05Z",
  },
  {
    id: "ord-101",
    ticker: "VCB",
    side: "BUY",
    orderType: "LIMIT",
    status: "FILLED",
    requestedShares: 150,
    filledShares: 150,
    limitPrice: 92000,
    executedPrice: 92000,
    total: 13800000,
    timeInForce: "DAY",
    createdAt: "2024-01-11T10:25:00Z",
    executedAt: "2024-01-11T10:30:00Z",
  },
  {
    id: "ord-102",
    ticker: "TCB",
    side: "BUY",
    orderType: "MARKET",
    status: "FILLED",
    requestedShares: 300,
    filledShares: 300,
    executedPrice: 34000,
    total: 10200000,
    timeInForce: "DAY",
    createdAt: "2024-01-12T14:20:00Z",
    executedAt: "2024-01-12T14:20:03Z",
  },
  {
    id: "ord-103",
    ticker: "HPG",
    side: "BUY",
    orderType: "LIMIT",
    status: "CANCELLED",
    requestedShares: 500,
    filledShares: 0,
    limitPrice: 24000,
    timeInForce: "DAY",
    createdAt: "2024-01-13T09:00:00Z",
    updatedAt: "2024-01-13T15:30:00Z",
  },
  {
    id: "ord-104",
    ticker: "HPG",
    side: "SELL",
    orderType: "MARKET",
    status: "FILLED",
    requestedShares: 100,
    filledShares: 100,
    executedPrice: 26500,
    total: 2650000,
    timeInForce: "DAY",
    createdAt: "2024-01-13T11:45:00Z",
    executedAt: "2024-01-13T11:45:02Z",
  },
  {
    id: "ord-105",
    ticker: "VNM",
    side: "BUY",
    orderType: "STOP",
    status: "REJECTED",
    requestedShares: 100,
    filledShares: 0,
    stopPrice: 75000,
    timeInForce: "DAY",
    createdAt: "2024-01-14T10:00:00Z",
  },
]

let orderIdCounter = 200

export function generateOrderId(): string {
  return `ord-${++orderIdCounter}`
}

export function simulatePlaceOrder(request: PlaceOrderRequest): Order {
  const now = new Date().toISOString()
  const isMarketOrder = request.orderType === "MARKET"

  return {
    id: generateOrderId(),
    ticker: request.ticker,
    side: request.side,
    orderType: request.orderType,
    status: isMarketOrder ? "FILLED" : "PENDING",
    requestedShares: request.shares,
    filledShares: isMarketOrder ? request.shares : 0,
    limitPrice: request.limitPrice,
    stopPrice: request.stopPrice,
    trailPercent: request.trailPercent,
    executedPrice: isMarketOrder ? request.limitPrice : undefined,
    timeInForce: request.timeInForce,
    createdAt: now,
    executedAt: isMarketOrder ? now : undefined,
  }
}
