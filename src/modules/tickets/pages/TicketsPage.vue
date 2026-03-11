<template>
  <div class="p-4 max-w-4xl mx-auto">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-white">My Tickets</h1>
        <p class="text-sm text-gray-400 mt-0.5">Support requests and inquiries</p>
      </div>
      <router-link
        to="/tickets/create"
        class="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        <span class="material-icons text-base">add</span>
        New ticket
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-400 py-12">Loading your tickets…</div>

    <!-- Empty state -->
    <div v-else-if="tickets.length === 0" class="text-center py-16">
      <span class="material-icons text-5xl text-gray-600">confirmation_number</span>
      <p class="mt-3 text-gray-400">You don't have any tickets yet.</p>
      <router-link
        to="/tickets/create"
        class="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Open your first ticket
      </router-link>
    </div>

    <!-- Ticket list -->
    <template v-else>

      <!-- Active tickets -->
      <section v-if="activeTickets.length">
        <h2 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Open ({{ activeTickets.length }})
        </h2>
        <div class="space-y-3">
          <div
            v-for="t in activeTickets"
            :key="t.id"
            class="bg-gray-800 rounded-lg overflow-hidden shadow"
          >
            <!-- Ticket header row -->
            <div class="flex items-start justify-between gap-3 px-4 py-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium text-white truncate">{{ t.title }}</span>
                  <span class="inline-flex rounded-full bg-green-900 text-green-300 px-2 py-0.5 text-xs">Active</span>
                  <span class="text-xs text-gray-400">{{ t.messages?.length ?? 0 }} messages</span>
                </div>
                <p v-if="t.description" class="mt-1 text-sm text-gray-400 line-clamp-1">
                  {{ t.description }}
                </p>
                <p class="mt-1 text-xs text-gray-500">{{ formatDate(t.created_at) }}</p>
              </div>
              <router-link
                :to="`/tickets/${t.id}`"
                class="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Open
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- Closed tickets -->
      <section v-if="closedTickets.length" :class="activeTickets.length ? 'mt-8' : ''">
        <h2 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Closed ({{ closedTickets.length }})
        </h2>
        <div class="space-y-3">
          <div
            v-for="t in closedTickets"
            :key="t.id"
            class="bg-gray-800/60 rounded-lg overflow-hidden shadow"
          >
            <div class="flex items-start justify-between gap-3 px-4 py-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium text-gray-300 truncate">{{ t.title }}</span>
                  <span class="inline-flex rounded-full bg-gray-700 text-gray-400 px-2 py-0.5 text-xs">Closed</span>
                  <span class="text-xs text-gray-500">{{ t.messages?.length ?? 0 }} messages</span>
                </div>
                <p class="mt-1 text-xs text-gray-500">{{ formatDate(t.created_at) }}</p>
              </div>
              <router-link
                :to="`/tickets/${t.id}`"
                class="shrink-0 rounded-md bg-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-gray-600"
              >
                View
              </router-link>
            </div>
          </div>
        </div>
      </section>

    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTickets } from '../composables/useTickets'

const { tickets, loading, getTickets } = useTickets()

const activeTickets = computed(() => (tickets.value ?? []).filter(t => t.active))
const closedTickets = computed(() => (tickets.value ?? []).filter(t => !t.active))

const formatDate = (iso: string) => iso ? new Date(iso).toLocaleString() : '-'

onMounted(() => getTickets())
</script>
