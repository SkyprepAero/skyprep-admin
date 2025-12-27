import axios from 'axios'
import toast from 'react-hot-toast'
import { config } from '../config/env'

// Create axios instance with default config
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (requestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for debugging
    requestConfig.metadata = { startTime: new Date() }
    
    // Log request in development
    if (config.IS_DEVELOPMENT) {
      console.log(`🚀 API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`)
    }

    return requestConfig
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata?.startTime
    
    // Log response in development
    if (config.IS_DEVELOPMENT) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`)
    }

    return response
  },
  (error) => {
    // Calculate request duration
    const duration = new Date() - error.config?.metadata?.startTime
    
    // Log error in development
    if (config.IS_DEVELOPMENT) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, error.response?.data)
    }

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          toast.error('Session expired. Please login again.')
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
          
        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.')
          break
          
        case 404:
          // Not found
          toast.error('The requested resource was not found.')
          break
          
        case 422:
          // Validation error
          const message = data?.message || 'Validation failed'
          toast.error(message)
          break
          
        case 500:
          // Server error
          toast.error('Server error. Please try again later.')
          break
          
        default:
          // Other errors
          const errorMessage = data?.message || `Request failed with status ${status}`
          toast.error(errorMessage)
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other error
      toast.error('An unexpected error occurred.')
    }

    return Promise.reject(error)
  }
)

// Add retry logic for failed requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    
    // Retry logic for network errors
    if (!config || !config.retry) {
      config.retry = 0
    }
    
    if (config.retry < 2 && error.code === 'NETWORK_ERROR') {
      config.retry += 1
      const delay = Math.pow(2, config.retry) * 1000 // Exponential backoff
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return api(config)
    }
    
    return Promise.reject(error)
  }
)

export default api
