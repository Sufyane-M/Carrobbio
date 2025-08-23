import React, { useState, useEffect } from 'react'
import { TrashIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useAuthContext } from '../hooks/useAuth';
import { supabase, AdminUser } from '../lib/supabase'

interface AdminManagementProps {
  currentUser: AdminUser
  isMobile?: boolean
}

interface CreateAdminForm {
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export const AdminManagement: React.FC<AdminManagementProps> = ({ currentUser, isMobile = false }) => {
  const [formData, setFormData] = useState<CreateAdminForm>({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  
  const { createAdmin, deleteAdmin, getAllAdmins } = useAuthContext()

  // Load existing admins
  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true)
      const adminsList = await getAllAdmins()
      setAdmins(adminsList)
    } catch (error) {
      console.error('Error loading admins:', error)
    } finally {
      setLoadingAdmins(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email è richiesta'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida'
    } else if (admins.some(admin => admin.email.toLowerCase() === formData.email.toLowerCase())) {
      newErrors.email = 'Email già esistente'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password è richiesta'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password deve essere di almeno 8 caratteri'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Conferma password è richiesta'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)
    setErrors({})

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      await createAdmin(formData.email, formData.password)
      
      setSuccess('Admin creato con successo!')
      setFormData({ email: '', password: '', confirmPassword: '' })
      
      // Reload admins list
      await loadAdmins()
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Errore durante la creazione dell\'admin' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (adminId === currentUser.id) {
      alert('Non puoi eliminare te stesso!')
      return
    }

    if (!confirm(`Sei sicuro di voler eliminare l'admin ${adminEmail}?`)) {
      return
    }

    try {
      await deleteAdmin(adminId)
      setSuccess('Admin eliminato con successo!')
      await loadAdmins()
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Errore durante l\'eliminazione dell\'admin' })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`space-y-${isMobile ? '6' : '8'}`}>
      {/* Create New Admin Form */}
      <div className="bg-gray-800 border border-gray-700 hover:bg-gray-750 hover:shadow-lg transition-all duration-200 rounded-lg">
        <div className={`${isMobile ? 'p-4 pb-2' : 'p-6 pb-4'}`}>
          <h3 className="text-lg font-semibold text-gray-100">
            Crea Nuovo Admin
          </h3>
        </div>
        <div className={`${isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
          <div className={`${isMobile ? 'w-full' : 'max-w-md'}`}>
            <p className="text-gray-400 mb-4">
              Aggiungi un nuovo amministratore al sistema.
            </p>
            
            {success && (
              <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}
            
            {errors.general && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-gray-100 placeholder-gray-400 ${
                    errors.email ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="admin@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3 py-2 pr-10 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-gray-100 placeholder-gray-400 ${
                      errors.password ? 'border-red-600' : 'border-gray-600'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Conferma Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full px-3 py-2 pr-10 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-gray-100 placeholder-gray-400 ${
                      errors.confirmPassword ? 'border-red-600' : 'border-gray-600'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                  >
                    {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                {loading ? 'Creazione in corso...' : 'Crea Admin'}
              </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Existing Admins List */}
      <div className="bg-gray-800 border border-gray-700 hover:bg-gray-750 hover:shadow-lg transition-all duration-200 rounded-lg">
        <div className={`${isMobile ? 'p-4 pb-2' : 'p-6 pb-4'}`}>
          <h3 className="text-lg font-semibold text-gray-100">
            Admin Esistenti
          </h3>
        </div>
        <div className={`${isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
          {loadingAdmins ? (
            <div className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
              <div className={`animate-spin rounded-full ${isMobile ? 'h-6 w-6' : 'h-8 w-8'} border-b-2 border-primary-500 mx-auto mb-4`}></div>
              <p className={`${isMobile ? 'text-sm' : ''} text-gray-400`}>Caricamento admin...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y divide-gray-700 ${isMobile ? 'text-sm' : ''}`}>
                <thead className="bg-gray-700">
                  <tr>
                    <th className={`${isMobile ? 'px-3 py-2' : 'px-6 py-3'} text-left text-xs font-medium text-gray-300 uppercase tracking-wider`}>
                      Email
                    </th>
                    <th className={`${isMobile ? 'px-3 py-2' : 'px-6 py-3'} text-left text-xs font-medium text-gray-300 uppercase tracking-wider`}>
                      Data Creazione
                    </th>
                    <th className={`${isMobile ? 'px-3 py-2' : 'px-6 py-3'} text-left text-xs font-medium text-gray-300 uppercase tracking-wider`}>
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className={`${isMobile ? 'px-3 py-3' : 'px-6 py-4'} whitespace-nowrap`}>
                        <div className="flex items-center">
                          <span className={`${isMobile ? 'text-sm' : ''} font-medium text-gray-100`}>
                            {admin.email}
                          </span>
                          {admin.id === currentUser.id && (
                            <span className={`${isMobile ? 'ml-1 px-1.5 py-0.5' : 'ml-2 px-2 py-1'} inline-flex text-xs font-semibold rounded-full bg-primary-900/30 text-primary-400`}>
                              Tu
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`${isMobile ? 'px-3 py-3' : 'px-6 py-4'} whitespace-nowrap`}>
                        <span className={`${isMobile ? 'text-sm' : ''} text-gray-300`}>
                          {formatDate(admin.created_at)}
                        </span>
                      </td>
                      <td className={`${isMobile ? 'px-3 py-3' : 'px-6 py-4'} whitespace-nowrap ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                        {admin.id !== currentUser.id ? (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                            className={`p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors ${isMobile ? 'touch-manipulation' : ''}`}
                          >
                            <TrashIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                          </button>
                        ) : (
                          <span className={`${isMobile ? 'text-sm' : ''} text-gray-500`}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {admins.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    Nessun admin trovato.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}