<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <PageHeading
      :title="m.adminUsersUi.title"
      :description="m.adminUsersUi.description"
    >
      <template #actions>
        <router-link
          to="/admin/users/create"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {{ m.adminUsersUi.add }}
        </router-link>
      </template>
    </PageHeading>

    <!-- Filters -->
    <div class="mt-6">
      <input
        v-model="filters.search"
        @input="handleSearch"
        type="text"
        :placeholder="m.adminUsersUi.searchPlaceholder"
        class="block w-full max-w-md rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="mt-8 text-center text-gray-500 dark:text-gray-400">
      {{ m.adminUsersUi.loading }}
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="mt-8 text-center text-red-500">
      {{ error }}
    </div>

    <!-- Table -->
    <AdminsTable
      v-else
      :columns="columns"
      :empty="users.length === 0"
    >
      <template #empty>
        {{ m.adminUsersUi.empty }}
      </template>

      <template v-if="isCurrentUserSuperAdmin">
        <template v-for="group in groupedUsers" :key="group.key">
          <tr>
            <td
              :colspan="columns.length"
              class="bg-[var(--app-bg)] px-4 py-3 text-sm font-semibold text-[var(--app-text)] sm:px-0"
            >
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{{ group.name }}</span>
                <span class="rounded-full bg-[var(--app-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--app-muted-text)]">
                  {{ group.users.length }} {{ m.adminUsersUi.title.toLowerCase() }}
                </span>
              </div>
            </td>
          </tr>
          <UserRow
            v-for="user in group.users"
            :key="`${group.key}-${user.id}`"
            :user="user"
            :is-current-user-admin="isCurrentUserAdmin"
            :is-current-user-super-admin="isCurrentUserSuperAdmin"
            @view="navigateToDetail"
            @edit="navigateToEdit"
            @delete="handleDeleteClick"
          />
        </template>
      </template>

      <UserRow
        v-else
        v-for="user in users"
        :key="`${user.tenant_id || 'central'}-${user.id}`"
        :user="user"
        :is-current-user-admin="isCurrentUserAdmin"
        :is-current-user-super-admin="isCurrentUserSuperAdmin"
        @view="navigateToDetail"
        @edit="navigateToEdit"
        @delete="handleDeleteClick"
      />
    </AdminsTable>

    <!-- Delete Modal -->
    <UserDeleteModal
      v-if="showDeleteModal && userToDelete"
      :user="userToDelete"
      @confirmed="handleDeleteConfirmed"
      @cancel="showDeleteModal = false"
    />

    <!-- Pagination -->
    <AdminPagination
      v-if="pagination.total > 0"
      :page="pagination.current_page"
      :per-page="pagination.per_page"
      :total="pagination.total"
      @update:page="handlePageChange"
    />

  </div>
</template>

<script setup lang="ts">
import { defineComponent, computed, h, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '../composables/useUsers'
import { useToast } from '@/modules/common/composables/useToast'
import { useI18n } from '@/i18n'
import type { User, UserFilters } from '../interfaces/user.interface'
import AdminsTable from '@/modules/admin/components/AdminsTable.vue'
import AdminTd from '@/modules/admin/components/AdminTd.vue'
import AdminPagination from '@/modules/admin/components/AdminPagination.vue'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import UserDeleteModal from '../components/UserDeleteModal.vue'

const router = useRouter()
const { m } = useI18n()
const { users, loading, error, pagination, getUsers, isCurrentUserAdmin, isCurrentUserSuperAdmin } = useUsers()
const toast = useToast()

const columns = computed(() => [
  { key: 'id', label: m.value.adminUsersUi.id },
  { key: 'name', label: m.value.adminUsersUi.name },
  { key: 'username', label: m.value.adminUsersUi.username },
  { key: 'email', label: m.value.adminUsersUi.email },
  { key: 'roles', label: m.value.adminUsersUi.role },
  { key: 'active', label: m.value.commonUi.status },
  { key: 'actions', label: m.value.commonUi.actions, srOnly: true }
])

const filters = ref<UserFilters>({
  search: ''
})

const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)

const groupedUsers = computed(() => {
  const groups = new Map<string, { key: string; name: string; users: User[] }>()

  for (const user of users.value) {
    const tenantId = String(user.tenant_id || user.tenant?.id || '').trim()
    const key = tenantId ? tenantId.toLowerCase() : 'central'
    const name = user.tenant?.name || tenantId || 'Central'

    if (!groups.has(key)) {
      groups.set(key, { key, name, users: [] })
    }

    groups.get(key)!.users.push(user)
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.key === 'central') return -1
    if (b.key === 'central') return 1
    return a.name.localeCompare(b.name)
  })
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  loadUsers()
})

const loadUsers = () => {
  getUsers(pagination.value.current_page, filters.value)
}

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.current_page = 1
    loadUsers()
  }, 500)
}

const handlePageChange = (page: number) => {
  pagination.value.current_page = page
  loadUsers()
}

const navigateToDetail = (user: User) => {
  router.push({
    path: `/admin/users/${user.id}`,
    query: user.tenant_id ? { tenant_id: user.tenant_id } : undefined,
  })
}

const navigateToEdit = (user: User) => {
  router.push({
    path: `/admin/users/${user.id}/edit`,
    query: user.tenant_id ? { tenant_id: user.tenant_id } : undefined,
  })
}

const handleDeleteClick = (user: User) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const handleDeleteConfirmed = () => {
  showDeleteModal.value = false
  userToDelete.value = null
  loadUsers()
}

const UserRow = defineComponent({
  name: 'UserRow',
  props: {
    user: {
      type: Object as () => User,
      required: true,
    },
    isCurrentUserAdmin: {
      type: Boolean,
      required: true,
    },
    isCurrentUserSuperAdmin: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['view', 'edit', 'delete'],
  setup(props, { emit }) {
    return () => h('tr', [
      h(AdminTd, { first: true, variant: 'muted' }, () => props.user.id),
      h(AdminTd, { variant: 'primary' }, () => props.user.name),
      h(AdminTd, { variant: 'muted' }, () => props.user.username || '-'),
      h(AdminTd, { variant: 'muted' }, () => props.user.email),
      h(AdminTd, { variant: 'muted' }, () => {
        const roleName = props.user.roles?.[0]?.name
        return roleName
          ? h('span', { class: 'inline-block' }, roleName)
          : h('span', { class: 'text-gray-400' }, '-')
      }),
      h(AdminTd, { variant: 'muted' }, () => h('span', {
        class: [
          'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
          props.user.active
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        ],
      }, props.user.active ? m.value.commonUi.active : m.value.commonUi.inactive)),
      h(AdminTd, { variant: 'actions' }, () => h('div', { class: 'flex gap-2 justify-end' }, [
        props.isCurrentUserAdmin ? h('button', {
          class: 'text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors',
          title: m.value.commonUi.view,
          onClick: () => emit('view', props.user),
        }, [
          h('span', { class: 'material-icons text-xl', 'aria-hidden': 'true' }, 'visibility'),
          h('span', { class: 'sr-only' }, `${m.value.commonUi.view}, ${props.user.name}`),
        ]) : null,
        props.isCurrentUserAdmin ? h('button', {
          class: 'text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors',
          title: m.value.commonUi.edit,
          onClick: () => emit('edit', props.user),
        }, [
          h('span', { class: 'material-icons text-xl', 'aria-hidden': 'true' }, 'edit'),
          h('span', { class: 'sr-only' }, `${m.value.commonUi.edit}, ${props.user.name}`),
        ]) : null,
        props.isCurrentUserSuperAdmin ? h('button', {
          class: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors',
          title: m.value.commonUi.delete,
          onClick: () => emit('delete', props.user),
        }, [
          h('span', { class: 'material-icons text-xl', 'aria-hidden': 'true' }, 'delete'),
          h('span', { class: 'sr-only' }, `${m.value.commonUi.delete}, ${props.user.name}`),
        ]) : null,
      ])),
    ])
  },
})

</script>
