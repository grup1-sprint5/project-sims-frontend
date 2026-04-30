import type { RouteRecordRaw } from 'vue-router'

export const geofenceRoutes: RouteRecordRaw[] = [
  {
    path: 'geofences',
    name: 'AdminGeofences',
    component: () => import('../pages/GeofencesPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: 'geofences/create',
    name: 'AdminGeofenceCreate',
    component: () => import('../pages/GeofenceFormPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: 'geofences/:id',
    name: 'AdminGeofenceDetail',
    component: () => import('../pages/GeofenceDetailPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: 'geofences/:id/edit',
    name: 'AdminGeofenceEdit',
    component: () => import('../pages/GeofenceFormPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: 'geofence-events',
    name: 'AdminGeofenceEvents',
    component: () => import('../pages/GeofenceEventsPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]
