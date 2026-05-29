<template>
  <div class="transfer-rows stack">
    <div class="rows">
      <div
        class="row head"
        :style="gridStyle"
      >
        <span
          v-for="field in fields"
          :key="field"
          class="col-label"
          >{{ labelFor(field) }}</span
        >
        <span aria-hidden="true" />
      </div>

      <div
        v-for="(row, index) in model"
        :key="index"
        class="row"
        :style="gridStyle"
      >
        <template
          v-for="field in fields"
          :key="field"
        >
          <EvmAddressInput
            v-if="field === 'to'"
            v-model="row.to"
            placeholder="0x… or name.eth"
            autocomplete="off"
            spellcheck="false"
          />
          <input
            v-else
            v-model="row[field]"
            type="number"
            min="0"
            :step="field === 'amount' && standard === 'erc20' ? 'any' : '1'"
            :placeholder="placeholderFor(field)"
            inputmode="decimal"
          />
        </template>

        <button
          type="button"
          class="tertiary small remove"
          :disabled="model.length <= 1"
          title="Remove row"
          @click="removeRow(index)"
        >
          ×
        </button>
      </div>
    </div>

    <div class="row-actions">
      <Button
        type="button"
        class="small secondary"
        @click="addRow"
      >
        <span>Add row</span>
      </Button>

      <Button
        type="button"
        class="small tertiary"
        @click="importOpen = !importOpen"
      >
        <span>Paste a list</span>
      </Button>
    </div>

    <div
      v-if="importOpen"
      class="import stack"
    >
      <FormTextarea
        v-model="importText"
        :rows="5"
        :placeholder="importPlaceholder"
        spellcheck="false"
      />
      <p class="muted hint">
        One entry per line. Fields separated by comma or space, in the order:
        <code>{{ formatHint }}</code>
      </p>
      <div class="row-actions">
        <Button
          type="button"
          class="small"
          :disabled="!importText.trim()"
          @click="applyImport(true)"
        >
          Replace rows
        </Button>
        <Button
          type="button"
          class="small secondary"
          :disabled="!importText.trim()"
          @click="applyImport(false)"
        >
          Append
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TokenStandard } from '~/utils/batchTransfer'
import { emptyRow, type TransferRow } from '~/utils/transferRow'

type Field = 'id' | 'amount' | 'to'

const props = defineProps<{
  standard: TokenStandard
  mode: 'single' | 'many'
  symbol?: string
}>()

const model = defineModel<TransferRow[]>({ required: true })

// Which columns this standard + mode needs, in display order.
const fields = computed<Field[]>(() => {
  const many = props.mode === 'many'
  if (props.standard === 'erc721') return many ? ['id', 'to'] : ['id']
  if (props.standard === 'erc1155')
    return many ? ['id', 'amount', 'to'] : ['id', 'amount']
  // erc20: recipients always; per-row amount only in "custom" (many) mode.
  return many ? ['to', 'amount'] : ['to']
})

const gridStyle = computed(() => {
  const cols = fields.value
    .map((field) => (field === 'to' ? 'minmax(0, 2fr)' : 'minmax(0, 1fr)'))
    .join(' ')
  return { gridTemplateColumns: `${cols} var(--size-7)` }
})

const labelFor = (field: Field) => {
  if (field === 'to') return 'Recipient'
  if (field === 'id') return 'Token ID'
  return props.standard === 'erc20'
    ? props.symbol
      ? `Amount (${props.symbol})`
      : 'Amount'
    : 'Quantity'
}

const placeholderFor = (field: Field) => {
  if (field === 'id') return '#'
  return props.standard === 'erc20' ? '0.0' : '1'
}

const addRow = () => {
  model.value = [...model.value, emptyRow()]
}

const removeRow = (index: number) => {
  if (model.value.length <= 1) return
  const next = [...model.value]
  next.splice(index, 1)
  model.value = next
}

// --- Bulk paste import ---
const importOpen = ref(false)
const importText = ref('')

const formatHint = computed(() => fields.value.join(', '))
const importPlaceholder = computed(() => {
  const examples: Record<Field, string> = {
    id: '42',
    amount: props.standard === 'erc20' ? '1.5' : '3',
    to: '0xabc…',
  }
  const line = fields.value.map((field) => examples[field]).join(', ')
  return `${line}\n${line}`
})

const applyImport = (replace: boolean) => {
  const parsed: TransferRow[] = importText.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[\s,]+/).filter(Boolean)
      const row = emptyRow()
      fields.value.forEach((field, i) => {
        if (parts[i] !== undefined) row[field] = parts[i]!
      })
      return row
    })
    .filter((row) => fields.value.some((field) => row[field] !== ''))

  if (parsed.length === 0) return
  model.value = replace ? parsed : [...model.value, ...parsed]
  importText.value = ''
  importOpen.value = false
}
</script>

<style scoped>
.rows {
  display: flex;
  flex-direction: column;
  gap: var(--spacer-sm);
}

.row {
  display: grid;
  gap: var(--spacer-sm);
  align-items: start;
}

.row.head {
  padding-inline-end: 0;
}

.col-label {
  font-size: var(--font-xs);
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-md);
}

.row .remove {
  align-self: start;
  block-size: var(--size-7);
  inline-size: var(--size-7);
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-lg);
  line-height: 1;
}

.row-actions {
  display: flex;
  gap: var(--spacer-sm);
  flex-wrap: wrap;
}

.import {
  border: var(--border);
  border-radius: var(--border-radius);
  padding: var(--spacer);
}

.hint {
  font-size: var(--font-xs);
}

.hint code {
  color: var(--color);
}

@media (max-width: 540px) {
  .row.head {
    display: none;
  }

  .row {
    grid-template-columns: 1fr var(--size-7) !important;
    padding-block-end: var(--spacer-sm);
    border-block-end: var(--border);
  }

  .row .remove {
    grid-row: 1;
    grid-column: 2;
  }
}
</style>
