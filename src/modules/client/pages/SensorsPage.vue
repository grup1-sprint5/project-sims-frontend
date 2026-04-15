<template>
  <div class="min-h-screen px-4 py-8" style="background:var(--app-bg);color:var(--app-text);">
    <div class="mx-auto max-w-4xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">{{ m.sensorsUi.title }}</h1>
          <p class="mt-1 text-sm text-gray-400">
            {{ m.sensorsUi.subtitle }}
          </p>
        </div>

        <button
          type="button"
          class="rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
          style="background:var(--app-surface-alt);color:var(--app-text);border:1px solid var(--app-border);"
          :disabled="loadingDevices"
          @click="reload"
        >
          {{ m.sensorsUi.reload }}
        </button>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="sm:col-span-1 rounded-xl p-4" style="background:var(--app-card-bg);border:1px solid var(--app-card-border);">
          <div class="text-sm font-semibold">{{ m.sensorsUi.device }}</div>
          <div class="mt-2">
            <div v-if="loadingDevices" class="text-sm text-gray-400">{{ m.sensorsUi.loadingDevices }}</div>
            <div v-else-if="!hasDevices" class="text-sm text-gray-400">{{ m.sensorsUi.noDevices }}</div>

            <select
              v-else
              v-model="selectedDeviceId"
              class="mt-1 w-full rounded-lg px-3 py-2 text-sm focus:outline-2 focus:outline-indigo-500"
              style="background:var(--app-input-bg);color:var(--app-input-text);border:1px solid var(--app-input-border);"
              @change="onDeviceChange"
            >
              <option v-for="d in devices" :key="d" :value="d">{{ d }}</option>
            </select>

            <p class="mt-2 text-xs text-gray-500">
              Endpoint: <span class="text-gray-300">/api/sensor-data/devices</span>
            </p>
          </div>
        </div>

        <div class="sm:col-span-2 rounded-xl p-4" style="background:var(--app-card-bg);border:1px solid var(--app-card-border);">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="text-sm font-semibold">{{ m.sensorsUi.latestReading }}</div>
              <div class="mt-1 text-xs text-gray-400">
                <span v-if="lastUpdatedAt">{{ m.sensorsUi.updated }}: {{ lastUpdatedAt.toLocaleTimeString() }}</span>
                <span v-else>{{ m.sensorsUi.notUpdated }}</span>
              </div>
            </div>

            <div class="text-xs" :class="pollingClass">
              {{ pollingLabel }}
            </div>
          </div>

          <div v-if="error" class="mt-4 rounded-lg px-3 py-2 text-sm" style="background:color-mix(in srgb, #ef4444 12%, var(--app-card-bg));color:#b91c1c;border:1px solid color-mix(in srgb, #ef4444 35%, var(--app-border));">
            {{ error }}
          </div>

          <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="rounded-lg p-4" style="background:var(--app-surface-alt);border:1px solid var(--app-border);">
              <div class="text-xs uppercase tracking-wide text-gray-400">{{ m.sensorsUi.distance }}</div>
              <div class="mt-2 text-3xl font-bold">
                <span v-if="latest">{{ formatValue(latest.value) }}</span>
                <span v-else class="text-gray-500">—</span>
                <span class="ml-1 text-base font-medium text-gray-300">{{ latest?.unit || 'cm' }}</span>
              </div>
            </div>

            <div class="rounded-lg p-4" style="background:var(--app-surface-alt);border:1px solid var(--app-border);">
              <div class="text-xs uppercase tracking-wide text-gray-400">{{ m.sensorsUi.sensorType }}</div>
              <div class="mt-2 text-lg font-semibold">
                <span v-if="latest">{{ latest.sensor_type }}</span>
                <span v-else class="text-gray-500">—</span>
              </div>
            </div>

            <div class="rounded-lg p-4" style="background:var(--app-surface-alt);border:1px solid var(--app-border);">
              <div class="text-xs uppercase tracking-wide text-gray-400">{{ m.sensorsUi.timestamp }}</div>
              <div class="mt-2 text-sm text-gray-200">
                <span v-if="latest">{{ latest.timestamp || latest.created_at || '—' }}</span>
                <span v-else class="text-gray-500">—</span>
              </div>
            </div>
          </div>

          <div class="mt-4 text-xs text-gray-500">
            Polling: <span class="text-gray-300">/api/sensor-data/devices/{{ selectedDeviceId }}/latest</span>
          </div>

          <div class="mt-6 flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              :disabled="!selectedDeviceId"
              @click="start"
            >
              {{ m.sensorsUi.start }}
            </button>
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
              style="background:var(--app-surface-alt);color:var(--app-text);border:1px solid var(--app-border);"
              @click="stop"
            >
              {{ m.sensorsUi.stop }}
            </button>
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
              style="background:var(--app-surface-alt);color:var(--app-text);border:1px solid var(--app-border);"
              :disabled="loadingLatest || !selectedDeviceId"
              @click="refreshOnce"
            >
              {{ m.sensorsUi.refreshNow }}
            </button>

            <div class="ml-auto text-xs text-gray-400" v-if="loadingLatest">{{ m.sensorsUi.loading }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useSensorData } from '../composables/useSensorData'
import { useI18n } from '@/i18n'

const { m } = useI18n()

const {
  devices,
  selectedDeviceId,
  latest,
  hasDevices,
  loadingDevices,
  loadingLatest,
  error,
  lastUpdatedAt,
  fetchDevices,
  fetchLatest,
  startPolling,
  stopPolling,
} = useSensorData(2000)

const isPolling = ref(false)

const start = () => {
  if (!selectedDeviceId.value) return
  startPolling()
  isPolling.value = true
}

const stop = () => {
  stopPolling()
  isPolling.value = false
}

const reload = async () => {
  stop()
  await fetchDevices()
  if (selectedDeviceId.value) {
    await fetchLatest()
  }
}

const refreshOnce = async () => {
  await fetchLatest()
}

const onDeviceChange = async () => {
  stop()
  await fetchLatest()
  start()
}

watch(selectedDeviceId, async () => {
  // if device is cleared, stop polling
  if (!selectedDeviceId.value) stop()
})

onMounted(async () => {
  await fetchDevices()
  if (selectedDeviceId.value) {
    await fetchLatest()
    start()
  }
})

const pollingLabel = computed(() => (isPolling.value ? m.value.sensorsUi.live : m.value.sensorsUi.paused))
const pollingClass = computed(() =>
  isPolling.value ? 'text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/25 px-2 py-1 rounded-md border border-green-300 dark:border-green-700'
    : 'text-[var(--app-text)] bg-[var(--app-surface-alt)] px-2 py-1 rounded-md border border-[var(--app-border)]'
)

const formatValue = (v: any) => {
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  return n.toFixed(2)
}
</script>
