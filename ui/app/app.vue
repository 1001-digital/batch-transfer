<template>
  <div class="shell">
    <NuxtLoadingIndicator color="var(--primary)" />
    <SiteHeader />
    <main class="shell-main container">
      <NuxtPage />
    </main>
    <footer class="site-footer container">
      <span class="muted">
        Batch Transfer · by
        <a
          href="https://1001.digital"
          target="_blank"
          rel="noopener"
          >1001.digital</a
        >
      </span>
      <nav>
        <NuxtLink to="/about">About</NuxtLink>
        <a
          href="https://github.com/1001-digital/batch-transfer"
          target="_blank"
          rel="noopener"
          >Source</a
        >
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
// All chrome lives here; pages render inside <main>.
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

.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: var(--spacer);
  border-block-start: var(--border);
  font-size: var(--font-sm);
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
