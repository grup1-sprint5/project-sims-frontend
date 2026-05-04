<template>
  <span
    :class="[
      'inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide',
      badgeClass,
    ]"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import type { GeofenceEventType } from '../interfaces/geofencing.interface'

const props = defineProps<{
  eventType: GeofenceEventType
}>()

const { m } = useI18n()

const badgeClass = computed(() => {
  if (props.eventType === 'enter') return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
  if (props.eventType === 'violation') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
  return 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200'
})

const label = computed(() => {
  if (props.eventType === 'enter') return m.value.adminGeofenceEventsUi.enter
  if (props.eventType === 'exit') return m.value.adminGeofenceEventsUi.exit
  return m.value.adminGeofenceEventsUi.violation
})
</script>
