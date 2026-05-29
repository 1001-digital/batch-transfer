<template>
  <nav
    class="app-tabs"
    aria-label="Sections"
  >
    <NuxtLink
      to="/"
      class="app-tab"
      :class="{ active: isHome }"
    >
      Batch Transfer
    </NuxtLink>

    <NuxtLink
      to="/about"
      class="app-tab"
      :class="{ active: isAbout }"
    >
      About
    </NuxtLink>

    <div class="app-tabs-connect">
      <ClientOnly>
        <EvmConnectDialog
          v-if="!isConnected"
          class-name="app-tab tab-connect unstyled"
        >
          Connect
        </EvmConnectDialog>
        <EvmProfile
          v-else
          class-name="app-tab tab-connect tab-account unstyled"
        />

        <template #fallback>
          <span class="app-tab tab-connect">Connect</span>
        </template>
      </ClientOnly>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConnection } from '@wagmi/vue'

const route = useRoute()
const { isConnected } = useConnection()

const isHome = computed(() => route.path === '/')
const isAbout = computed(() => route.path === '/about')
</script>

<!--
  Unscoped on purpose: the connect tab is rendered by EvmConnectDialog /
  EvmProfile (child components), so the `.app-tab` look has to reach their
  internal <button>. Class names are namespaced to avoid global collisions.
-->
<style>
.app-tabs {
  display: flex;
  align-items: stretch;
  /* Pull the row down by one border so the active tab overlaps — and erases —
     the content box's top border, reading as one continuous shape. */
  margin-block-end: calc(-1 * var(--border-width));
  position: relative;
  z-index: 1;
}

.app-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--spacer-sm);
  padding: var(--ui-padding-block) var(--spacer);
  border: var(--border);
  background: var(--background);
  color: var(--muted);
  font-size: var(--ui-font-size);
  font-weight: var(--font-weight-bold);
  text-transform: var(--ui-text-transform);
  letter-spacing: var(--ui-letter-spacing);
  line-height: var(--ui-line-height);
  white-space: nowrap;
  text-decoration: none;
  box-shadow: none;
  cursor: pointer;
}

/* Adjacent tabs share their vertical border. */
.app-tab + .app-tab {
  margin-inline-start: calc(-1 * var(--border-width));
}

.app-tab:hover,
.app-tab:focus-visible {
  color: var(--color);
  background: var(--gray-100);
}

/* Active content tab: white like the box, bottom border hidden so it merges. */
.app-tab.active {
  z-index: 2;
  color: var(--color);
  background: var(--card-background);
  border-block-end-color: var(--card-background);
}

/* The connect/account tab is right-aligned. */
.app-tabs-connect {
  margin-inline-start: auto;
  display: inline-flex;
}

/* A connected account (hex / ENS) reads better in its natural case. */
.tab-account {
  text-transform: none;
}
</style>
