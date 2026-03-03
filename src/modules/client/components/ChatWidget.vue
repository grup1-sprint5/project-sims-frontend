<template>
  <!-- Floating bubble button -->
  <div class="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6">

    <!-- Chat panel -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="isOpen"
        class="flex w-[22rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl shadow-black/60 sm:w-96"
        style="height: 30rem"
      >
        <!-- Panel header -->
        <div class="flex items-center gap-2.5 border-b border-white/10 bg-gray-800 px-4 py-3">
          <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600">
            <SparklesIcon class="size-4 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white leading-none">Assistent SIMS</p>
            <p class="text-xs text-gray-400 mt-0.5">Ajuda sobre l'aplicació</p>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-if="messages.length > 0"
              type="button"
              title="Esborra la conversa"
              @click="clearConversation"
              class="rounded-lg p-1.5 text-gray-500 transition hover:bg-white/10 hover:text-gray-300"
            >
              <TrashIcon class="size-4" />
            </button>
            <button
              type="button"
              @click="isOpen = false"
              class="rounded-lg p-1.5 text-gray-500 transition hover:bg-white/10 hover:text-gray-300"
            >
              <XMarkIcon class="size-4" />
            </button>
          </div>
        </div>

        <!-- Message list -->
        <div
          ref="scrollContainer"
          class="flex-1 space-y-3 overflow-y-auto p-4"
        >
          <!-- Empty state -->
          <div
            v-if="messages.length === 0"
            class="flex h-full flex-col items-center justify-center gap-3 text-center"
          >
            <SparklesIcon class="size-8 text-indigo-400/50" />
            <p class="text-xs text-gray-400 leading-relaxed">
              Pregunta'm qualsevol cosa<br />sobre l'ús de l'aplicació!
            </p>
            <!-- Suggestion chips -->
            <div class="flex flex-wrap justify-center gap-1.5">
              <button
                v-for="s in suggestions"
                :key="s"
                type="button"
                @click="sendSuggestion(s)"
                class="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300 transition hover:bg-indigo-600/30 hover:text-white"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <!-- Messages -->
          <template v-else>
            <div
              v-for="(msg, i) in messages"
              :key="i"
              class="flex gap-2"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                v-if="msg.role === 'assistant'"
                class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-600"
              >
                <SparklesIcon class="size-3.5 text-white" />
              </div>

              <div
                class="max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed"
                :class="
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-indigo-600 text-white'
                    : 'rounded-tl-sm bg-gray-700/80 text-gray-100'
                "
              >
                <span v-html="formatMessage(msg.content)" />
              </div>

              <div
                v-if="msg.role === 'user'"
                class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-600 text-[10px] font-bold text-white"
              >
                {{ userInitials }}
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="loading" class="flex items-center gap-2">
              <div class="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-600">
                <SparklesIcon class="size-3.5 text-white" />
              </div>
              <div class="flex gap-1 rounded-2xl rounded-tl-sm bg-gray-700/80 px-3 py-2.5">
                <span class="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span class="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span class="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            </div>
          </template>
        </div>

        <!-- Input area -->
        <div class="border-t border-white/10 bg-gray-800 p-3">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input
              v-model="inputText"
              type="text"
              placeholder="Escriu un missatge…"
              maxlength="2000"
              :disabled="loading"
              class="flex-1 rounded-xl border border-white/10 bg-gray-700 px-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button
              type="submit"
              :disabled="loading || !inputText.trim()"
              class="flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PaperAirplaneIcon class="size-4" />
            </button>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Trigger bubble -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="relative flex size-14 items-center justify-center rounded-full bg-indigo-600 shadow-lg shadow-indigo-900/50 transition hover:bg-indigo-500 hover:scale-105 active:scale-95"
      :title="isOpen ? 'Tanca l\'assistent' : 'Obre l\'assistent IA'"
    >
      <Transition
        enter-active-class="transition duration-150"
        enter-from-class="opacity-0 rotate-90 scale-50"
        enter-to-class="opacity-100 rotate-0 scale-100"
        leave-active-class="transition duration-150"
        leave-from-class="opacity-100 rotate-0 scale-100"
        leave-to-class="opacity-0 rotate-90 scale-50"
      >
        <XMarkIcon v-if="isOpen" class="size-6 text-white absolute" />
        <ChatBubbleLeftRightIcon v-else class="size-6 text-white absolute" />
      </Transition>

      <!-- Unread badge -->
      <span
        v-if="unreadCount > 0 && !isOpen"
        class="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useAuth } from '@/modules/auth/composables/useAuth'
import apiClient from '@/services/api'
import showToast from '@/modules/common/composables/useToast'

// ── Auth ───────────────────────────────────────────────────────────────────

const { user: authUser } = useAuth()

const userInitials = computed(() => {
  const name = authUser.value?.name ?? ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
})

// ── State ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const isOpen = ref(false)
const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const loading = ref(false)
const unreadCount = ref(0)
const scrollContainer = ref<HTMLDivElement | null>(null)

// Reset unread count when panel opens; scroll to bottom
watch(isOpen, (open) => {
  if (open) {
    unreadCount.value = 0
    nextTick(() => scrollToBottom())
  }
})

// ── Suggestions ────────────────────────────────────────────────────────────

const suggestions = [
  'Com faig una reserva?',
  'Com cancel·lo una reserva?',
  'Com canvio la contrasenya?',
  'Com obro un ticket?',
]

// ── Helpers ────────────────────────────────────────────────────────────────

function formatMessage(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
}

async function scrollToBottom() {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

// ── Actions ────────────────────────────────────────────────────────────────

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  inputText.value = ''
  messages.value.push({ role: 'user', content: text })
  await scrollToBottom()

  loading.value = true

  try {
    const history = messages.value
      .slice(0, -1)
      .slice(-10)
      .map(({ role, content }) => ({ role, content }))

    const { data } = await apiClient.post<{ reply: string }>('/chat', {
      message: text,
      history,
    })

    messages.value.push({ role: 'assistant', content: data.reply })

    // Show badge if panel is closed
    if (!isOpen.value) {
      unreadCount.value++
    }
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.error ??
      "No s'ha pogut connectar amb l'assistent. Torna-ho a intentar."
    messages.value.push({ role: 'assistant', content: errorMsg })
    showToast("Error al connectar amb l'assistent IA")
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

function sendSuggestion(text: string) {
  if (!isOpen.value) isOpen.value = true
  inputText.value = text
  sendMessage()
}

function clearConversation() {
  messages.value = []
  inputText.value = ''
  unreadCount.value = 0
}
</script>
