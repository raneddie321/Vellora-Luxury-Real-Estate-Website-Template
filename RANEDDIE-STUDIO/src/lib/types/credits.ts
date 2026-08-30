import type { AICapability } from './ai'

export interface CreditLedgerEntry {
  id: string
  createdAt: string
  /** Negative for spend, positive for grants. */
  amount: number
  balanceAfter: number
  capability: AICapability | 'grant'
  description: string
  projectId?: string
  jobId?: string
}

export interface CreditState {
  balance: number
  history: CreditLedgerEntry[]
}
