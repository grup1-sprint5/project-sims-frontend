import axios from 'axios'
import showToast from '@/modules/common/composables/useToast'

// NOTE: previous comment contained Spanish/Catalan; translated to English
// This file configures axios to use the API based on cookies.
// If stronger security is required, httpOnly cookies would be preferable,
// but then the frontend cannot access the token to add it to requests.
// For now the token is read from cookies and added to request headers.
// Improve security later as needed.

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor to add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1]

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    const msg = error?.message || 'Request error'
    try {
      showToast(msg)
    } catch (e) {
      console.error(e)
    }
    return Promise.reject(error)
  }
)
export default apiClient
