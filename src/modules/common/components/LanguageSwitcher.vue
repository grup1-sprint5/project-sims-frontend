<template>
  <div class="flex items-center gap-1">
    <button
      v-for="loc in locales"
      :key="loc.code"
      @click="setLocale(loc.code)"
      :class="[
        'px-2 py-0.5 rounded text-xs font-semibold transition',
        locale === loc.code
          ? 'bg-indigo-600 text-white'
          : 'text-gray-400 hover:text-white hover:bg-white/10',
      ]"
    >
      {{ loc.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'

const { locale, locales, setLocale } = useI18n()
</script>
