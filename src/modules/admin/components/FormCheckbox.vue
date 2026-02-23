<template>
  <div class="flex items-center gap-2 mb-3">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600
             dark:border-gray-600 dark:bg-gray-800"
    />
    <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-200">
      {{ label }}
    </label>
    <p v-if="error" class="ml-2 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label?: string
  error?: string | null
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>
