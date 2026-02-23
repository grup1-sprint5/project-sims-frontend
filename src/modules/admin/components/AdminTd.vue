<template>
  <td :class="classes">
    <slot />
  </td>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'muted' | 'actions'
  first?: boolean
}>()

const base = 'py-4 text-sm whitespace-nowrap'
const first = 'pr-3 pl-4 sm:pl-0'
const middle = 'px-3'
const actions = 'pr-4 pl-3 sm:pr-0 text-right font-medium'

const classes =
  props.variant === 'actions'
    ? `${base} ${actions}`
    : props.first
      ? `${base} ${first} ${props.variant === 'primary' ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`
      : `${base} ${middle} ${props.variant === 'primary' ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`
</script>
