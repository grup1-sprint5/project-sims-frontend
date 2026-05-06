<template>
  <div class="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-10">
    <div class="w-full max-w-md">
      <RouterLink to="/landing" class="flex justify-center mb-8">
        <img class="h-20 w-auto" src="/branding/fleetly_logotip_blanc.svg" alt="Fleetly" />
      </RouterLink>

      <div class="rounded-xl border border-white/10 bg-gray-900 px-6 py-8">
        <div class="mb-6">
          <p class="text-sm font-semibold text-[var(--fleetly-pale-slate)]">Alta d'empresa</p>
          <h1 class="mt-1 text-xl font-semibold text-white">Registra la teva empresa</h1>
          <p class="mt-2 text-sm text-gray-400">
            Tria el subdomini que faran servir els teus usuaris per entrar a Fleetly.
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div>
            <label for="companyName" class="block text-sm text-gray-400 mb-1.5">Nom de l'empresa</label>
            <input
              id="companyName"
              v-model="form.name"
              class="block w-full rounded-lg bg-white/5 px-3.5 py-3 text-base text-white placeholder:text-gray-600 border border-white/10 focus:border-[var(--fleetly-baltic-blue)] focus:outline-none transition"
              placeholder="Ex: Tallers Delta"
              required
            />
          </div>

          <div>
            <label for="subdomain" class="block text-sm text-gray-400 mb-1.5">Subdomini desitjat</label>
            <div class="flex rounded-lg border border-white/10 bg-white/5 focus-within:border-[var(--fleetly-baltic-blue)]">
              <input
                id="subdomain"
                :value="form.slug"
                @input="onSlugInput"
                class="min-w-0 flex-1 rounded-l-lg bg-transparent px-3.5 py-3 text-base text-white placeholder:text-gray-600 focus:outline-none"
                placeholder="tallers-delta"
                required
              />
              <span class="hidden sm:flex items-center rounded-r-lg border-l border-white/10 px-3 text-sm text-gray-400">
                .{{ baseDomain }}
              </span>
            </div>

            <div class="mt-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              <p class="text-xs text-gray-500">El teu accés serà:</p>
              <p class="mt-0.5 break-all text-sm font-medium text-white">{{ previewDomain }}</p>
            </div>

            <p class="mt-2 text-xs text-gray-500">Només minúscules, números i guions. No facis servir espais.</p>
            <p v-if="slugChecking" class="mt-1 text-xs text-gray-400">Comprovant disponibilitat...</p>
            <p v-else-if="slugAvailable === true" class="mt-1 text-xs text-emerald-400">Subdomini disponible</p>
            <p v-else-if="slugAvailable === false" class="mt-1 text-xs text-red-400">{{ slugError }}</p>
          </div>

          <div>
            <label for="email" class="block text-sm text-gray-400 mb-1.5">Correu de contacte</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="block w-full rounded-lg bg-white/5 px-3.5 py-3 text-base text-white placeholder:text-gray-600 border border-white/10 focus:border-[var(--fleetly-baltic-blue)] focus:outline-none transition"
              placeholder="tu@empresa.com"
              required
            />
          </div>

          <div>
            <label for="notes" class="block text-sm text-gray-400 mb-1.5">Notes opcionals</label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="block w-full resize-none rounded-lg bg-white/5 px-3.5 py-3 text-base text-white placeholder:text-gray-600 border border-white/10 focus:border-[var(--fleetly-baltic-blue)] focus:outline-none transition"
              placeholder="Explica'ns breument què necessites"
            />
          </div>

          <div v-if="message" class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
            {{ message }}
          </div>
          <div v-if="error" class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="submitting || slugAvailable === false || slugChecking"
            class="w-full rounded-lg bg-[var(--fleetly-baltic-blue)] px-4 py-3 text-base font-medium text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Enviant sol·licitud...' : 'Sol·licitar alta d’empresa' }}
          </button>

          <button
            type="button"
            class="w-full rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5"
            @click="reset"
          >
            Netejar formulari
          </button>
        </form>
      </div>

      <p class="mt-5 text-center text-sm text-gray-500">
        Ja tens empresa?
        <RouterLink to="/login" class="text-gray-300 hover:text-white transition">Inicia sessió</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const baseDomain = 'jordiarnau.iemhosting.asix2.iesmontsia.cat'

const form = ref({ name: '', slug: '', email: '', notes: '' })
const message = ref('')
const error = ref('')
const slugAvailable = ref<boolean | null>(null)
const slugChecking = ref(false)
const slugError = ref('')
const submitting = ref(false)

let slugTimer: number | undefined

const previewDomain = computed(() => {
  const slug = form.value.slug || 'el-teu-subdomini'
  return `${slug}.${baseDomain}`
})

const normalizeSlug = (value: string) => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const validateSlugFormat = (s: string) => /^[a-z0-9-]+$/.test(s)

const checkSlug = async (s: string) => {
  slugError.value = ''
  slugAvailable.value = null
  if (!s) return
  if (!validateSlugFormat(s)) {
    slugError.value = 'Només es permeten minúscules, números i guions'
    slugAvailable.value = false
    return
  }
  slugChecking.value = true
  try {
    const res = await api.get('/tenant-slugs/check', { params: { slug: s } })
    slugAvailable.value = !!res.data?.available
    if (!slugAvailable.value) slugError.value = res.data?.message || 'Aquest subdomini no està disponible'
  } catch (e: any) {
    slugAvailable.value = false
    slugError.value = e?.response?.data?.message || 'No s’ha pogut comprovar el subdomini'
  } finally {
    slugChecking.value = false
  }
}

const reset = () => {
  form.value = { name: '', slug: '', email: '', notes: '' }
  message.value = ''
  error.value = ''
  slugAvailable.value = null
  slugError.value = ''
}

const submit = async () => {
  message.value = ''
  error.value = ''

  if (!validateSlugFormat(form.value.slug)) {
    error.value = 'Revisa el subdomini: només pot tenir minúscules, números i guions.'
    return
  }

  if (slugAvailable.value !== true) {
    await checkSlug(form.value.slug)
    if (slugAvailable.value !== true) return
  }

  submitting.value = true
  try {
    await api.post('/register-company', { ...form.value })
    message.value = 'Sol·licitud enviada. Revisarem l’empresa i activarem el subdomini.'
    reset()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'No s’ha pogut enviar la sol·licitud'
  } finally {
    submitting.value = false
  }
}

const onSlugInput = (e: Event) => {
  const value = normalizeSlug((e.target as HTMLInputElement).value)
  form.value.slug = value
  slugAvailable.value = null
  slugError.value = ''
  if (slugTimer) clearTimeout(slugTimer)
  slugTimer = window.setTimeout(() => checkSlug(value), 500)
}
</script>
