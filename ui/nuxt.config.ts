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
      link: [{ rel: 'icon', href: '/icon.svg' }],
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
        // WalletConnect project id, baked into the static build so the
        // WalletConnect connector works on the IPFS deploy. It's a public
        // client identifier (not a secret) and is locked to allowed origins in
        // the WalletConnect/Reown dashboard. Override per-environment via
        // NUXT_PUBLIC_EVM_WALLET_CONNECT_PROJECT_ID.
        walletConnectProjectId: 'e5d1a7a02f43e5fac35d004443f086d3',
        chains: {
          // Leave `rpcs` empty so reads route through the connected wallet's
          // injected provider. The layer composes each chain's transport as
          // fallback([...rpcs, unstable_connector(injected), http()]); with no
          // configured rpcs, the wallet's injected RPC becomes the primary
          // read transport (no browser CORS, and it matches the network the
          // user selected), with viem's built-in chain RPC as a best-effort
          // fallback for reads issued before a wallet connects. Operators can
          // still supply dedicated endpoints via
          // NUXT_PUBLIC_EVM_CHAINS_MAINNET_RPCS (space separated).
          mainnet: {
            rpcs: '',
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
