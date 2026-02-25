import type { RouteRecordRaw } from 'vue-router'

export const tenantRoutes: RouteRecordRaw[] = [
  {
    path: 'tenants',
    name: 'AdminTenants',
    component: () => import('../pages/TenantsPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: 'tenants/create',
    name: 'AdminTenantCreate',
    component: () => import('../pages/CreateTenantPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: 'tenants/:id',
    name: 'AdminTenantShow',
    component: () => import('../pages/TenantDetailPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: 'tenants/:id/edit',
    name: 'AdminTenantEdit',
    component: () => import('../pages/EditTenantPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]
