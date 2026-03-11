import { ref, computed } from 'vue'
import { useToast } from '@/modules/common/composables/useToast'
import api from '@/services/api'
import type { PermissionGroup, Permission } from '../interfaces/role.interface'

export const usePermissions = () => {
  const { error: showError } = useToast()

  const permissions = ref<PermissionGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Group permissions by action type for table rendering
  const permissionModules = computed(() => {
    const modules: Record<
      string,
      {
        module: string
        view?: Permission
        manage?: Permission
        delete?: Permission
      }
    > = {}

    permissions.value.forEach((group) => {
      if (!modules[group.module]) {
        modules[group.module] = { module: group.module }
      }

      group.permissions.forEach((perm) => {
        const name = perm.name || ''

        if (name.endsWith('.view')) {
          modules[group.module]!.view = perm
        } else if (name.endsWith('.manage') || name.endsWith('.create') || name.endsWith('.edit')) {
          modules[group.module]!.manage = perm
        } else if (name.endsWith('.delete')) {
          modules[group.module]!.delete = perm
        }
      })
    })

    return Object.values(modules).sort((a, b) => a.module.localeCompare(b.module))
  })

  const getPermissions = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/permissions')
      const data = response.data

      // Transform flat response into PermissionGroup structure
      // The backend sometimes returns all permissions under a generic key (e.g. "Other").
      // In that case derive module groups from the permission name prefix (e.g. "users.view" -> "users").
      const modulesMap: Record<string, Permission[]> = {}

      for (const perms of Object.values(data)) {
        (perms as any[]).forEach((p) => {
          const name: string = p.name || ''
          const namePrefix = name.split('.')[0] || ''
          const moduleKey = p.module && p.module !== 'Other' ? p.module : (namePrefix || 'Other')

          if (!modulesMap[moduleKey]) {
            modulesMap[moduleKey] = []
          }

          modulesMap[moduleKey].push({
            id: p.id,
            name: p.name,
            description: p.description || '',
            module: p.module || moduleKey,
          })
        })
      }

      const groupedPermissions: PermissionGroup[] = Object.entries(modulesMap).map(([module, perms]) => ({
        module,
        permissions: perms,
      }))

      permissions.value = groupedPermissions.sort((a, b) => a.module.localeCompare(b.module))
    } catch (err) {
      error.value = 'Failed to load permissions'
      showError('Error al cargar permisos')
    } finally {
      loading.value = false
    }
  }

  const getPermissionsByRole = (rolePermissionIds: number[]): Record<string, number[]> => {
    const result: Record<string, number[]> = {}

    permissionModules.value.forEach((module) => {
      result[module.module] = []
      if (module.view && rolePermissionIds.includes(module.view.id)) {
        result[module.module]!.push(module.view.id)
      }
      if (module.manage && rolePermissionIds.includes(module.manage.id)) {
        result[module.module]!.push(module.manage.id)
      }
      if (module.delete && rolePermissionIds.includes(module.delete.id)) {
        result[module.module]!.push(module.delete.id)
      }
    })

    return result
  }

  return {
    permissions,
    permissionModules,
    loading,
    error,
    getPermissions,
    getPermissionsByRole,
  }
}
