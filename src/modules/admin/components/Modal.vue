<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
  >
    <div
      class="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl
             dark:bg-gray-900"
      @click.stop
    >
      <header
        class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4
               dark:border-gray-700 dark:bg-gray-900"
      >
        <slot name="header" />
        <button
          aria-label="Close"
          class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none
                 dark:text-gray-500 dark:hover:text-gray-300"
          @click="$emit('close')"
        >
          ✕
        </button>
      </header>

      <section class="bg-white px-6 py-4 dark:bg-gray-900">
        <slot />
      </section>

      <footer
        class="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4
               dark:border-gray-700 dark:bg-gray-900"
      >
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>


<style scoped>
.modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:50 }
.modal-panel { background:#111827; color:#fff; width:100%; max-width:720px; border-radius:8px; overflow:hidden; border:1px solid #374151; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1) }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #374151 }
.modal-body { padding:16px }
.modal-footer { padding:12px 16px; border-top:1px solid #374151; text-align:right }
.close-btn { background:transparent; border:none; font-size:16px; cursor:pointer; color:#9CA3AF; transition:color 0.2s }
.close-btn:hover { color:#F3F4F6 }
</style>
