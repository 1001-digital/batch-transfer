# @1001-digital/batch-transfer-contracts

A modern, multi-standard batch transfer contract. Move many **ERC-20**,
**ERC-721**, or **ERC-1155** tokens in a single transaction — to one recipient
or to many in parallel.

Inspired by [Aleph Retamal's `ERC721BatchTransfer`](https://github.com/alephao),
rebuilt for all three mainstream token standards with [Solady](https://github.com/Vectorized/solady)'s
`SafeTransferLib`, custom errors, and per-standard events.

## Design

`BatchTransfer` is **stateless**: it custodies nothing, has no owner, and holds
no privileged role. Tokens always move _from_ `msg.sender` — the contract can
only move what the caller has explicitly approved, so a blanket approval is
safe to grant.

```
approve / setApprovalForAll  ──▶  BatchTransfer  ──▶  recipients
        (token contract)            (this repo)
```

### Functions

| Standard | One recipient                                        | Many recipients                                               |
| -------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| ERC-20   | `batchTransferERC20Equal(token, recipients, amount)` | `batchTransferERC20(token, recipients, amounts)`              |
| ERC-721  | `batchTransferERC721 / safeBatchTransferERC721`      | `batchTransferERC721ToMany / safeBatchTransferERC721ToMany`   |
| ERC-1155 | `batchTransferERC1155(token, to, ids, amounts)`      | `batchTransferERC1155ToMany(token, recipients, ids, amounts)` |

ERC-721 ships both `transferFrom` (cheap) and `safeTransferFrom` (invokes
`onERC721Received`) variants. ERC-20 uses Solady's `SafeTransferLib` so
non-standard tokens such as USDT work. ERC-1155 is always safe per the standard.

### Errors

- `LengthMismatch()` — parallel input arrays had different lengths.
- `EmptyBatch()` — a batch was submitted with zero entries.

## Develop

```bash
pnpm install
pnpm --filter @1001-digital/batch-transfer-contracts compile
pnpm --filter @1001-digital/batch-transfer-contracts test
pnpm --filter @1001-digital/batch-transfer-contracts test:gas
```

Built with Hardhat 3 + the viem toolbox. Tests use `node:test`.

## Deploy

Copy `.env.example` to `.env` and fill in the values, then:

```bash
pnpm --filter @1001-digital/batch-transfer-contracts deploy:sepolia
pnpm --filter @1001-digital/batch-transfer-contracts deploy:mainnet
```

Deployment uses [Hardhat Ignition](https://hardhat.org/ignition)
(`ignition/modules/BatchTransfer.ts`). After deploying, copy the address into
the UI's `runtimeConfig` (see `ui/nuxt.config.ts`).
