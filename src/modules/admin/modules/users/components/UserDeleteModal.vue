<template>
  <Modal :show="true" @close="handleCancel">
    <template #header>
      <h2 class="text-lg font-bold text-white">Delete user</h2>
    </template>

    <p class="text-gray-300 p-5 text-base">
      Are you sure you want to delete user <strong class="text-white">{{ user.name }}</strong>? This action cannot be undone.
    </p>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          @click="handleCancel"
          :disabled="isDeleting"
          class="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleDelete"
          :disabled="isDeleting"
          class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="isDeleting" class="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUsers } from '../composables/useUsers'
import { useToast } from '@/modules/common/composables/useToast'
import type { User } from '../interfaces/user.interface'
import Modal from '@/modules/admin/components/Modal.vue'

interface Props {
  user: User
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirmed: []
  cancel: []
}>()

const { deleteUser } = useUsers()
const toast = useToast()
const isDeleting = ref(false)

const handleDelete = async () => {
  try {
    isDeleting.value = true
    await deleteUser(props.user.id)
    toast.success('User deleted successfully')
    emit('confirmed')
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Error deleting user'
    toast.error(errorMessage)
  } finally {
    isDeleting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>
