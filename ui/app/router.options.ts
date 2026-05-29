import type { RouterConfig } from '@nuxt/schema'
import { createWebHashHistory } from 'vue-router'

// Hash-based routing keeps deep links (e.g. `/#/about`) working on any static
// host, including IPFS/IPNS gateways that serve from an arbitrary subpath and
// can't be configured to rewrite unknown paths to index.html.
export default {
  history: (base) => createWebHashHistory(base),
} satisfies RouterConfig
