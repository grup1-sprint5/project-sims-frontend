import { ref } from 'vue'

type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'fleetly-theme'
const THEME_DEFAULT_MIGRATION_KEY = 'fleetly-theme-default-migrated-v1'
const isDark = ref(false)

const applyTheme = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document.documentElement.style.colorScheme = mode
  isDark.value = mode === 'dark'
}

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark'

  const wasMigrated = window.localStorage.getItem(THEME_DEFAULT_MIGRATION_KEY)
  if (!wasMigrated) {
    window.localStorage.setItem(THEME_DEFAULT_MIGRATION_KEY, '1')
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    return 'dark'
  }

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved

  return 'dark'
}

export const initTheme = () => {
  const mode = getPreferredTheme()
  applyTheme(mode)
}

export const forceDark = () => applyTheme('dark')

export const restoreTheme = () => applyTheme(getPreferredTheme())

export const useTheme = () => {
  const toggleTheme = () => {
    const nextMode: ThemeMode = isDark.value ? 'light' : 'dark'
    applyTheme(nextMode)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextMode)
    }
  }

  return {
    isDark,
    toggleTheme,
  }
}
