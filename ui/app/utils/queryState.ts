import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import { TOKEN_STANDARDS, type TokenStandard } from './batchTransfer'

// The "base input" of a transfer: the scalar fields that configure *what kind*
// of transfer this is, independent of the per-row recipient/amount list. These
// round-trip through the URL query so a link can arrive with them prefilled.
//
// The recipient list itself (`rows`) is deliberately *not* synced — it can be
// arbitrarily long and already has the "Paste a list" import for bulk entry.
export interface BaseInput {
  standard: TokenStandard
  tokenAddress: string
  mode: 'single' | 'many'
  /** ERC-721 only: use `safeTransferFrom`. Defaults on. */
  safe: boolean
  /** Single-mode recipient (ERC-721 / ERC-1155). */
  recipient: string
  /** Single-mode ERC-20 amount sent to each recipient. */
  amount: string
}

export const defaultBaseInput = (): BaseInput => ({
  standard: 'erc721',
  tokenAddress: '',
  mode: 'single',
  safe: true,
  recipient: '',
  amount: '',
})

const STANDARDS = new Set<string>(TOKEN_STANDARDS.map((s) => s.value))

// A query value may be absent, a string, null (bare `?key`), or an array of
// those when the key repeats. Collapse to the first usable string.
const first = (value: LocationQuery[string] | undefined): string => {
  const raw = Array.isArray(value) ? value[0] : value
  return (raw ?? '').trim()
}

// Read base input from a parsed route query. Missing or invalid params fall
// back to defaults, so a hand-crafted or stale link can never break the form.
export const queryToBaseInput = (query: LocationQuery): BaseInput => {
  const input = defaultBaseInput()

  const standard = first(query.standard)
  if (STANDARDS.has(standard)) input.standard = standard as TokenStandard

  const mode = first(query.mode)
  if (mode === 'single' || mode === 'many') input.mode = mode

  const token = first(query.token)
  if (token) input.tokenAddress = token

  // Only `safe=false` deviates from the default; anything else stays on.
  if (first(query.safe) === 'false') input.safe = false

  const recipient = first(query.to)
  if (recipient) input.recipient = recipient

  const amount = first(query.amount)
  if (amount) input.amount = amount

  return input
}

// Serialize base input to a minimal query: defaults and fields irrelevant to
// the current standard/mode are omitted, so an untouched form keeps a clean URL
// and a filled one yields a tidy, shareable link.
export const baseInputToQuery = (input: BaseInput): LocationQueryRaw => {
  const query: LocationQueryRaw = {}

  if (input.standard !== 'erc721') query.standard = input.standard
  if (input.mode !== 'single') query.mode = input.mode

  const token = input.tokenAddress.trim()
  if (token) query.token = token

  if (input.standard === 'erc721' && !input.safe) query.safe = 'false'

  if (input.standard !== 'erc20' && input.mode === 'single') {
    const recipient = input.recipient.trim()
    if (recipient) query.to = recipient
  }

  if (input.standard === 'erc20' && input.mode === 'single') {
    const amount = input.amount.trim()
    if (amount) query.amount = amount
  }

  return query
}
