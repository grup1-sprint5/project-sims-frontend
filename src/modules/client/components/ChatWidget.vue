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
        data-tour-id="chat-widget-panel"
        class="chat-panel flex w-[22rem] flex-col overflow-hidden rounded-2xl sm:w-96"
        style="height: 30rem"
      >
        <!-- Panel header -->
        <div class="chat-header flex items-center gap-2.5 px-4 py-3">
          <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--fleetly-baltic-blue)]">
            <SparklesIcon class="size-4 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold leading-none" style="color:var(--chat-header-text)">{{ m.chatWidgetUi.title }}</p>
            <p class="text-xs mt-0.5" style="color:var(--chat-muted-text)">{{ m.chatWidgetUi.subtitle }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-if="messages.length > 0"
              type="button"
              :title="m.chatWidgetUi.clearConversation"
              @click="clearConversation"
              class="chat-icon-btn rounded-lg p-1.5 transition"
            >
              <TrashIcon class="size-4" />
            </button>
            <button
              type="button"
              @click="isOpen = false"
              class="chat-icon-btn rounded-lg p-1.5 transition"
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
            <SparklesIcon class="size-8 text-[var(--fleetly-baltic-blue)]/50" />
            <p class="text-xs leading-relaxed" style="color:var(--chat-muted-text)">
              {{ m.chatWidgetUi.emptyPromptLine1 }}<br />{{ m.chatWidgetUi.emptyPromptLine2 }}
            </p>
            <!-- Suggestion chips -->
            <div class="flex flex-wrap justify-center gap-1.5">
              <button
                v-for="s in suggestions"
                :key="s"
                type="button"
                @click="sendSuggestion(s)"
                class="chat-chip rounded-full px-2.5 py-1 text-xs transition"
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
                class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--fleetly-baltic-blue)]"
              >
                <SparklesIcon class="size-3.5 text-white" />
              </div>

              <div
                class="max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed"
                :class="
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-[var(--fleetly-baltic-blue)] text-white'
                    : 'chat-bubble-assistant rounded-tl-sm'
                "
              >
                <span v-html="formatMessage(msg.content)" />
              </div>

              <div
                v-if="msg.role === 'user'"
                class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style="background:var(--chat-user-avatar-bg)"
              >
                {{ userInitials }}
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="loading" class="flex items-center gap-2">
              <div class="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--fleetly-baltic-blue)]">
                <SparklesIcon class="size-3.5 text-white" />
              </div>
              <div class="chat-bubble-assistant flex gap-1 rounded-2xl rounded-tl-sm px-3 py-2.5">
                <span class="size-1.5 animate-bounce rounded-full [animation-delay:0ms]" style="background:var(--chat-muted-text)" />
                <span class="size-1.5 animate-bounce rounded-full [animation-delay:150ms]" style="background:var(--chat-muted-text)" />
                <span class="size-1.5 animate-bounce rounded-full [animation-delay:300ms]" style="background:var(--chat-muted-text)" />
              </div>
            </div>
          </template>
        </div>

        <!-- Input area -->
        <div class="chat-input-wrap p-3">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input
              v-model="inputText"
              type="text"
              :placeholder="m.chatWidgetUi.inputPlaceholder"
              maxlength="2000"
              :disabled="loading"
              class="chat-input flex-1 rounded-xl px-3 py-2 text-xs outline-none transition focus:border-[var(--fleetly-baltic-blue)] focus:ring-1 focus:ring-[var(--fleetly-baltic-blue)] disabled:opacity-50"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button
              type="submit"
              :disabled="loading || !inputText.trim()"
              class="flex shrink-0 items-center justify-center rounded-xl bg-[var(--fleetly-baltic-blue)] px-3 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
      data-tour-id="chat-widget-trigger"
      @click="isOpen = !isOpen"
      class="relative flex size-14 items-center justify-center rounded-full bg-[var(--fleetly-baltic-blue)] shadow-lg shadow-black/50 transition hover:opacity-90 hover:scale-105 active:scale-95"
      :title="isOpen ? m.chatWidgetUi.closeTitle : m.chatWidgetUi.openTitle"
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
import { useI18n } from '@/i18n'

// ── Auth ───────────────────────────────────────────────────────────────────

const { user: authUser } = useAuth()
const { m } = useI18n()

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

const suggestions = computed(() => m.value.chatWidgetUi.suggestions)

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
    }, { timeout: 130_000 })

    messages.value.push({ role: 'assistant', content: data.reply })

    // Show badge if panel is closed
    if (!isOpen.value) {
      unreadCount.value++
    }
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.error ??
      m.value.chatWidgetUi.errorMessage
    messages.value.push({ role: 'assistant', content: errorMsg })
    showToast(m.value.chatWidgetUi.errorToast)
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

<style scoped>
.chat-panel {
  border: 1px solid var(--chat-panel-border);
  background: var(--chat-panel-bg);
  box-shadow: 0 18px 40px rgba(2, 6, 23, 0.35);
}

.chat-header {
  border-bottom: 1px solid var(--chat-panel-border);
  background: var(--chat-header-bg);
}

.chat-icon-btn {
  color: var(--chat-muted-text);
}

.chat-icon-btn:hover {
  background: var(--chat-surface-hover);
  color: var(--chat-header-text);
}

.chat-chip {
  border: 1px solid var(--chat-panel-border);
  background: var(--chat-surface-alt);
  color: var(--chat-header-text);
}

.chat-chip:hover {
  background: color-mix(in srgb, var(--fleetly-baltic-blue) 28%, var(--chat-surface-alt));
  color: #ffffff;
}

.chat-bubble-assistant {
  background: var(--chat-assistant-bubble-bg);
  color: var(--chat-assistant-bubble-text);
  border: 1px solid var(--chat-assistant-bubble-border);
}

.chat-input-wrap {
  border-top: 1px solid var(--chat-panel-border);
  background: var(--chat-header-bg);
}

.chat-input {
  border: 1px solid var(--chat-input-border);
  background: var(--chat-input-bg);
  color: var(--chat-input-text);
}

.chat-input::placeholder {
  color: var(--chat-input-placeholder);
}
</style>
