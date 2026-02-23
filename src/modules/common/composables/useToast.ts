import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

function formatMessage(payload: string | Error | unknown) {
  if (typeof payload === 'string') return payload
  if (payload instanceof Error) return payload.message
  try {
    return JSON.stringify(payload)
  } catch {
    return String(payload)
  }
}

export function showToast(payload: string | Error | unknown) {
  const message = formatMessage(payload)
  toast(message, { 
    theme: 'dark', 
    type: 'error',
    pauseOnHover: false, 
    pauseOnFocusLoss: false
  })
}

export function useToast() {
  return {
    success: (message: string | Error | unknown) => {
      const msg = formatMessage(message)
      toast(msg, { 
        theme: 'dark', 
        type: 'success',
        pauseOnHover: false, 
        pauseOnFocusLoss: false
      })
    },
    error: (message: string | Error | unknown) => {
      const msg = formatMessage(message)
      toast(msg, { 
        theme: 'dark', 
        type: 'error',
        pauseOnHover: false, 
        pauseOnFocusLoss: false
      })
    }
  }
}

export default showToast
