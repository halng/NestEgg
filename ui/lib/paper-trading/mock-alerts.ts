import type { PriceAlert } from './types'

export const mockPriceAlerts: PriceAlert[] = [
  {
    id: 'alert-001',
    ticker: 'FPT',
    condition: 'ABOVE',
    targetPrice: 120000,
    isActive: true,
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'alert-002',
    ticker: 'VCB',
    condition: 'BELOW',
    targetPrice: 85000,
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'alert-003',
    ticker: 'HPG',
    condition: 'CROSS',
    targetPrice: 26000,
    isActive: false,
    triggeredAt: '2024-01-14T14:20:00Z',
    createdAt: '2024-01-13T08:00:00Z',
  },
  {
    id: 'alert-004',
    ticker: 'TCB',
    condition: 'ABOVE',
    targetPrice: 38000,
    isActive: true,
    createdAt: '2024-01-14T11:00:00Z',
  },
]

let alertIdCounter = 100
export function generateAlertId(): string {
  return `alert-${++alertIdCounter}`
}
