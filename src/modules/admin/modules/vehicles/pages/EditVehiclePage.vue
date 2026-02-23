<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <PageHeading
      title="Editar vehículo"
      description="Modifica los datos del vehículo"
    >
      <template #actions>
        <router-link
          to="/admin/vehicles"
          class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50
                 dark:bg-white/10 dark:text-white dark:ring-white/5 dark:hover:bg-white/20"
        >
          Volver
        </router-link>
      </template>
    </PageHeading>

    <div v-if="loadingVehicle" class="mt-8 text-center text-gray-500 dark:text-gray-400">
      Cargando vehículo...
    </div>

    <form v-else @submit.prevent="handleSubmit" class="mt-8 max-w-lg space-y-1">
      <FormInput
        v-model="form.license_plate"
        label="Matrícula"
        placeholder="1234ABC o 1234 ABC"
        :error="errors.license_plate"
      />

      <FormInput
        v-model="form.brand"
        label="Marca"
        placeholder="Ej: Toyota"
        :error="errors.brand"
      />

      <FormInput
        v-model="form.model"
        label="Modelo"
        placeholder="Ej: Corolla"
        :error="errors.model"
      />

      <FormCheckbox
        v-model="form.active"
        label="Activo"
      />

      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          :disabled="loading"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Guardando...' : 'Guardar cambios' }}
        </button>
        <router-link
          to="/admin/vehicles"
          class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50
                 dark:bg-white/10 dark:text-white dark:ring-white/5 dark:hover:bg-white/20"
        >
          Cancelar
        </router-link>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVehicles } from '../composables/useVehicles'
import type { VehicleForm } from '../interfaces/vehicle.interface'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import FormInput from '@/modules/admin/components/FormInput.vue'
import FormCheckbox from '@/modules/admin/components/FormCheckbox.vue'

const route = useRoute()
const router = useRouter()
const { getVehicle, updateVehicle, loading, error } = useVehicles()

const loadingVehicle = ref(true)
const vehicleId = Number(route.params.id)

const form = reactive<VehicleForm>({
  license_plate: '',
  brand: '',
  model: '',
  active: true
})

const errors = reactive<Record<string, string | null>>({
  license_plate: null,
  brand: null,
  model: null
})

onMounted(async () => {
  try {
    const vehicle = await getVehicle(vehicleId)
    form.license_plate = vehicle.license_plate
    form.brand = vehicle.brand || ''
    form.model = vehicle.model || ''
    form.active = vehicle.active
  } catch {
    router.push('/admin/vehicles')
  } finally {
    loadingVehicle.value = false
  }
})

function validate(): boolean {
  let valid = true
  errors.license_plate = null
  errors.brand = null
  errors.model = null

  if (!form.license_plate.trim()) {
    errors.license_plate = 'La matrícula es obligatoria'
    valid = false
  } else {
    // Validar formato: 4 dígitos + 3 letras (con o sin espacio)
    const licensePlatePattern = /^\d{4}\s?[A-Z]{3}$/i
    if (!licensePlatePattern.test(form.license_plate.trim())) {
      errors.license_plate = 'Formato incorrecto. Usa: 4 dígitos y 3 letras (ej: 1234ABC o 1234 ABC)'
      valid = false
    }
  }

  if (!form.brand.trim()) {
    errors.brand = 'La marca es obligatoria'
    valid = false
  }
  if (!form.model.trim()) {
    errors.model = 'El modelo es obligatorio'
    valid = false
  }
  return valid
}

async function handleSubmit() {
  if (!validate()) return

  try {
    await updateVehicle(vehicleId, { ...form })
    router.push('/admin/vehicles')
  } catch (err: any) {
    if (err.response?.status === 422) {
      const backendErrors = err.response.data.errors || {}
      for (const key of Object.keys(backendErrors)) {
        if (key in errors) {
          errors[key] = backendErrors[key][0]
        }
      }
    }
  }
}
</script>
