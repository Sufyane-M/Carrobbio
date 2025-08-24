import React, { useState, useEffect, createContext, useContext } from 'react'
import { supabase, AdminUser } from '../lib/supabase'
import bcrypt from 'bcryptjs'
import { toast } from 'sonner'
import { UserSession, SecurityStats, LoginAttempt } from '../../shared/types'

interface AuthContextType {
  user: AdminUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AdminUser>
  logout: () => void
  logoutAllSessions: () => Promise<void>
  createAdmin: (email: string, password: string) => Promise<AdminUser>
  deleteAdmin: (adminId: string) => Promise<void>
  getAllAdmins: () => Promise<AdminUser[]>
  isAuthenticated: boolean
  // Advanced auth features
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  getActiveSessions: () => Promise<UserSession[]>
  terminateSession: (sessionId: string) => Promise<void>
  getSecurityStats: () => Promise<SecurityStats>
  getLoginHistory: () => Promise<LoginAttempt[]>
  // Session management
  currentSession: UserSession | null
  sessionExpiry: Date | null
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null)
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null)

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('carrobbio_admin_user')
      
      if (!storedUser) {
        setUser(null)
        setCurrentSession(null)
        setSessionExpiry(null)
        setLoading(false)
        return
      }
      
      const user = JSON.parse(storedUser)
      
      // Set user first
      setUser(user)
      
      // Verify session with backend using HTTP-only cookies
      const isValid = await verifySession()
      if (!isValid) {
        // Session invalid on backend, clear everything
        localStorage.removeItem('carrobbio_admin_user')
        setUser(null)
        setCurrentSession(null)
        setSessionExpiry(null)
      }
    } catch (err) {
      console.error('Error checking auth:', err)
      // Clear everything on error
      localStorage.removeItem('carrobbio_admin_user')
      setUser(null)
      setCurrentSession(null)
      setSessionExpiry(null)
    }
    setLoading(false)
  }

  // Verify session with backend (using HTTP-only cookies)
  const verifySession = async () => {
    try {
      const response = await fetch('/api/auth/verify-session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include HTTP-only cookies
      })
      
      if (!response.ok) {
        // Session invalid, logout
        logout()
        return false
      }
      
      const result = await response.json()
      
      if (!result.success) {
        // Session invalid, logout
        logout()
        return false
      }
      
      return true
    } catch (err) {
      console.error('Errore nella verifica della sessione:', err)
      logout()
      return false
    }
  }

  // Login function with advanced security
  const login = async (email: string, password: string): Promise<AdminUser> => {
    try {
      setLoading(true)
      setError(null)
      
      const ipAddress = await getClientIP()
      const userAgent = navigator.userAgent
      
      // Call backend login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HTTP-only cookies
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
          ip_address: ipAddress,
          user_agent: userAgent
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Errore durante il login')
      }
      
      const { user: adminUser } = result
      
      // Store only user in localStorage (session is handled by HTTP-only cookies)
      const userWithoutPassword = {
        ...adminUser,
        password_hash: '' // Don't store password in localStorage
      }
      
      localStorage.setItem('carrobbio_admin_user', JSON.stringify(userWithoutPassword))
      
      setUser(userWithoutPassword)
      // Session info will be managed by HTTP-only cookies
      setCurrentSession(null)
      setSessionExpiry(null)
      
      toast.success('Login effettuato con successo')
      return userWithoutPassword
      
    } catch (err) {
      console.error('Error during login:', err)
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il login'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  
  // Get client IP address
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call backend logout to clear HTTP-only cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include HTTP-only cookies
      })
    } catch (err) {
      console.error('Error during logout:', err)
    }
    
    // Clear local storage and state
    localStorage.removeItem('carrobbio_admin_user')
    setUser(null)
    setCurrentSession(null)
    setSessionExpiry(null)
    toast.info('Logout effettuato')
  }

  // Logout from all sessions
  const logoutAllSessions = async () => {
    try {
      if (!user) return
      
      const response = await fetch('/api/auth/logout-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HTTP-only cookies
        body: JSON.stringify({
          user_id: user.id
        })
      })
      
      if (!response.ok) {
        throw new Error('Errore durante il logout da tutte le sessioni')
      }
      
      // Clear local storage and state
      localStorage.removeItem('carrobbio_admin_user')
      localStorage.removeItem('carrobbio_admin_session')
      setUser(null)
      setCurrentSession(null)
      setSessionExpiry(null)
      setError(null)
      
      toast.success('Logout effettuato da tutte le sessioni')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il logout'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Forgot password function
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HTTP-only cookies
        body: JSON.stringify({ email: email.toLowerCase() })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Errore durante la richiesta di reset password')
      }
      
      toast.success('Email di reset password inviata con successo')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante la richiesta di reset password'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Reset password function
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HTTP-only cookies
        body: JSON.stringify({ token, new_password: newPassword })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Errore durante il reset della password')
      }
      
      toast.success('Password resettata con successo')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il reset della password'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      if (!user) {
        throw new Error('Utente non autenticato')
      }
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include HTTP-only cookies
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Errore durante il cambio password')
      }
      
      toast.success('Password cambiata con successo')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il cambio password'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Get active sessions
  const getActiveSessions = async (): Promise<UserSession[]> => {
    try {
      if (!user) {
        throw new Error('Utente non autenticato')
      }
      
      const response = await fetch('/api/auth/sessions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include HTTP-only cookies
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Errore durante il recupero delle sessioni')
      }
      
      return result.sessions || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il recupero delle sessioni'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Terminate specific session
  const terminateSession = async (sessionId: string): Promise<void> => {
    try {
      if (!user) {
        throw new Error('Utente non autenticato')
      }
      
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include HTTP-only cookies
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Errore durante la terminazione della sessione')
      }
      
      toast.success('Sessione terminata con successo')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante la terminazione della sessione'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Get security statistics
  const getSecurityStats = async (): Promise<SecurityStats> => {
    try {
      if (!user) {
        throw new Error('Utente non autenticato')
      }
      
      const response = await fetch('/api/auth/security-stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include HTTP-only cookies
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Errore durante il recupero delle statistiche')
      }
      
      return result.stats
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il recupero delle statistiche'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Get login history
  const getLoginHistory = async (): Promise<LoginAttempt[]> => {
    try {
      if (!user) {
        throw new Error('Utente non autenticato')
      }
      
      const response = await fetch('/api/auth/login-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include HTTP-only cookies
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Errore durante il recupero della cronologia')
      }
      
      return result.history || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il recupero della cronologia'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Refresh session (handled automatically by HTTP-only cookies)
  const refreshSession = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include HTTP-only cookies for refresh token
      })
      
      if (!response.ok) {
        // Session refresh failed, logout
        logout()
        return
      }
      
      const result = await response.json()
      
      if (!result.success) {
        // Session refresh failed, logout
        logout()
        return
      }
      
      // Session refreshed successfully (new tokens set as HTTP-only cookies)
      console.log('Session refreshed successfully')
    } catch (err) {
      console.error('Error refreshing session:', err)
      logout()
    }
  }

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Create new admin function
  const createAdmin = async (email: string, password: string): Promise<AdminUser> => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if admin with this email already exists
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()
      
      if (existingAdmin) {
        throw new Error('Un admin con questa email esiste già')
      }
      
      // Hash the password
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)
      
      // Insert new admin
      const { data: newAdmin, error } = await supabase
        .from('admin_users')
        .insert({
          email: email.toLowerCase(),
          password_hash: passwordHash,
          role: 'admin' // Default role
        })
        .select()
        .single()
      
      if (error) {
        throw new Error('Errore durante la creazione dell\'admin: ' + error.message)
      }
      
      return {
        ...newAdmin,
        password_hash: '' // Don't return password hash
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante la creazione dell\'admin'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Delete admin function
  const deleteAdmin = async (adminId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      // Prevent deleting current user
      if (user && user.id === adminId) {
        throw new Error('Non puoi eliminare te stesso')
      }
      
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId)
      
      if (error) {
        throw new Error('Errore durante l\'eliminazione dell\'admin: ' + error.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'eliminazione dell\'admin'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Get all admins function
  const getAllAdmins = async (): Promise<AdminUser[]> => {
    try {
      // Verifica che l'utente sia autenticato
      if (!user) {
        throw new Error('Utente non autenticato')
      }
      
      // Chiama l'endpoint API del backend
      const response = await fetch('/api/auth/admins', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include HTTP-only cookies
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Errore di rete' }))
        throw new Error(errorData.error || `Errore HTTP: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Errore durante il caricamento degli admin')
      }
      
      // Restituisce i dati degli admin
      return result.data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il caricamento degli admin'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const isAuthenticated = !!user

  return {
    user,
    loading,
    error,
    login,
    logout,
    logoutAllSessions,
    createAdmin,
    deleteAdmin,
    getAllAdmins,
    isAuthenticated,
    // Advanced auth features
    forgotPassword,
    resetPassword,
    changePassword,
    getActiveSessions,
    terminateSession,
    getSecurityStats,
    getLoginHistory,
    // Session management
    currentSession,
    sessionExpiry,
    refreshSession
  }
}

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const WrappedComponent = (props: P) => {
    const { isAuthenticated, loading } = useAuthContext()
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      )
    }
    
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Accesso Richiesto
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Devi effettuare il login per accedere a questa pagina.
              </p>
            </div>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
  
  return WrappedComponent
}

export default useAuth