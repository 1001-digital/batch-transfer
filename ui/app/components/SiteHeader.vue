<template>
  <header class="site-header">
    <div class="container header-inner">
      <NuxtLink
        to="/"
        class="brand"
      >
        <Icon name="lucide:send-horizontal" />
        <span class="brand-word">Batch&nbsp;Transfer</span>
      </NuxtLink>

      <ClientOnly>
        <div class="connect">
          <EvmConnectDialog v-if="!isConnected" />
          <EvmProfile
            v-else
            class-name="unstyled profile-trigger"
          />
        </div>
      </ClientOnly>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useConnection } from '@wagmi/vue'

const { isConnected } = useConnection()
</script>

<style scoped>
.site-header {
  border-block-end: var(--border);
  background: var(--background-semi);
  position: sticky;
  inset-block-start: 0;
  z-index: calc(var(--z-index-ui, 100) + 1);
  backdrop-filter: blur(8px);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacer);
  block-size: 56px;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacer-sm);
  font-weight: var(--font-weight-bold);
  border: 0;
  color: var(--color);
}

.brand:hover {
  color: var(--primary);
}

.brand-word {
  letter-spacing: var(--letter-spacing-sm);
}

.connect {
  display: flex;
  align-items: center;
  gap: var(--spacer-sm);
}

.connect :deep(.profile-trigger) {
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}
</style>
