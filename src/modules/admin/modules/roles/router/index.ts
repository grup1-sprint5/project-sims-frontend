import type { RouteRecordRaw } from 'vue-router'
import RolePage from '../pages/RolePage.vue'
import RoleFormPage from '../pages/RoleFormPage.vue'
import RoleDetailPage from '../pages/RoleDetailPage.vue'

export const rolesRoutes: RouteRecordRaw[] = [
  {
    path: 'roles',
    name: 'Roles',
    component: RolePage,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: 'roles/create',
    name: 'CreateRole',
    component: RoleFormPage,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: 'roles/:id',
    name: 'RoleDetail',
    component: RoleDetailPage,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: 'roles/:id/edit',
    name: 'EditRole',
    component: RoleFormPage,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
]
