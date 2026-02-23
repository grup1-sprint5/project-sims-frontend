<template>
  <div class="form-field">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-200">{{ label }}</label>
    <div class="mt-1">
      <slot />
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label?: string
  error?: string | null
}>()
</script>

<style scoped>
.form-field { margin-bottom: 0.75rem }
</style>
