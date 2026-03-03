import type { RouteRecordRaw } from 'vue-router'

export const clientRoutes: RouteRecordRaw[] = [
  // ── Bookings ──────────────────────────────────────────────────────────────
  {
    path: 'bookings',
    name: 'ClientBookings',
    component: () => import('../pages/BookingsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: 'bookings/new',
    name: 'ClientNewBooking',
    component: () => import('../pages/NewBookingPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: 'bookings/:id',
    name: 'ClientBookingDetail',
    component: () => import('../pages/BookingDetailPage.vue'),
    meta: { requiresAuth: true },
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  {
    path: 'perfil',
    name: 'ClientProfile',
    component: () => import('../pages/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },

  // ── Favorites ─────────────────────────────────────────────────────────────
  {
    path: 'favoritos',
    name: 'ClientFavorites',
    component: () => import('../pages/FavoritesPage.vue'),
    meta: { requiresAuth: true },
  },

]
