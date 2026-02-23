import type { RouteRecordRaw } from 'vue-router'

export const userRoutes: RouteRecordRaw[] = [
  {
    path: 'users',
    name: 'Users',
    component: () => import('../pages/UserPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: 'users/:id',
    name: 'UserDetail',
    component: () => import('../pages/UserDetailPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: 'users/:id/edit',
    name: 'UserEdit',
    component: () => import('../pages/UserFormPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: 'users/create',
    name: 'UserCreate',
    component: () => import('../pages/UserFormPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]
