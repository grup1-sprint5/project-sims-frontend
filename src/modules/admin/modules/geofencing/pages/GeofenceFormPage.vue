<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="mb-6">
      <router-link to="/admin/geofences" class="text-sm text-indigo-500 hover:text-indigo-700">← {{ m.adminGeofenceFormUi.back }}</router-link>
    </div>

    <PageHeading :title="isEditMode ? m.adminGeofenceFormUi.editTitle : m.adminGeofenceFormUi.createTitle" :description="m.adminGeofenceFormUi.description" />

    <div v-if="loading" class="mt-6 text-sm text-[var(--app-muted-text)]">{{ m.adminGeofenceFormUi.loading }}</div>

    <form v-else class="mt-6 space-y-6 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:p-6" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField :label="m.adminGeofenceFormUi.name">
          <FormInput v-model="form.name" type="text" :placeholder="m.adminGeofenceFormUi.namePlaceholder" />
          <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
        </FormField>

        <FormField :label="m.adminGeofenceFormUi.type">
          <FormSelect :model-value="form.type" @update:model-value="handleTypeChange">
            <option value="circle">{{ m.adminGeofenceFormUi.typeCircle }}</option>
            <option value="polygon">{{ m.adminGeofenceFormUi.typePolygon }}</option>
          </FormSelect>
        </FormField>

        <FormField :label="m.adminGeofenceFormUi.ruleType">
          <FormSelect v-model="form.rule_type">
            <option v-for="option in ruleOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </FormSelect>
        </FormField>

        <FormField :label="m.adminGeofenceFormUi.hysteresis">
          <input
            v-model.number="form.hysteresis_m"
            type="number"
            min="0"
            step="1"
            class="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
          />
          <p v-if="errors.hysteresis_m" class="mt-1 text-xs text-red-500">{{ errors.hysteresis_m }}</p>
        </FormField>
      </div>

      <FormField :label="m.commonUi.status">
        <FormCheckbox v-model="form.active" />
      </FormField>

      <section class="rounded-lg border border-[var(--app-border)] p-4">
        <h3 class="text-sm font-semibold">{{ m.adminGeofenceFormUi.geometry }}</h3>

        <div class="mt-4 space-y-3">
          <GeofenceMapEditor
            :type="form.type"
            :polygon-points="form.polygonPoints"
            :center="form.center"
            :radius-m="form.radius_m"
            @update:geometry="handleGeometryUpdate"
          />

          <p v-if="form.type === 'circle' && form.radius_m !== null" class="text-xs text-[var(--app-muted-text)]">
            {{ m.adminGeofenceFormUi.currentRadius }}: {{ Math.round(form.radius_m) }}m
          </p>

          <p v-if="errors.polygonPoints" class="text-xs text-red-500">{{ errors.polygonPoints }}</p>
          <p v-if="errors.center" class="text-xs text-red-500">{{ errors.center }}</p>
          <p v-if="errors.radius_m" class="text-xs text-red-500">{{ errors.radius_m }}</p>
        </div>
      </section>

      <section class="rounded-lg border border-[var(--app-border)] p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold">{{ m.adminGeofenceFormUi.schedule }}</h3>
          <FormCheckbox v-model="form.scheduleEnabled" />
        </div>

        <div v-if="form.scheduleEnabled" class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField :label="m.adminGeofenceFormUi.timezone">
            <FormInput v-model="form.schedule.timezone" type="text" placeholder="Europe/Madrid" />
          </FormField>

          <FormField :label="m.adminGeofenceFormUi.days">
            <div class="flex flex-wrap gap-2">
              <label v-for="day in dayOptions" :key="day.value" class="inline-flex items-center gap-1 rounded-md border border-[var(--app-border)] px-2 py-1 text-xs">
                <input v-model="form.schedule.days" type="checkbox" :value="day.value" />
                {{ day.label }}
              </label>
            </div>
          </FormField>

          <FormField :label="m.adminGeofenceFormUi.start">
            <FormInput v-model="form.schedule.start" type="time" />
          </FormField>

          <FormField :label="m.adminGeofenceFormUi.end">
            <FormInput v-model="form.schedule.end" type="time" />
          </FormField>

          <p v-if="errors.schedule" class="text-xs text-red-500 md:col-span-2">{{ errors.schedule }}</p>
        </div>
      </section>

      <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

      <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <router-link to="/admin/geofences" class="rounded-md border border-[var(--app-border)] px-4 py-2 text-center text-sm">{{ m.commonUi.cancel }}</router-link>
        <button type="submit" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500" :disabled="saving">
          {{ saving ? m.adminGeofenceFormUi.saving : (isEditMode ? m.adminGeofenceFormUi.saveChanges : m.adminGeofenceFormUi.createCta) }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import FormField from '@/modules/admin/components/FormField.vue'
import FormInput from '@/modules/admin/components/FormInput.vue'
import FormSelect from '@/modules/admin/components/FormSelect.vue'
import FormCheckbox from '@/modules/admin/components/FormCheckbox.vue'
import GeofenceMapEditor from '../components/GeofenceMapEditor.vue'
import { useGeofencing } from '../composables/useGeofencing'
import { hasValidationErrors, validateGeofenceForm } from '../composables/useGeofenceValidation'
import type { CreateGeofencePayload, GeofenceFormModel, GeofencePoint, GeofenceValidationErrors } from '../interfaces/geofencing.interface'

const { m } = useI18n()

const route = useRoute()
const router = useRouter()

const { loading, saving, error, getGeofence, createGeofence, updateGeofence } = useGeofencing()

const isEditMode = computed(() => Boolean(route.params.id))
const routeTenantId = computed(() => typeof route.query.tenant_id === 'string' ? route.query.tenant_id : null)

const form = reactive<GeofenceFormModel>({
  name: '',
  type: 'circle',
  rule_type: 'allow',
  active: true,
  hysteresis_m: 10,
  polygonPoints: [],
  center: { lat: null, lng: null },
  radius_m: null,
  scheduleEnabled: false,
  schedule: {
    timezone: 'Europe/Madrid',
    days: [1, 2, 3, 4, 5],
    start: '08:00',
    end: '18:00',
  },
})

const errors = ref<GeofenceValidationErrors>({})

const ruleOptions = [
  { value: 'allow', label: m.value.adminGeofenceFormUi.ruleAllow },
  { value: 'forbid', label: m.value.adminGeofenceFormUi.ruleForbid },
]

const dayOptions = [
  { value: 1, label: m.value.adminGeofenceFormUi.dayMon },
  { value: 2, label: m.value.adminGeofenceFormUi.dayTue },
  { value: 3, label: m.value.adminGeofenceFormUi.dayWed },
  { value: 4, label: m.value.adminGeofenceFormUi.dayThu },
  { value: 5, label: m.value.adminGeofenceFormUi.dayFri },
  { value: 6, label: m.value.adminGeofenceFormUi.daySat },
  { value: 7, label: m.value.adminGeofenceFormUi.daySun },
]

onMounted(async () => {
  if (!isEditMode.value) return
  const record = await getGeofence(String(route.params.id), routeTenantId.value)
  if (!record) return

  form.name = record.name
  form.type = record.type
  form.rule_type = record.rule_type
  form.active = record.active
  form.hysteresis_m = record.hysteresis_m ?? 0

  form.center = {
    lat: record.center?.lat ?? null,
    lng: record.center?.lng ?? null,
  }
  form.radius_m = record.radius_m ?? null
  form.polygonPoints = extractPolygonPoints(record)

  if (record.schedule) {
    form.scheduleEnabled = true
    form.schedule = {
      timezone: record.schedule.timezone,
      days: record.schedule.days
        .map((day) => Number(day))
        .filter((day): day is 1 | 2 | 3 | 4 | 5 | 6 | 7 => Number.isInteger(day) && day >= 1 && day <= 7),
      start: record.schedule.start,
      end: record.schedule.end,
    }
  }
})

const handleGeometryUpdate = (geometry: {
  polygonPoints: GeofencePoint[]
  center: { lat: number | null; lng: number | null }
  radius_m: number | null
}) => {
  form.polygonPoints = geometry.polygonPoints
  form.center = geometry.center
  form.radius_m = geometry.radius_m
}

const resetGeometry = () => {
  form.polygonPoints = []
  form.center = { lat: null, lng: null }
  form.radius_m = null
}

const handleTypeChange = (type: string) => {
  if (type !== 'circle' && type !== 'polygon') return

  form.type = type
  resetGeometry()
}

const extractPolygonPoints = (record: Awaited<ReturnType<typeof getGeofence>>): GeofencePoint[] => {
  if (!record || record.type !== 'polygon') return []

  const ring = record.geometry_geojson?.coordinates?.[0] || record.polygon || record.coordinates || []

  return ring
    .filter((point): point is number[] => Array.isArray(point) && point.length >= 2)
    .map((point) => ({ lng: Number(point[0]), lat: Number(point[1]) }))
    .filter((point) => Number.isFinite(point.lng) && Number.isFinite(point.lat))
}

const buildPayload = (): CreateGeofencePayload => {
  const payload: CreateGeofencePayload = {
    name: form.name.trim(),
    type: form.type,
    rule_type: form.rule_type,
    active: form.active,
    hysteresis_m: Number(form.hysteresis_m),
    schedule: form.scheduleEnabled ? { ...form.schedule } : null,
  }

  if (form.type === 'polygon') {
    payload.polygon = form.polygonPoints
      .filter((point) => Number.isFinite(point.lng) && Number.isFinite(point.lat))
      .map((point) => [Number(point.lng), Number(point.lat)])
  } else if (form.center.lat !== null && form.center.lng !== null && form.radius_m !== null) {
    payload.center = { lat: Number(form.center.lat), lng: Number(form.center.lng) }
    payload.radius_m = Number(form.radius_m)
  }

  return payload
}

const handleSubmit = async () => {
  errors.value = validateGeofenceForm(form)
  if (hasValidationErrors(errors.value)) return

  const payload = buildPayload()

  if (isEditMode.value) {
    await updateGeofence(String(route.params.id), payload, routeTenantId.value)
  } else {
    await createGeofence(payload)
  }

  router.push('/admin/geofences')
}
</script>
