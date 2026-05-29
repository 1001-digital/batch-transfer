export interface TransferRow {
  /** Token id (ERC-721 / ERC-1155). */
  id: string
  /** Amount: human-decimal for ERC-20, integer quantity for ERC-1155. */
  amount: string
  /** Recipient: a 0x address or ENS name (resolved at execution time). */
  to: string
}

export const emptyRow = (): TransferRow => ({ id: '', amount: '', to: '' })
