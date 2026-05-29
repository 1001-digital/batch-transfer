export default defineAppConfig({
  evm: {
    title: 'Batch Transfer',
    defaultChain: 'mainnet',
    chains: {
      mainnet: {
        id: 1,
        blockExplorer: 'https://etherscan.io',
      },
    },
    // Resolve ENS directly on-chain via the configured mainnet RPC, with no
    // indexer service required, which keeps the static build self-contained.
    ens: {
      mode: 'chain',
    },
    inAppWallet: {
      enabled: false,
    },
  },
})
