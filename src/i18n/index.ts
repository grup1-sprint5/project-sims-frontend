import { ref, computed } from 'vue'

type Locale = 'ca' | 'es' | 'en'

const messages = {
  ca: {
    nav: { map: 'Mapa', bookings: 'Reserves', tickets: 'Tiquets', favorites: 'Favorits', profile: 'Perfil' },
    userMenu: { yourProfile: 'El meu perfil', settings: 'Configuració', signOut: 'Tancar sessió', loggedOut: 'Sessió tancada correctament' },
    profile: {
      title: 'El meu perfil',
      subtitle: 'Gestiona la teva informació personal i contrasenya.',
      active: 'Actiu', inactive: 'Inactiu',
      personalInfo: 'Informació personal',
      fullName: 'Nom complet', username: "Nom d'usuari", email: 'Correu electrònic',
      saveChanges: 'Desar canvis', saving: 'Desant…',
      changePassword: 'Canviar contrasenya',
      newPassword: 'Nova contrasenya', newPasswordPlaceholder: 'Mínim 8 caràcters',
      confirmPassword: 'Confirmar nova contrasenya', confirmPasswordPlaceholder: 'Repetir la nova contrasenya',
      mismatch: 'Les contrasenyes no coincideixen.',
      updatePassword: 'Actualitzar contrasenya', updating: 'Actualitzant…',
      profileUpdated: 'Perfil actualitzat correctament', profileError: 'Error actualitzant el perfil',
      passwordUpdated: 'Contrasenya actualitzada correctament', passwordError: 'Error actualitzant la contrasenya',
    },
    adminNav: { dashboard: 'Tauler', map: 'Mapa', users: 'Usuaris', roles: 'Rols', bookings: 'Reserves', vehicles: 'Vehicles', tenants: 'Empreses', tickets: 'Tiquets' },
    admin: { notAuthorizedTitle: 'No autoritzat', notAuthorizedMsg: "El teu compte no té permís per accedir a l'àrea d'administració." },
  },
  es: {
    nav: { map: 'Mapa', bookings: 'Reservas', tickets: 'Tickets', favorites: 'Favoritos', profile: 'Perfil' },
    userMenu: { yourProfile: 'Tu perfil', settings: 'Configuración', signOut: 'Cerrar sesión', loggedOut: 'Sesión cerrada correctamente' },
    profile: {
      title: 'Mi perfil',
      subtitle: 'Gestiona tu información personal y contraseña.',
      active: 'Activo', inactive: 'Inactivo',
      personalInfo: 'Información personal',
      fullName: 'Nombre completo', username: 'Nombre de usuario', email: 'Correo electrónico',
      saveChanges: 'Guardar cambios', saving: 'Guardando…',
      changePassword: 'Cambiar contraseña',
      newPassword: 'Nueva contraseña', newPasswordPlaceholder: 'Mínimo 8 caracteres',
      confirmPassword: 'Confirmar nueva contraseña', confirmPasswordPlaceholder: 'Repetir la nueva contraseña',
      mismatch: 'Las contraseñas no coinciden.',
      updatePassword: 'Actualizar contraseña', updating: 'Actualizando…',
      profileUpdated: 'Perfil actualizado correctamente', profileError: 'Error al actualizar el perfil',
      passwordUpdated: 'Contraseña actualizada correctamente', passwordError: 'Error al actualizar la contraseña',
    },
    adminNav: { dashboard: 'Panel', map: 'Mapa', users: 'Usuarios', roles: 'Roles', bookings: 'Reservas', vehicles: 'Vehículos', tenants: 'Empresas', tickets: 'Tickets' },
    admin: { notAuthorizedTitle: 'No autorizado', notAuthorizedMsg: 'Tu cuenta no tiene permiso para acceder al área de administración.' },
  },
  en: {
    nav: { map: 'Map', bookings: 'Bookings', tickets: 'Tickets', favorites: 'Favorites', profile: 'Profile' },
    userMenu: { yourProfile: 'Your profile', settings: 'Settings', signOut: 'Sign out', loggedOut: 'Logged out successfully' },
    profile: {
      title: 'My Profile',
      subtitle: 'Manage your personal information and password.',
      active: 'Active', inactive: 'Inactive',
      personalInfo: 'Personal information',
      fullName: 'Full name', username: 'Username', email: 'Email',
      saveChanges: 'Save changes', saving: 'Saving…',
      changePassword: 'Change password',
      newPassword: 'New password', newPasswordPlaceholder: 'Minimum 8 characters',
      confirmPassword: 'Confirm new password', confirmPasswordPlaceholder: 'Repeat the new password',
      mismatch: 'Passwords do not match.',
      updatePassword: 'Update password', updating: 'Updating…',
      profileUpdated: 'Profile updated successfully', profileError: 'Error updating profile',
      passwordUpdated: 'Password updated successfully', passwordError: 'Error updating password',
    },
    adminNav: { dashboard: 'Dashboard', map: 'Map', users: 'Users', roles: 'Roles', bookings: 'Bookings', vehicles: 'Vehicles', tenants: 'Tenants', tickets: 'Tickets' },
    admin: { notAuthorizedTitle: 'Not authorized', notAuthorizedMsg: 'Your account does not have permission to access the admin area.' },
  },
}

const locale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'ca')

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'ca', label: 'CA' },
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
]

export function useI18n() {
  const m = computed(() => messages[locale.value])

  const setLocale = (code: Locale) => {
    locale.value = code
    localStorage.setItem('locale', code)
  }

  return { locale, locales: LOCALES, setLocale, m }
}
