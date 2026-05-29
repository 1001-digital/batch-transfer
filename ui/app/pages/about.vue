<template>
  <article class="about">
    <Prose>
      <h1>About Batch Transfer</h1>

      <p>
        Batch Transfer is a small, stateless smart contract and a static web app
        for moving many tokens in one transaction. It supports the three
        mainstream Ethereum token standards:
      </p>

      <ul>
        <li><strong>ERC-721</strong>: NFTs, one or many per recipient.</li>
        <li>
          <strong>ERC-1155</strong>: multi-tokens, with per-id quantities.
        </li>
        <li>
          <strong>ERC-20</strong>: fungible tokens, equal or custom amounts.
        </li>
      </ul>

      <h2>How it works</h2>

      <ol>
        <li>Connect your wallet and pick the token contract and standard.</li>
        <li>
          Choose a single recipient or paste a list of many, with token ids and
          amounts as needed.
        </li>
        <li>
          Approve the Batch Transfer contract once, then send everything in a
          single transaction.
        </li>
      </ol>

      <p>
        Tokens always move <em>from your wallet</em>. The contract holds
        nothing, has no owner, and can only move what you have explicitly
        approved, so the approval is safe to grant.
      </p>

      <h2>Self-hostable</h2>

      <p>
        This app is a fully static, client-rendered bundle with no server
        component. It's built to be pinned to IPFS and served from any gateway.
      </p>
    </Prose>
  </article>
</template>

<script setup lang="ts">
// `<Prose>` emits `class="prose"`, but the layer ships these styles as a
// separate entry that isn't in the global bundle. Import it here so the rules
// load with the about-page chunk.
import '@1001-digital/styles/prose.css'

useHead({ title: 'About · Batch Transfer' })
</script>

<style scoped>
.about {
  max-inline-size: 42rem;
  margin-inline: auto;
}
</style>
