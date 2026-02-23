import type { RouteRecordRaw } from 'vue-router'

export const vehicleRoutes: RouteRecordRaw[] = [
  {
    path: 'vehicles',
    name: 'AdminVehicles',
    component: () => import('../pages/VehiclesPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: 'vehicles/create',
    name: 'AdminVehicleCreate',
    component: () => import('../pages/CreateVehiclePage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: 'vehicles/:id',
    name: 'AdminVehicleShow',
    component: () => import('../pages/ShowVehiclePage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: 'vehicles/:id/edit',
    name: 'AdminVehicleEdit',
    component: () => import('../pages/EditVehiclePage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]
