# @1001-digital/batch-transfer-ui

Static, IPFS-hostable web app for the
[`BatchTransfer`](../contracts) contract. Built on Nuxt 4 and the
[`@1001-digital/layers.evm`](https://www.npmjs.com/package/@1001-digital/layers.evm)
layer (wallet connection, ENS, transaction flows, design system).

## Flow

1. **Connect** a wallet (injected, MetaMask, Coinbase, WalletConnect, Safe).
2. **Token** — paste the token contract and pick its standard (ERC-721 /
   ERC-1155 / ERC-20).
3. **Recipients** — one wallet or many; paste a list to fill rows in bulk.
4. **Approve & Transfer** — a single guided flow approves the contract (skipped
   if already approved) and then sends the whole batch in one transaction.

ENS names are resolved on-chain at execution time, so no indexer is required.

## Develop

```bash
pnpm install
pnpm --filter @1001-digital/batch-transfer-ui dev
```

## Static build (for IPFS)

```bash
pnpm --filter @1001-digital/batch-transfer-ui generate
```

The output in `.output/public/` is a self-contained static bundle. It uses
hash-based routing (`/#/about`) so deep links work from any IPFS gateway
without server rewrites. Pin the directory:

```bash
ipfs add -r .output/public
```

## Configuration

- **Contract address** — after deploying `@1001-digital/batch-transfer-contracts`, add the
  address to `app/utils/batchTransfer.ts` (keyed by chain id), or set
  `NUXT_PUBLIC_BATCH_TRANSFER_ADDRESS` for the active chain.
- **RPC / WalletConnect** — see `.env.example`.
- **Chains** — `app/app.config.ts` (`evm.chains`) plus the matching RPC entry in
  `nuxt.config.ts`. The app targets Ethereum mainnet by default.
