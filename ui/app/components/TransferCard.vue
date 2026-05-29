<template>
  <Card class="transfer-card">
    <div class="stack">
      <!-- 1 · Token + standard -->
      <section class="step stack">
        <h2 class="step-title"><span class="step-n">1</span> Token</h2>

        <StandardPicker v-model="standard" />

        <label class="field">
          <span class="field-label">Contract address</span>
          <input
            v-model="tokenAddress"
            type="text"
            placeholder="0x… token contract"
            autocomplete="off"
            spellcheck="false"
            class="mono-break"
          />
        </label>

        <p
          v-if="tokenLabel"
          class="muted token-meta"
        >
          {{ tokenLabel }}
        </p>

        <label
          v-if="standard === 'erc721'"
          class="switch-row"
        >
          <FormSwitch v-model="safe" />
          <span>
            Safe transfer
            <small class="muted"
              >: calls <code>onERC721Received</code>. Disable for contracts that
              don't implement it.</small
            >
          </span>
        </label>
      </section>

      <hr />

      <!-- 2 · Destination -->
      <section class="step stack">
        <h2 class="step-title">
          <span class="step-n">2</span> {{ destinationHeading }}
        </h2>

        <div
          class="mode-toggle"
          role="radiogroup"
          :aria-label="destinationHeading"
        >
          <button
            type="button"
            role="radio"
            :aria-checked="mode === 'single'"
            :class="['segment', { active: mode === 'single' }]"
            @click="mode = 'single'"
          >
            {{ modeLabels.single }}
          </button>
          <button
            type="button"
            role="radio"
            :aria-checked="mode === 'many'"
            :class="['segment', { active: mode === 'many' }]"
            @click="mode = 'many'"
          >
            {{ modeLabels.many }}
          </button>
        </div>

        <label
          v-if="standard !== 'erc20' && mode === 'single'"
          class="field"
        >
          <span class="field-label">Recipient</span>
          <EvmAddressInput
            v-model="recipient"
            placeholder="0x… or name.eth"
            autocomplete="off"
            spellcheck="false"
          />
        </label>

        <label
          v-if="standard === 'erc20' && mode === 'single'"
          class="field"
        >
          <span class="field-label">
            Amount each{{ symbol ? ` (${symbol})` : '' }}
          </span>
          <input
            v-model="equalAmount"
            type="number"
            min="0"
            step="any"
            inputmode="decimal"
            placeholder="0.0"
          />
        </label>

        <TransferRows
          v-model="rows"
          :standard="standard"
          :mode="mode"
          :symbol="symbol"
        />
      </section>

      <hr />

      <!-- 3 · Execute -->
      <section class="step stack">
        <h2 class="step-title"><span class="step-n">3</span> Transfer</h2>

        <p
          v-if="summary"
          class="summary"
        >
          {{ summary }}
        </p>

        <Alert
          v-if="isConnected && !contractAddress"
          type="error"
        >
          The Batch Transfer contract isn't configured for this network yet. Set
          its address in <code>app/utils/batchTransfer.ts</code> (or via
          <code>NUXT_PUBLIC_BATCH_TRANSFER_ADDRESS</code>) after deploying.
        </Alert>

        <ClientOnly>
          <EvmConnect v-if="!isConnected" />

          <EvmMultiTransactionFlowDialog
            v-else
            :steps="steps"
            :text="dialogText"
            @complete="onComplete"
          >
            <template #start="{ start }">
              <Button
                class="primary block"
                :disabled="!canTransfer"
                @click="start"
              >
                {{ approveAndTransferLabel }}
              </Button>
            </template>
          </EvmMultiTransactionFlowDialog>

          <template #fallback>
            <Button
              class="primary block"
              disabled
              >Connect a wallet</Button
            >
          </template>
        </ClientOnly>
      </section>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  erc20Abi,
  erc721Abi,
  getAddress,
  isAddress,
  parseUnits,
  type Address,
  type Hash,
} from 'viem'
import { normalize } from 'viem/ens'
import { readContract, writeContract, getEnsAddress } from '@wagmi/core'
import { useConfig, useConnection } from '@wagmi/vue'
import { batchTransferAbi, erc1155Abi } from '~/utils/batchTransferAbi'
import {
  BATCH_TRANSFER_ADDRESSES,
  type TokenStandard,
} from '~/utils/batchTransfer'
import { emptyRow, type TransferRow } from '~/utils/transferRow'
import { baseInputToQuery, queryToBaseInput } from '~/utils/queryState'

const config = useConfig()
const { address, isConnected } = useConnection()
const chainId = useMainChainId()
const runtime = useRuntimeConfig()
const toast = useToast()
const route = useRoute()
const router = useRouter()

// --- Form state (the base input is seeded from the URL query, so a prepared
// link arrives with token/standard/recipient/etc. already filled in) ---
const initial = queryToBaseInput(route.query)
const standard = ref<TokenStandard>(initial.standard)
const mode = ref<'single' | 'many'>(initial.mode)
const safe = ref(initial.safe)
const tokenAddress = ref(initial.tokenAddress)
const recipient = ref(initial.recipient)
const equalAmount = ref(initial.amount)
const rows = ref<TransferRow[]>([emptyRow()])

// Mirror the base input back into the URL so the current configuration is
// always shareable. `replace` (not `push`) keeps it out of the history stack.
watch([standard, mode, safe, tokenAddress, recipient, equalAmount], () => {
  router.replace({
    path: route.path,
    query: baseInputToQuery({
      standard: standard.value,
      mode: mode.value,
      safe: safe.value,
      tokenAddress: tokenAddress.value,
      recipient: recipient.value,
      amount: equalAmount.value,
    }),
  })
})

// Reset rows to a clean slate when the standard changes; the column shape
// (and therefore the meaning of each field) differs per standard.
watch(standard, () => {
  rows.value = [emptyRow()]
})

// --- Deployed contract address for the active chain ---
const contractAddress = computed<Address | undefined>(() => {
  const override = runtime.public.batchTransferAddress as string
  if (override && isAddress(override)) return getAddress(override)
  return BATCH_TRANSFER_ADDRESSES[chainId]
})

const tokenAddressValid = computed(() => isAddress(tokenAddress.value.trim()))
const token = computed<Address | undefined>(() =>
  tokenAddressValid.value ? getAddress(tokenAddress.value.trim()) : undefined,
)

// --- Token metadata (best-effort, for display + ERC-20 decimals) ---
const meta = reactive<{ symbol: string; name: string; decimals: number }>({
  symbol: '',
  name: '',
  decimals: 18,
})
const symbol = computed(() => (standard.value === 'erc20' ? meta.symbol : ''))

watch(
  [token, standard],
  async ([tokenAddr, std]) => {
    meta.symbol = ''
    meta.name = ''
    meta.decimals = 18
    if (!tokenAddr) return

    const requested = tokenAddr
    try {
      if (std === 'erc20') {
        const [decimals, sym] = await Promise.all([
          readContract(config, {
            address: tokenAddr,
            abi: erc20Abi,
            functionName: 'decimals',
            chainId,
          }),
          readContract(config, {
            address: tokenAddr,
            abi: erc20Abi,
            functionName: 'symbol',
            chainId,
          }).catch(() => ''),
        ])
        if (token.value !== requested) return
        meta.decimals = Number(decimals)
        meta.symbol = sym as string
      } else if (std === 'erc721') {
        const name = await readContract(config, {
          address: tokenAddr,
          abi: erc721Abi,
          functionName: 'name',
          chainId,
        }).catch(() => '')
        if (token.value !== requested) return
        meta.name = name as string
      }
    } catch {
      // Non-conforming or unreachable contract: leave metadata blank.
    }
  },
  { immediate: true },
)

const tokenLabel = computed(() => {
  if (!token.value) return ''
  if (standard.value === 'erc20')
    return meta.symbol ? `${meta.symbol} · ${meta.decimals} decimals` : ''
  return meta.name
})

// --- Labels that adapt to the standard ---
const destinationHeading = computed(() =>
  standard.value === 'erc20' ? 'Recipients & amounts' : 'Recipients',
)
const modeLabels = computed(() =>
  standard.value === 'erc20'
    ? { single: 'Same amount', many: 'Custom amounts' }
    : { single: 'One wallet', many: 'Many wallets' },
)

// --- Normalized, validated entries ---
const cleanRows = computed(() =>
  rows.value.filter((row) => row.id || row.amount || row.to),
)

const looksLikeRecipient = (value: string) => {
  const v = value.trim()
  return isAddress(v) || /\.[a-z]{2,}$/i.test(v)
}

const recipientList = computed(() => {
  if (standard.value !== 'erc20' && mode.value === 'single') {
    return [recipient.value]
  }
  return cleanRows.value.map((row) => row.to)
})

const validationErrors = computed<string[]>(() => {
  const errors: string[] = []
  if (!tokenAddressValid.value)
    errors.push('Enter a valid token contract address.')
  if (cleanRows.value.length === 0) errors.push('Add at least one entry.')

  // Recipients
  for (const r of recipientList.value) {
    if (!looksLikeRecipient(r)) {
      errors.push('Every recipient must be an address or ENS name.')
      break
    }
  }

  // Token ids (721 / 1155)
  if (standard.value !== 'erc20') {
    if (cleanRows.value.some((row) => !/^\d+$/.test(row.id.trim()))) {
      errors.push('Every token ID must be a whole number.')
    }
  }

  // Amounts
  if (standard.value === 'erc1155') {
    if (cleanRows.value.some((row) => !/^\d+$/.test(row.amount.trim()))) {
      errors.push('Every quantity must be a whole number.')
    }
  }
  if (standard.value === 'erc20') {
    if (mode.value === 'single') {
      if (!(Number(equalAmount.value) > 0))
        errors.push('Enter an amount greater than zero.')
    } else if (cleanRows.value.some((row) => !(Number(row.amount) > 0))) {
      errors.push('Every amount must be greater than zero.')
    }
  }

  return errors
})

const isValid = computed(() => validationErrors.value.length === 0)
const canTransfer = computed(
  () => isConnected.value && isValid.value && !!contractAddress.value,
)

// --- Human summary ---
const summary = computed(() => {
  if (!cleanRows.value.length) return ''
  const n = cleanRows.value.length
  if (standard.value === 'erc20') {
    const recipients = recipientList.value.length
    return `Send ${symbol.value || 'tokens'} to ${recipients} recipient${recipients === 1 ? '' : 's'}.`
  }
  const recipients =
    mode.value === 'single'
      ? 1
      : new Set(recipientList.value.map((r) => r.toLowerCase())).size
  const noun = standard.value === 'erc721' ? 'token' : 'token type'
  return `Transfer ${n} ${noun}${n === 1 ? '' : 's'} to ${recipients} recipient${recipients === 1 ? '' : 's'}.`
})

const approveAndTransferLabel = computed(() =>
  isValid.value ? 'Approve & Transfer' : 'Transfer',
)

// --- ENS resolution (cached per run) ---
async function resolveRecipient(raw: string): Promise<Address> {
  const value = raw.trim()
  if (isAddress(value)) return getAddress(value)
  if (!value.includes('.')) throw new Error(`Invalid recipient: ${raw}`)
  let name: string
  try {
    name = normalize(value)
  } catch {
    throw new Error(`Invalid ENS name: ${raw}`)
  }
  const resolved = await getEnsAddress(config, { name, chainId: 1 })
  if (!resolved) throw new Error(`Could not resolve ${raw}.`)
  return resolved
}

async function resolveAll(raws: string[]): Promise<Address[]> {
  const cache = new Map<string, Address>()
  const out: Address[] = []
  for (const raw of raws) {
    const key = raw.trim().toLowerCase()
    if (!cache.has(key)) cache.set(key, await resolveRecipient(raw))
    out.push(cache.get(key)!)
  }
  return out
}

// --- ERC-20 total (for the approval amount) ---
function erc20Total(): bigint {
  if (mode.value === 'single') {
    const each = parseUnits(equalAmount.value || '0', meta.decimals)
    return each * BigInt(recipientList.value.length)
  }
  return cleanRows.value.reduce(
    (sum, row) => sum + parseUnits(row.amount || '0', meta.decimals),
    0n,
  )
}

// --- Build the final batch-transfer call ---
async function buildTransferCall(): Promise<{
  functionName: string
  args: readonly unknown[]
}> {
  const tokenAddr = token.value!
  const ids = cleanRows.value.map((row) => BigInt(row.id))

  if (standard.value === 'erc721') {
    if (mode.value === 'single') {
      const to = await resolveRecipient(recipient.value)
      return {
        functionName: safe.value
          ? 'safeBatchTransferERC721'
          : 'batchTransferERC721',
        args: [tokenAddr, to, ids],
      }
    }
    const tos = await resolveAll(cleanRows.value.map((row) => row.to))
    return {
      functionName: safe.value
        ? 'safeBatchTransferERC721ToMany'
        : 'batchTransferERC721ToMany',
      args: [tokenAddr, tos, ids],
    }
  }

  if (standard.value === 'erc1155') {
    const amounts = cleanRows.value.map((row) => BigInt(row.amount))
    if (mode.value === 'single') {
      const to = await resolveRecipient(recipient.value)
      return {
        functionName: 'batchTransferERC1155',
        args: [tokenAddr, to, ids, amounts],
      }
    }
    const tos = await resolveAll(cleanRows.value.map((row) => row.to))
    return {
      functionName: 'batchTransferERC1155ToMany',
      args: [tokenAddr, tos, ids, amounts],
    }
  }

  // ERC-20
  const tos = await resolveAll(cleanRows.value.map((row) => row.to))
  if (mode.value === 'single') {
    const each = parseUnits(equalAmount.value, meta.decimals)
    return {
      functionName: 'batchTransferERC20Equal',
      args: [tokenAddr, tos, each],
    }
  }
  const amounts = cleanRows.value.map((row) =>
    parseUnits(row.amount, meta.decimals),
  )
  return { functionName: 'batchTransferERC20', args: [tokenAddr, tos, amounts] }
}

// --- Approval status read (fresh, at run time) ---
async function isApproved(): Promise<boolean> {
  const owner = address.value
  const spender = contractAddress.value
  const tokenAddr = token.value
  if (!owner || !spender || !tokenAddr) return false

  if (standard.value === 'erc20') {
    const allowance = (await readContract(config, {
      address: tokenAddr,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [owner, spender],
      chainId,
    })) as bigint
    return allowance >= erc20Total()
  }

  const abi = standard.value === 'erc721' ? erc721Abi : erc1155Abi
  return (await readContract(config, {
    address: tokenAddr,
    abi,
    functionName: 'isApprovedForAll',
    args: [owner, spender],
    chainId,
  })) as boolean
}

async function sendApproval(): Promise<Hash> {
  const spender = contractAddress.value!
  const tokenAddr = token.value!
  if (standard.value === 'erc20') {
    // Approve exactly the total this batch needs.
    return writeContract(config, {
      address: tokenAddr,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, erc20Total()],
      chainId,
    })
  }
  const abi = standard.value === 'erc721' ? erc721Abi : erc1155Abi
  return writeContract(config, {
    address: tokenAddr,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: abi as any,
    functionName: 'setApprovalForAll',
    args: [spender, true],
    chainId,
  })
}

async function sendTransfer(): Promise<Hash> {
  const { functionName, args } = await buildTransferCall()
  return writeContract(config, {
    address: contractAddress.value!,
    abi: batchTransferAbi,
    // Dynamic dispatch across many overloads; the exact arg/return types are
    // validated by the contract, not worth threading through wagmi's generics.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    functionName: functionName as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: args as any,
    chainId,
  })
}

const approveLead = computed(() =>
  standard.value === 'erc20'
    ? `Approve Batch Transfer to move your ${symbol.value || 'tokens'}.`
    : 'Approve Batch Transfer to move your tokens on your behalf.',
)

// Shape matches @1001-digital/components.evm's MultiTransactionFlowStep; left
// to inference so the consumer needn't depend on the layer's package directly.
const steps = computed(() => [
  {
    id: 'approve',
    title: 'Approve',
    lead: approveLead.value,
    action: 'Approve',
    skip: isApproved,
    request: sendApproval,
  },
  {
    id: 'transfer',
    title: 'Transfer',
    lead: summary.value,
    action: 'Transfer',
    request: sendTransfer,
  },
])

const dialogText = {
  title: { complete: 'Done' },
  lead: { complete: 'Your batch transfer is confirmed on-chain.' },
}

function onComplete() {
  toast.add({
    variant: 'success',
    title: 'Transfer complete',
    description: summary.value,
    duration: 6000,
  })
}
</script>

<style scoped>
.transfer-card {
  width: 100%;
}

.step-title {
  display: flex;
  align-items: center;
  gap: var(--spacer-sm);
  font-size: var(--font-lg);
}

.step-n {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--size-6);
  block-size: var(--size-6);
  background: var(--color);
  color: var(--white);
  font-size: var(--font-sm);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
}

.field-label {
  font-size: var(--font-xs);
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-md);
}

.token-meta {
  display: flex;
  align-items: center;
  gap: var(--size-1);
  font-size: var(--font-sm);
}

.switch-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacer-sm);
  font-size: var(--font-sm);
  cursor: pointer;
}

.switch-row small {
  display: block;
}

.mode-toggle {
  display: inline-flex;
  width: 100%;
  border: var(--border);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.mode-toggle .segment {
  flex: 1;
  appearance: none;
  background: transparent;
  border: 0;
  border-inline-end: var(--border);
  color: var(--muted);
  font: inherit;
  font-size: var(--ui-font-size);
  padding-block: var(--ui-padding-block);
  cursor: pointer;
}

.mode-toggle .segment:last-child {
  border-inline-end: 0;
}

.mode-toggle .segment.active {
  color: var(--white);
  background: var(--color);
}

.summary {
  font-size: var(--font-sm);
}

hr {
  border: 0;
  border-block-start: var(--border);
  margin: 0;
}
</style>
