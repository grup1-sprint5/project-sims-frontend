<template>
  <div class="min-h-screen" style="background:var(--app-bg);color:var(--app-text);padding-bottom:1.5rem;">
    <div class="container mx-auto px-4 py-7 max-w-4xl">

      <div class="mb-10">
        <h1 class="text-2xl font-bold" style="color:var(--app-text)">{{ m.profile.title }}</h1>
        <p class="mt-1 text-sm" style="color:var(--app-muted-text)">{{ m.profile.subtitle }}</p>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin h-8 w-8 text-[var(--fleetly-baltic-blue)]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>

      <template v-else-if="user">

        <div class="flex items-center gap-4 mb-8">
          <span class="size-16 rounded-full bg-[var(--fleetly-baltic-blue)] flex items-center justify-center text-2xl font-bold">
            {{ initials }}
          </span>
          <div>
            <p class="text-lg font-semibold">{{ user.name }}</p>
            <p class="text-sm text-gray-400">@{{ user.username }}</p>
            <span
              :class="user.active
                ? 'status-pill status-pill--active'
                : 'status-pill status-pill--inactive'"
              class="inline-block mt-1"
            >
              {{ user.active ? m.profile.active : m.profile.inactive }}
            </span>
          </div>
        </div>

        <section class="rounded-xl bg-gray-800/60 border border-white/5 p-6 mb-6">
          <h2 class="text-base font-semibold mb-5">{{ m.profile.personalInfo }}</h2>

          <form @submit.prevent="submitProfile" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">{{ m.profile.fullName }}</label>
                <input
                  v-model="profileForm.name"
                  type="text"
                  required
                  class="input-field"
                  :placeholder="m.profile.fullName"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">{{ m.profile.username }}</label>
                <input
                  v-model="profileForm.username"
                  type="text"
                  required
                  class="input-field"
                  :placeholder="m.profile.username"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-300 mb-1">{{ m.profile.email }}</label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  required
                  class="input-field"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button
                type="submit"
                :disabled="savingProfile"
                class="btn-primary"
              >
                <svg v-if="savingProfile" class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {{ savingProfile ? m.profile.saving : m.profile.saveChanges }}
              </button>
            </div>
          </form>
        </section>

        <section class="rounded-xl bg-gray-800/60 border border-white/5 p-6 mb-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-base font-semibold mb-1">{{ m.profile.paymentMethodTitle }}</h2>
              <p class="text-sm text-gray-400">{{ m.profile.paymentMethodSubtitle }}</p>
            </div>
            <span class="status-pill status-pill--active">
              <span class="h-1.5 w-1.5 rounded-full bg-current opacity-80"></span>
              {{ m.profile.paymentMethodActive }}
            </span>
          </div>

          <div class="payment-card mt-5 rounded-xl p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="payment-provider-title text-sm font-semibold">Stripe</p>
                <p class="payment-provider-subtitle text-xs">{{ m.profile.paymentMethodDescription }}</p>
              </div>
              <span class="rounded-md px-2 py-1 text-xs font-semibold border border-[var(--fleetly-baltic-blue)]/25 bg-[var(--fleetly-baltic-blue)]/15 text-[var(--fleetly-baltic-blue)]">Checkout</span>
            </div>

            <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="payment-balance-box rounded-lg px-3 py-2">
                <p class="payment-balance-label text-xs">{{ m.profile.currentBalance }}</p>
                <p class="payment-balance-value text-lg font-bold">{{ walletBalanceFormatted }}</p>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-[var(--app-text)]">{{ m.profile.topupAmount }}</label>
                <input
                  v-model.number="walletTopupAmount"
                  type="number"
                  min="1"
                  step="1"
                  class="input-field"
                />
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <button
              type="button"
              @click="startWalletTopup"
              :disabled="loadingTopup"
              class="btn-primary"
            >
              <svg v-if="loadingTopup" class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {{ loadingTopup ? m.profile.redirectingToStripe : m.profile.managePayments }}
            </button>
          </div>
        </section>

        <section class="rounded-xl bg-gray-800/60 border border-white/5 p-6">
          <h2 class="text-base font-semibold mb-5">{{ m.profile.changePassword }}</h2>

          <form @submit.prevent="submitPassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">{{ m.profile.newPassword }}</label>
              <div class="password-field-wrap">
                <input
                  v-model="passwordForm.password"
                  :type="showNewPassword ? 'text' : 'password'"
                  required
                  minlength="8"
                  class="input-field password-field"
                  :placeholder="m.profile.newPasswordPlaceholder"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="showNewPassword ? 'Hide password' : 'Show password'"
                  @click="showNewPassword = !showNewPassword"
                >
                  <svg v-if="!showNewPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.122-2.317A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.104 5.063M15 12a3 3 0 00-4.243-2.829M9.88 9.88A3 3 0 0014.12 14.12M3 3l18 18" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">{{ m.profile.confirmPassword }}</label>
              <div class="password-field-wrap">
                <input
                  v-model="passwordForm.password_confirmation"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  minlength="8"
                  class="input-field password-field"
                  :placeholder="m.profile.confirmPasswordPlaceholder"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <svg v-if="!showConfirmPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.122-2.317A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.104 5.063M15 12a3 3 0 00-4.243-2.829M9.88 9.88A3 3 0 0014.12 14.12M3 3l18 18" />
                  </svg>
                </button>
              </div>
              <p v-if="passwordMismatch" class="mt-1 text-xs text-red-400">{{ m.profile.mismatch }}</p>
            </div>

            <div class="flex justify-end pt-2">
              <button
                type="submit"
                :disabled="savingPassword || passwordMismatch"
                class="btn-primary"
              >
                <svg v-if="savingPassword" class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {{ savingPassword ? m.profile.updating : m.profile.updatePassword }}
              </button>
            </div>
          </form>
        </section>
        
        <!-- Danger Zone / Logout for mobile -->
        <section class="mt-12 pt-8 border-t border-white/10 text-center">
          <button
            type="button"
            @click="handleLogout"
            class="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            {{ m.userMenu.signOut }}
          </button>
        </section>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from '@/i18n'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useUsers } from '@/modules/admin/modules/users/composables/useUsers'
import { useToast } from '@/modules/common/composables/useToast'
import apiClient from '@/services/api'

const { m, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const { user, fetchUser, logout } = useAuth()
const { updateUser } = useUsers()
const toast = useToast()

const loading = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)
const loadingTopup = ref(false)
const walletTopupAmount = ref<number>(20)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const profileForm = reactive({ name: '', username: '', email: '' })
const passwordForm = reactive({ password: '', password_confirmation: '' })

const initials = computed(() => {
  return (user.value?.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
})

const walletBalanceFormatted = computed(() => {
  const localeCode = locale.value === 'es' ? 'es-ES' : (locale.value === 'en' ? 'en-GB' : 'ca-ES')
  const value = Number(user.value?.wallet_balance ?? 0)
  return new Intl.NumberFormat(localeCode, { style: 'currency', currency: 'EUR' }).format(value)
})

const handleLogout = async () => {
  try {
    await logout()
    toast.success(m.value.userMenu.loggedOut)
  } catch {
    //
  } finally {
    router.push('/login')
  }
}

const startWalletTopup = async () => {
  if (!Number.isFinite(walletTopupAmount.value) || walletTopupAmount.value <= 0) {
    toast.error(m.value.profile.invalidTopupAmount)
    return
  }

  loadingTopup.value = true
  try {
    const successUrl = `${window.location.origin}/#/home/perfil`
    const cancelUrl = `${window.location.origin}/#/home/perfil?wallet=cancel`

    const response = await apiClient.post('/wallet/checkout-session', {
      amount: walletTopupAmount.value,
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    const checkoutUrl = response.data?.checkout_url
    if (!checkoutUrl) {
      toast.error(m.value.profile.paymentError)
      return
    }

    window.location.assign(checkoutUrl)
  } catch (err: any) {
    toast.error(err?.response?.data?.message || m.value.profile.paymentError)
  } finally {
    loadingTopup.value = false
  }
}

const passwordMismatch = computed(() =>
  !!passwordForm.password_confirmation && passwordForm.password !== passwordForm.password_confirmation
)

onMounted(async () => {
  loading.value = true
  await fetchUser()
  if (user.value) {
    profileForm.name = user.value.name
    profileForm.username = user.value.username
    profileForm.email = user.value.email
  }

  // Stripe appends params before the # (?wallet=success&session_id=...) so they
  // land in window.location.search, not route.query. Cancel stays in the hash fragment.
  const searchParams = new URLSearchParams(window.location.search)
  const walletStatus = searchParams.get('wallet') || (route.query.wallet as string | undefined)
  if (walletStatus === 'success') {
    const sessionId = searchParams.get('session_id') || (route.query.session_id as string | undefined)
    if (sessionId) {
      try {
        await apiClient.post('/wallet/confirm-session', { session_id: sessionId })
      } catch {
        // Keep UX resilient: fetch current user even if session confirmation fails.
      }
    }
    await fetchUser()
    toast.success(m.value.profile.walletUpdated)
    router.replace('/home/perfil')
  }
  if (walletStatus === 'cancel') {
    toast.error(m.value.profile.walletCancelled)
    router.replace('/home/perfil')
  }

  loading.value = false
})

const submitProfile = async () => {
  if (!user.value) return
  savingProfile.value = true
  try {
    await updateUser(user.value.id, {
      name: profileForm.name,
      username: profileForm.username,
      email: profileForm.email,
      active: user.value.active,
    })
    await fetchUser()
    toast.success(m.value.profile.profileUpdated)
  } catch (err: any) {
    toast.error(err.response?.data?.message || m.value.profile.profileError)
  } finally {
    savingProfile.value = false
  }
}

const submitPassword = async () => {
  if (!user.value || passwordMismatch.value) return
  savingPassword.value = true
  try {
    await updateUser(user.value.id, {
      password: passwordForm.password,
      password_confirmation: passwordForm.password_confirmation,
      active: user.value.active,
    })
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
    toast.success(m.value.profile.passwordUpdated)
  } catch (err: any) {
    toast.error(err.response?.data?.message || m.value.profile.passwordError)
  } finally {
    savingPassword.value = false
  }
}
</script>

<style scoped>
.input-field {
  display: block;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid var(--app-input-border);
  background-color: var(--app-input-bg);
  padding: 0.5rem 0.75rem;
  color: var(--app-input-text);
  font-size: 0.875rem;
  outline: none;
}
.input-field::placeholder { color: var(--app-input-placeholder); }
.input-field:focus {
  border-color: var(--fleetly-baltic-blue);
  box-shadow: 0 0 0 2px rgba(38, 97, 156, 0.22);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--fleetly-baltic-blue) 22%, transparent);
}
.password-field-wrap {
  position: relative;
}
.password-field {
  padding-right: 2.5rem;
}
.password-toggle {
  position: absolute;
  top: 50%;
  right: 0.625rem;
  transform: translateY(-50%);
  color: var(--app-muted-text);
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background-color: var(--fleetly-baltic-blue);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  transition: background-color 0.15s;
  cursor: pointer;
}
.btn-primary:hover { background-color: var(--app-btn-hover-bg); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 9999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  line-height: 1;
  font-weight: 600;
  border: 1px solid transparent;
}

.status-pill--active {
  background: color-mix(in srgb, #22c55e 18%, var(--app-surface));
  color: #15803d;
  border-color: color-mix(in srgb, #22c55e 48%, var(--app-border));
}

.status-pill--inactive {
  background: var(--app-surface-alt);
  color: var(--app-muted-text);
  border-color: var(--app-border);
}

.payment-card {
  border: 1px solid var(--app-border);
  background: var(--app-surface-alt);
}

.payment-provider-title {
  color: var(--app-text);
}

.payment-provider-subtitle {
  color: var(--app-muted-text);
}

.payment-balance-box {
  border: 1px solid color-mix(in srgb, #10b981 38%, var(--app-border));
  background: color-mix(in srgb, #10b981 12%, var(--app-surface));
}

.payment-balance-label {
  color: #047857;
}

.payment-balance-value {
  color: #059669;
}

:global(html.dark) .status-pill--active {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border-color: rgba(34, 197, 94, 0.5);
}

:global(html.dark) .payment-balance-label {
  color: #d1fae5;
}

:global(html.dark) .payment-balance-value {
  color: #6ee7b7;
}
</style>