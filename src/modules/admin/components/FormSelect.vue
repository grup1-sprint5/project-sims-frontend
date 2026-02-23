<template>
  <FormField :label="label" :error="error">
    <select
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300
             focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm
             disabled:bg-gray-50 disabled:text-gray-500
             dark:bg-gray-800 dark:text-white dark:ring-gray-700"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <slot />
    </select>
  </FormField>
</template>

<script setup lang="ts">
import FormField from './FormField.vue'

defineProps<{
  modelValue: string | number | boolean
  label?: string
  placeholder?: string
  error?: string | null
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()
</script>
