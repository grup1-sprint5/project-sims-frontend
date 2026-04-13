<template>
  <div
    class="border-b border-[var(--app-border)] pb-5 sm:flex sm:items-center sm:justify-between"
  >
    <div>
      <h3 class="text-base font-semibold text-[var(--app-text)]">
        {{ title }}
      </h3>

      <p
        v-if="description"
        class="mt-1 text-sm text-[var(--app-muted-text)]"
      >
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.actions" class="mt-3 flex sm:mt-0 sm:ml-4 gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
