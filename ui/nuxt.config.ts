const siteName = 'Batch Transfer'
const siteDescription =
  'Move many ERC-20, ERC-721, or ERC-1155 tokens in a single transaction, to one wallet or many.'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  extends: ['@1001-digital/layers.evm'],

  // Pure client-side SPA: no server runtime, so `nuxt generate` emits a static
  // bundle that drops onto IPFS (or any static host) as-is. Hash routing
  // (see app/router.options.ts) keeps deep links working behind any gateway.
  ssr: false,

  devtools: { enabled: true },

  app: {
    head: {
      title: siteName,
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        { name: 'description', content: siteDescription },
        { property: 'og:title', content: siteName },
        { property: 'og:description', content: siteDescription },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [{ rel: 'icon', href: '/favicon.svg' }],
    },
  },

  css: ['~/assets/css/app.css'],

  runtimeConfig: {
    public: {
      // Optional: override the deployed BatchTransfer address for the active
      // chain via NUXT_PUBLIC_BATCH_TRANSFER_ADDRESS. Otherwise the per-chain
      // map in app/utils/batchTransfer.ts is used.
      batchTransferAddress: '',
      evm: {
        // Optional WalletConnect project id (NUXT_PUBLIC_EVM_WALLET_CONNECT_PROJECT_ID).
        walletConnectProjectId: '',
        chains: {
          // Public read RPCs (space separated, tried in order). Wallet writes
          // always go through the connected wallet, never these.
          mainnet: {
            rpcs: 'https://eth.llamarpc.com https://ethereum-rpc.publicnode.com',
          },
        },
      },
    },
  },

  // Override the layer's `node-cluster` Nitro preset; this app ships as a
  // static client bundle with no server.
  nitro: {
    preset: 'static',
  },

  vite: {
    optimizeDeps: {
      include: [
        '@1001-digital/layers.evm > @metamask/connect-evm',
        '@1001-digital/layers.evm > eventemitter3',
        '@1001-digital/layers.evm > qrcode',
        '@1001-digital/layers.evm > @walletconnect/ethereum-provider',
        '@1001-digital/layers.evm > @safe-global/safe-apps-sdk',
        '@1001-digital/layers.evm > @safe-global/safe-apps-provider',
        '@tanstack/vue-query',
      ],
    },
  },
})
