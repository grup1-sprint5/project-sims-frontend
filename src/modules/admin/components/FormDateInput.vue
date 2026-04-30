<template>
  <input
    type="text"
    :value="formattedValue"
    :placeholder="placeholder"
    @input="handleInput"
    @change="handleChange"
    class="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300
           placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm
           dark:bg-gray-800 dark:text-white dark:ring-gray-700"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'dd/mm/yyyy --:--',
})

const emit = defineEmits<Emits>()

const formattedValue = computed(() => {
  if (!props.modelValue) return ''
  try {
    const date = new Date(props.modelValue)
    if (isNaN(date.getTime())) return ''
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return ''
  }
})

const handleInput = (event: Event) => {
  const input = (event.target as HTMLInputElement).value
  emit('update:modelValue', input)
}

const handleChange = () => {
  // Try to parse and normalize the date format
  const input = props.modelValue.trim()
  if (!input) {
    emit('update:modelValue', '')
    return
  }

  try {
    // Support formats: dd/mm/yyyy hh:mm or dd/mm/yyyy
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?$/
    const match = input.match(regex)
    
    if (!match) {
      // Invalid format, keep as-is for user to correct
      return
    }

    const dayStr = match[1]
    const monthStr = match[2]
    const yearStr = match[3]

    if (!dayStr || !monthStr || !yearStr) return

    const day = parseInt(dayStr, 10)
    const month = parseInt(monthStr, 10)
    const year = parseInt(yearStr, 10)
    const hours = match[4] ? parseInt(match[4], 10) : 0
    const minutes = match[5] ? parseInt(match[5], 10) : 0

    // Validate ranges
    if (month < 1 || month > 12 || day < 1 || day > 31 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return
    }

    // Create ISO date string
    const date = new Date(year, month - 1, day, hours, minutes)
    if (isNaN(date.getTime())) return

    // Emit as ISO string
    const isoString = date.toISOString().split('T')[0] + 'T' + `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    emit('update:modelValue', isoString)
  } catch {
    // Parsing error, keep as-is
  }
}
</script>
