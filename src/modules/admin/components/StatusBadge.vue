<template>
  <span
    :class="[
      'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
      active
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    ]"
  >
    {{ active ? activeText : inactiveText }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean
  activeText?: string
  inactiveText?: string
}>()
</script>
