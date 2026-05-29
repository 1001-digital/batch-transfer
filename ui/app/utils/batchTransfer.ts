import type { Address } from 'viem'

// Deployed BatchTransfer contract addresses, keyed by chain id.
// Fill these in after running the Ignition deploy in `contracts/`.
// A per-chain entry can also be overridden at runtime through
// `NUXT_PUBLIC_BATCH_TRANSFER_ADDRESS` (applies to the active chain).
export const BATCH_TRANSFER_ADDRESSES: Record<number, Address> = {
  1: '0xF32bC3458d007632F9F61EF5D3230C2c6b90cE5d', // mainnet
  11155111: '0x9cF9C8eA737A7d5157d3F4282aCe30880a7A117C', // sepolia
}

export type TokenStandard = 'erc721' | 'erc1155' | 'erc20'

export const TOKEN_STANDARDS: { value: TokenStandard; label: string }[] = [
  { value: 'erc721', label: 'ERC-721' },
  { value: 'erc1155', label: 'ERC-1155' },
  { value: 'erc20', label: 'ERC-20' },
]
