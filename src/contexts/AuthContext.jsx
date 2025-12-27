import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await authAPI.getMe()
          setUser(response.data.data)
          setIsAuthenticated(true)
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setIsAuthenticated(false)
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const data = response.data.data
      
      // If token is returned directly (admin users skip passcode)
      if (data.token && !data.requiresPasscode) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        setIsAuthenticated(true)
        toast.success('Login successful!')
        return { success: true, user: data.user }
      }
      
      // Check if passcode is required (non-admin users)
      if (data.requiresPasscode) {
        return {
          success: true,
          requiresPasscode: true,
          email: data.verification.email,
          previewCode: data.verification.previewCode
        }
      }
      
      return { success: false, message: 'Unexpected response format' }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const verifyPasscode = async (email, passcode) => {
    try {
      const response = await authAPI.verifyPasscode({ email, passcode })
      const data = response.data.data
      
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        setIsAuthenticated(true)
        toast.success('Login successful!')
        return { success: true, user: data.user }
      }
      
      return { success: false, message: 'No token received' }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid passcode'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    verifyPasscode,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

