import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_PROXY_API_TARGET || 'http://127.0.0.1:8001'

  return {
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
    ],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: false,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
