<template>
  <div class="shell">
    <NuxtLoadingIndicator color="var(--primary)" />
    <main class="shell-main container">
      <div class="workspace">
        <AppTabs />
        <div class="workspace-body">
          <NuxtPage />
        </div>
      </div>
    </main>
    <footer class="site-footer container">
      <span class="muted">
        Batch Transfer ·
        <a
          href="https://1001.digital"
          target="_blank"
          rel="noopener"
          >by 1001</a
        >
      </span>
      <nav>
        <a
          href="https://github.com/1001-digital/batch-transfer"
          target="_blank"
          rel="noopener"
          >Github</a
        >
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
// All chrome lives here; pages render inside the tabbed workspace.
</script>

<style scoped>
.shell {
  min-block-size: 100dvh;
  display: flex;
  flex-direction: column;
}

.shell-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-block: var(--spacer-lg);
}

.workspace {
  display: flex;
  flex-direction: column;
}

.workspace-body {
  border: var(--card-border);
  background: var(--card-background);
  padding: var(--spacer);
}

.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--spacer-lg);
  font-size: var(--font-sm);
  text-transform: uppercase;
}

.site-footer nav {
  display: flex;
  gap: var(--spacer);
}

.site-footer nav a {
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.site-footer a {
  border: 0;
  color: var(--muted);
}

.site-footer a:hover {
  color: var(--color);
}
</style>
