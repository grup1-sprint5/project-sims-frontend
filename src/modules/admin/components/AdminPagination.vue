<template>
  <nav
    class="flex items-center justify-between border-t border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 sm:px-6"
    :aria-label="m.commonUi.pagination"
  >
    <!-- Info -->
    <div class="hidden sm:block">
      <p class="text-sm text-[var(--app-muted-text)]">
        {{ m.commonUi.showing }}
        <span class="font-medium">{{ from }}</span>
        {{ m.commonUi.to }}
        <span class="font-medium">{{ to }}</span>
        {{ m.commonUi.of }}
        <span class="font-medium">{{ total }}</span>
        {{ m.commonUi.results }}
      </p>
    </div>

    <!-- Controls -->
    <div class="flex flex-1 justify-between sm:justify-end gap-3">
      <button
        type="button"
         class="relative inline-flex items-center rounded-md bg-[var(--app-surface)] px-3 py-2 text-sm font-semibold
           text-[var(--app-text)] inset-ring inset-ring-[var(--app-border)] hover:bg-[var(--app-surface-alt)]
               disabled:opacity-50 disabled:cursor-not-allowed
           transition-colors"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
      >
        {{ m.commonUi.previous }}
      </button>

      <button
        type="button"
         class="relative inline-flex items-center rounded-md bg-[var(--app-surface)] px-3 py-2 text-sm font-semibold
           text-[var(--app-text)] inset-ring inset-ring-[var(--app-border)] hover:bg-[var(--app-surface-alt)]
               disabled:opacity-50 disabled:cursor-not-allowed
           transition-colors"
        :disabled="page >= totalPages"
        @click="emit('update:page', page + 1)"
      >
        {{ m.commonUi.next }}
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'

const { m } = useI18n()

const props = defineProps<{
  page: number
  perPage: number
  total: number
}>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
}>()

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.perPage))
)

const from = computed(() =>
  props.total === 0 ? 0 : (props.page - 1) * props.perPage + 1
)

const to = computed(() =>
  Math.min(props.page * props.perPage, props.total)
)
</script>
