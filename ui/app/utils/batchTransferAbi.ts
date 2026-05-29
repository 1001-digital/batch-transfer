// Minimal ABI for the BatchTransfer contract: only the methods, errors, and
// events the UI interacts with. Keep in sync with
// `contracts/contracts/BatchTransfer.sol`.
export const batchTransferAbi = [
  // --- ERC-20 ---
  {
    type: 'function',
    name: 'batchTransferERC20',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'amounts', type: 'uint256[]' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'batchTransferERC20Equal',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  // --- ERC-721 ---
  {
    type: 'function',
    name: 'batchTransferERC721',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenIds', type: 'uint256[]' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'safeBatchTransferERC721',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenIds', type: 'uint256[]' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'batchTransferERC721ToMany',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'tokenIds', type: 'uint256[]' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'safeBatchTransferERC721ToMany',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'tokenIds', type: 'uint256[]' },
    ],
    outputs: [],
  },
  // --- ERC-1155 ---
  {
    type: 'function',
    name: 'batchTransferERC1155',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'ids', type: 'uint256[]' },
      { name: 'amounts', type: 'uint256[]' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'batchTransferERC1155ToMany',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'ids', type: 'uint256[]' },
      { name: 'amounts', type: 'uint256[]' },
    ],
    outputs: [],
  },
  // --- Errors ---
  { type: 'error', name: 'LengthMismatch', inputs: [] },
  { type: 'error', name: 'EmptyBatch', inputs: [] },
] as const

// ERC-1155 approval surface (viem ships erc20Abi / erc721Abi but not 1155).
export const erc1155Abi = [
  {
    type: 'function',
    name: 'isApprovedForAll',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'setApprovalForAll',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const
