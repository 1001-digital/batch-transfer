<template>
  <div
    class="standard-picker"
    role="radiogroup"
    aria-label="Token standard"
  >
    <button
      v-for="option in TOKEN_STANDARDS"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="option.value === model"
      :class="['segment', { active: option.value === model }]"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { TOKEN_STANDARDS, type TokenStandard } from '~/utils/batchTransfer'

const model = defineModel<TokenStandard>({ required: true })
</script>

<style scoped>
.standard-picker {
  display: inline-flex;
  gap: 0;
  border: var(--border);
  border-radius: var(--border-radius);
  overflow: hidden;
  width: 100%;
}

.segment {
  flex: 1;
  appearance: none;
  background: transparent;
  border: 0;
  border-inline-end: var(--border);
  color: var(--muted);
  font: inherit;
  font-size: var(--ui-font-size);
  text-transform: var(--ui-text-transform);
  letter-spacing: var(--ui-letter-spacing);
  padding-block: var(--ui-padding-block);
  padding-inline: var(--ui-padding-inline);
  cursor: pointer;
  transition:
    color var(--speed, 0.15s),
    background var(--speed, 0.15s);
}

.segment:last-child {
  border-inline-end: 0;
}

.segment:hover {
  color: var(--color);
  background: var(--gray-z-1);
}

.segment.active {
  color: var(--white);
  background: var(--color);
}
</style>
