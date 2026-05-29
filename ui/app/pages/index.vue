<template>
  <div class="home stack">
    <section class="hero">
      <h1>Batch Transfer</h1>
      <p class="lead muted">
        Move many ERC-721, ERC-1155, or ERC-20 tokens in a single transaction,
        to one wallet or to many at once.
      </p>
    </section>

    <TransferCard />
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Batch Transfer' })
</script>

<style scoped>
.home {
  gap: var(--spacer-lg);
}

.hero {
  display: flex;
  flex-direction: column;
  gap: var(--spacer-sm);
  text-align: center;
}

.hero h1 {
  font-size: var(--font-2xl);
  letter-spacing: var(--letter-spacing-sm);
}

.lead {
  max-inline-size: 38rem;
  margin-inline: auto;
  font-size: var(--font-base);
  line-height: var(--line-height-lg);
}
</style>
