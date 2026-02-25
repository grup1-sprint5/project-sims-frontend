import { ref } from 'vue'
import {
  HomeIcon,
  MapIcon,
  UsersIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  TruckIcon,
  TicketIcon,
  BuildingOfficeIcon,
} from '@heroicons/vue/24/outline'

export function useAdmin() {
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, current: true },
    { name: 'Vehicle Map', href: '/admin/map', icon: MapIcon, current: false },
    { name: 'Users', href: '/admin/users', icon: UsersIcon, current: false },
    { name: 'Roles', href: '/admin/roles', icon: ShieldCheckIcon, current: false },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarDaysIcon, current: false },
    { name: 'Vehicles', href: '/admin/vehicles', icon: TruckIcon, current: false },
    { name: 'Tenants', href: '/admin/tenants', icon: BuildingOfficeIcon, current: false },
    { name: 'Tickets', href: '/admin/tickets', icon: TicketIcon, current: false },
  ]

  const sidebarOpen = ref(false)

  return { navigation, sidebarOpen }
}
