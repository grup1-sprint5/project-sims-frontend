<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <PageHeading
      :title="m.adminTenantsUi.createTitle"
      :description="m.adminTenantsUi.createDescription"
    >
      <template #actions>
        <router-link
          to="/admin/tenants"
          class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50
                 dark:bg-white/10 dark:text-white dark:ring-white/5 dark:hover:bg-white/20"
        >
          {{ m.adminTenantDetailUi.back }}
        </router-link>
      </template>
    </PageHeading>

    <form @submit.prevent="handleSubmit" class="mt-8 max-w-lg space-y-1">
      <FormInput
        v-model="form.name"
        :label="m.adminTenantsUi.name"
        :placeholder="m.adminTenantsUi.namePlaceholder"
        :error="errors.name"
      />

      <FormInput
        v-model="form.slug"
        :label="m.commonUi.slug"
        :placeholder="m.adminTenantsUi.slugPlaceholder"
        :error="errors.slug"
      />

      <FormInput
        v-model="form.tax_id"
        :label="m.adminTenantsUi.taxIdOptional"
        :placeholder="m.adminTenantsUi.taxIdPlaceholder"
        :error="errors.tax_id"
      />

      <FormInput
        v-model="form.email"
        :label="m.adminTenantsUi.contactEmailOptional"
        :placeholder="m.adminTenantsUi.emailPlaceholder"
        type="email"
        :error="errors.email"
      />

      <FormInput
        v-model="form.phone"
        :label="m.adminTenantsUi.phoneOptional"
        :placeholder="m.adminTenantsUi.phonePlaceholder"
        :error="errors.phone"
      />

      <FormInput
        v-model="form.address"
        :label="m.adminTenantsUi.addressOptional"
        :placeholder="m.adminTenantsUi.addressPlaceholder"
        :error="errors.address"
      />

      <FormCheckbox
        v-model="form.active"
        :label="m.commonUi.active"
      />

      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          :disabled="loading"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? m.adminTenantsUi.saving : m.adminTenantsUi.createAction }}
        </button>
        <router-link
          to="/admin/tenants"
          class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50
                 dark:bg-white/10 dark:text-white dark:ring-white/5 dark:hover:bg-white/20"
        >
          {{ m.commonUi.cancel }}
        </router-link>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useTenants } from '../composables/useTenants'
import type { TenantForm } from '../interfaces/tenant.interface'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import FormInput from '@/modules/admin/components/FormInput.vue'
import FormCheckbox from '@/modules/admin/components/FormCheckbox.vue'
import { useI18n } from '@/i18n'

const router = useRouter()
const { createTenant, loading, error } = useTenants()
const { m } = useI18n()

const form = reactive<TenantForm>({
  name: '',
  slug: '',
  tax_id: '',
  email: '',
  phone: '',
  address: '',
  active: true
})

const errors = reactive<Record<string, string | null>>({
  name: null,
  slug: null,
  tax_id: null,
  email: null,
  phone: null,
  address: null
})

function validate(): boolean {
  let valid = true
  // Reset errors
  Object.keys(errors).forEach(k => errors[k] = null)

  if (!form.name.trim()) {
    errors.name = m.value.adminTenantsUi.nameRequired
    valid = false
  }

  if (!form.slug.trim()) {
    errors.slug = m.value.adminTenantsUi.slugRequired
    valid = false
  } else if (!/^[a-z0-9_-]+$/i.test(form.slug.trim())) {
    errors.slug = m.value.adminTenantsUi.slugInvalid
    valid = false
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = m.value.adminTenantsUi.invalidEmail
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  try {
    await createTenant({ ...form })
    router.push('/admin/tenants')
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
