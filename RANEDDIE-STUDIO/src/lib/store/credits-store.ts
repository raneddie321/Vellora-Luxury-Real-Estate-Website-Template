'use client'

import { create } from 'zustand'
import { createId } from '@/lib/id'
import { getCreditRepository } from '@/lib/persistence'
import { CAPABILITY_CREDITS, CAPABILITY_LABELS } from '@/lib/ai/provider'
import type { AICapability, CreditLedgerEntry, CreditState } from '@/lib/types'

/**
 * AI credits.
 *
 * A local accounting ledger, not a payment system: nothing here talks to a
 * processor and no money moves. It exists so cost is visible *before* an
 * operation runs, which is the behaviour that will still matter once real
 * metering is connected.
 */

const DEFAULT_BALANCE = Number(process.env.NEXT_PUBLIC_DEFAULT_AI_CREDITS ?? 500)

interface CreditsStore extends CreditState {
  loaded: boolean
  load: () => Promise<void>
  spend: (amount: number, capability: AICapability, description: string, projectId?: string) => boolean
  grant: (amount: number, description: string) => void
  canAfford: (amount: number) => boolean
  reset: () => void
}

export const useCreditsStore = create<CreditsStore>((set, get) => ({
  balance: Number.isFinite(DEFAULT_BALANCE) ? DEFAULT_BALANCE : 500,
  history: [],
  loaded: false,

  async load() {
    if (get().loaded) return
    try {
      const state = await getCreditRepository().read()
      set({ ...state, loaded: true })
    } catch {
      set({ loaded: true })
    }
  },

  spend(amount, capability, description, projectId) {
    const { balance, history } = get()
    if (amount <= 0) return true
    if (balance < amount) return false
    const nextBalance = balance - amount
    const entry: CreditLedgerEntry = {
      id: createId('cr'),
      createdAt: new Date().toISOString(),
      amount: -amount,
      balanceAfter: nextBalance,
      capability,
      description,
      projectId,
    }
    const next = { balance: nextBalance, history: [entry, ...history].slice(0, 200) }
    set(next)
    void getCreditRepository().write(next)
    return true
  },

  grant(amount, description) {
    const { balance, history } = get()
    const nextBalance = balance + amount
    const entry: CreditLedgerEntry = {
      id: createId('cr'),
      createdAt: new Date().toISOString(),
      amount,
      balanceAfter: nextBalance,
      capability: 'grant',
      description,
    }
    const next = { balance: nextBalance, history: [entry, ...history].slice(0, 200) }
    set(next)
    void getCreditRepository().write(next)
  },

  canAfford(amount) {
    return get().balance >= amount
  },

  reset() {
    const next = { balance: Number.isFinite(DEFAULT_BALANCE) ? DEFAULT_BALANCE : 500, history: [] }
    set(next)
    void getCreditRepository().write(next)
  },
}))

/** Imperative helper for non-React callers (the editor store). */
export const spendCredits = (
  amount: number,
  capability: AICapability,
  description: string,
  projectId?: string,
) => useCreditsStore.getState().spend(amount, capability, description, projectId)

export const creditCost = (capability: AICapability) => CAPABILITY_CREDITS[capability]
export const creditLabel = (capability: AICapability | 'grant') =>
  capability === 'grant' ? 'Credit grant' : CAPABILITY_LABELS[capability]
