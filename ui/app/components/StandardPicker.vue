<template>
  <FormInputGroup
    class="standard-picker"
    role="radiogroup"
    aria-label="Token standard"
  >
    <Button
      v-for="option in TOKEN_STANDARDS"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="option.value === model"
      :class="['segment', option.value === model ? 'primary active' : 'tertiary']"
      @click="model = option.value"
    >
      {{ option.label }}
    </Button>
  </FormInputGroup>
</template>

<script setup lang="ts">
import { TOKEN_STANDARDS, type TokenStandard } from '~/utils/batchTransfer'

const model = defineModel<TokenStandard>({ required: true })
</script>

<style scoped>
.standard-picker {
  inline-size: 100%;
}

.standard-picker :deep(.segment) {
  flex: 1;
}
</style>
