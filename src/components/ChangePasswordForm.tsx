import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Check, X, AlertTriangle } from 'lucide-react'
import { useAuthContext } from '../hooks/useAuth'
import { toast } from 'sonner'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
  text: string
}

interface ChangePasswordFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSuccess,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { changePassword } = useAuthContext()

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (password.length === 0) {
      return {
        score: 0,
        feedback: ['Inserisci una password'],
        color: 'gray',
        text: 'Nessuna password'
      }
    }

    // Length check
    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('Almeno 8 caratteri')
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Almeno una lettera maiuscola')
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Almeno una lettera minuscola')
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('Almeno un numero')
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
    } else {
      feedback.push('Almeno un carattere speciale')
    }

    // Additional length bonus
    if (password.length >= 12) {
      score += 1
    }

    // Determine strength level
    let color: string
    let text: string

    if (score <= 2) {
      color = 'red'
      text = 'Debole'
    } else if (score <= 4) {
      color = 'yellow'
      text = 'Media'
    } else if (score <= 5) {
      color = 'blue'
      text = 'Forte'
    } else {
      color = 'green'
      text = 'Molto forte'
    }

    return { score, feedback, color, text }
  }

  const passwordStrength = calculatePasswordStrength(formData.newPassword)

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Current password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'La password attuale è richiesta'
    }

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'La nuova password è richiesta'
    } else if (passwordStrength.score < 3) {
      newErrors.newPassword = 'La password non è abbastanza sicura'
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'La nuova password deve essere diversa da quella attuale'
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'La conferma password è richiesta'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      await changePassword(formData.currentPassword, formData.newPassword)
      toast.success('Password cambiata con successo')
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      onSuccess?.()
    } catch (error: any) {
      console.error('Password change error:', error)
      
      // Handle specific error cases
      if (error.message?.includes('current password')) {
        setErrors({ currentPassword: 'Password attuale non corretta' })
      } else if (error.message?.includes('weak password')) {
        setErrors({ newPassword: 'La password non soddisfa i requisiti di sicurezza' })
      } else {
        toast.error(error.message || 'Errore durante il cambio password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-gray-800 rounded-lg shadow-sm border border-gray-700 ${className}`}>
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center">
          <Lock className="w-6 h-6 text-primary-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              Cambia Password
            </h3>
            <p className="text-sm text-gray-400">
              Aggiorna la tua password per mantenere l'account sicuro
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Password Attuale
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              className={`w-full px-4 py-3 pr-12 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-gray-100 placeholder-gray-400 transition-colors ${
                errors.currentPassword ? 'border-red-600 bg-red-900/20' : 'border-gray-600'
              }`}
              placeholder="Inserisci la password attuale"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
              disabled={loading}
            >
              {showPasswords.current ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <div className="mt-2 flex items-center text-sm text-red-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {errors.currentPassword}
            </div>
          )}
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Nuova Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`w-full px-4 py-3 pr-12 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-gray-100 placeholder-gray-400 transition-colors ${
                errors.newPassword ? 'border-red-600 bg-red-900/20' : 'border-gray-600'
              }`}
              placeholder="Inserisci la nuova password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
              disabled={loading}
            >
              {showPasswords.new ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Sicurezza password:</span>
                <span className={`text-sm font-medium text-${passwordStrength.color}-400`}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                ></div>
              </div>
              
              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                {[
                  { test: formData.newPassword.length >= 8, text: 'Almeno 8 caratteri' },
                  { test: /[A-Z]/.test(formData.newPassword), text: 'Una lettera maiuscola' },
                  { test: /[a-z]/.test(formData.newPassword), text: 'Una lettera minuscola' },
                  { test: /\d/.test(formData.newPassword), text: 'Un numero' },
                  { test: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword), text: 'Un carattere speciale' }
                ].map((requirement, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {requirement.test ? (
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <X className="w-4 h-4 text-gray-500 mr-2" />
                    )}
                    <span className={requirement.test ? 'text-green-400' : 'text-gray-400'}>
                      {requirement.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.newPassword && (
            <div className="mt-2 flex items-center text-sm text-red-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {errors.newPassword}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Conferma Nuova Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-4 py-3 pr-12 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-gray-100 placeholder-gray-400 transition-colors ${
                errors.confirmPassword ? 'border-red-600 bg-red-900/20' : 'border-gray-600'
              }`}
              placeholder="Conferma la nuova password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
              disabled={loading}
            >
              {showPasswords.confirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Password Match Indicator */}
          {formData.confirmPassword && (
            <div className="mt-2 flex items-center text-sm">
              {formData.newPassword === formData.confirmPassword ? (
                <>
                  <Check className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-400">Le password corrispondono</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-red-400">Le password non corrispondono</span>
                </>
              )}
            </div>
          )}
          
          {errors.confirmPassword && (
            <div className="mt-2 flex items-center text-sm text-red-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {errors.confirmPassword}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-600 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Annulla
            </button>
          )}
          <button
            type="submit"
            disabled={loading || passwordStrength.score < 3}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Aggiornamento...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Cambia Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChangePasswordForm