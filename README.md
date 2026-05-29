# Batch Transfer

Move many **ERC-721**, **ERC-1155**, or **ERC-20** tokens in a single
transaction — to one wallet or to many at once.

A modern take on Aleph Retamal's `ERC721BatchTransfer`: a stateless,
multi-standard batch transfer contract plus a static, IPFS-hostable UI.

## Monorepo

pnpm workspace with two packages:

| Package                    | Description                                                               |
| -------------------------- | ------------------------------------------------------------------------- |
| [`contracts`](./contracts) | Hardhat 3 project — the `BatchTransfer` Solidity contract, tests, deploy. |
| [`ui`](./ui)               | Nuxt 4 static app on `@1001-digital/layers.evm` — connect, build, send.   |

## Quick start

```bash
pnpm install

# Contracts
pnpm --filter @1001-digital/batch-transfer-contracts compile
pnpm --filter @1001-digital/batch-transfer-contracts test

# UI (dev server)
pnpm --filter @1001-digital/batch-transfer-ui dev

# UI (static build for IPFS)
pnpm --filter @1001-digital/batch-transfer-ui generate
```

## Workflow

1. Deploy the contract (`contracts/` — see its README) to your target network.
2. Put the deployed address in `ui/app/utils/batchTransfer.ts` (or set
   `NUXT_PUBLIC_BATCH_TRANSFER_ADDRESS`).
3. `pnpm --filter @1001-digital/batch-transfer-ui generate` and pin `ui/.output/public` to
   IPFS.

## Contract surface

`BatchTransfer` is stateless, owns nothing, and always moves tokens _from_
`msg.sender`:

| Standard | One recipient                                     | Many recipients                                               |
| -------- | ------------------------------------------------- | ------------------------------------------------------------- |
| ERC-20   | `batchTransferERC20Equal`                         | `batchTransferERC20`                                          |
| ERC-721  | `batchTransferERC721` / `safeBatchTransferERC721` | `batchTransferERC721ToMany` / `safeBatchTransferERC721ToMany` |
| ERC-1155 | `batchTransferERC1155`                            | `batchTransferERC1155ToMany`                                  |

See [`contracts/README.md`](./contracts/README.md) for details.

## Tooling

- pnpm workspaces · Node 24
- Hardhat 3 + viem toolbox (contracts)
- Nuxt 4 + `@1001-digital/layers.evm` (UI)
- Prettier (single quotes, no semicolons)
