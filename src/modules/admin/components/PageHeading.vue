<template>
  <div
    class="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between
           dark:border-white/10"
  >
    <div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-white">
        {{ title }}
      </h3>

      <p
        v-if="description"
        class="mt-1 text-sm text-gray-500 dark:text-gray-400"
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
