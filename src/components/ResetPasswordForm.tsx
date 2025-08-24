import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { useAuthContext } from '../hooks/useAuth'
import { toast } from 'sonner'

interface ResetPasswordFormProps {
  token: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess, onError }) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({})
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [], color: 'red' })
  const [isTokenValid, setIsTokenValid] = useState(true)

  const { resetPassword } = useAuthContext()

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (password.length === 0) {
      return { score: 0, feedback: [], color: 'red' }
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

    // Determine color based on score
    let color = 'red'
    if (score >= 4) color = 'green'
    else if (score >= 3) color = 'yellow'
    else if (score >= 2) color = 'orange'

    return { score, feedback, color }
  }

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password))
  }, [password])

  // Validate form
  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {}

    if (!password) {
      newErrors.password = 'Password è richiesta'
    } else if (password.length < 8) {
      newErrors.password = 'Password deve essere di almeno 8 caratteri'
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Password troppo debole. Segui i suggerimenti per migliorarla.'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Conferma password è richiesta'
    } else if (password !== confirmPassword) {
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

    setIsSubmitting(true)
    setErrors({})

    try {
      await resetPassword(token, password)
      setIsSuccess(true)
      toast.success('Password reimpostata con successo!')
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        onSuccess?.()
      }, 3000)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il reset della password'
      
      // Check if token is invalid/expired
      if (errorMessage.includes('token') || errorMessage.includes('scaduto') || errorMessage.includes('invalid')) {
        setIsTokenValid(false)
        onError?.(errorMessage)
      } else {
        setErrors({ general: errorMessage })
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Password Reimpostata!
            </h2>
            <p className="text-gray-600">
              La tua password è stata aggiornata con successo
            </p>
          </div>

          {/* Success Message */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-green-800 mb-2">
                ✅ Password aggiornata con successo
              </p>
              <p className="text-sm text-green-700">
                Ora puoi accedere con la tua nuova password
              </p>
            </div>
          </div>

          {/* Auto redirect notice */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Verrai reindirizzato automaticamente al login tra pochi secondi...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!isTokenValid) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
          {/* Error Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Link Non Valido
            </h2>
            <p className="text-gray-600">
              Il link di reset password è scaduto o non valido
            </p>
          </div>

          {/* Error Message */}
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-red-800 mb-2">
                ❌ Token di reset non valido
              </p>
              <p className="text-sm text-red-700">
                Il link potrebbe essere scaduto o già utilizzato
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Per reimpostare la password, richiedi un nuovo link di reset.
            </p>
            <button
              onClick={() => window.location.href = '/admin/login'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Torna al Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Nuova Password
          </h2>
          <p className="text-gray-600">
            Inserisci una password sicura per il tuo account
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Nuova Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-600" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                disabled={isSubmitting}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-600 hover:text-gray-800" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-600 hover:text-gray-800" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">Sicurezza Password</span>
                  <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                    {passwordStrength.score === 5 ? 'Molto Forte' :
                     passwordStrength.score === 4 ? 'Forte' :
                     passwordStrength.score === 3 ? 'Media' :
                     passwordStrength.score === 2 ? 'Debole' : 'Molto Debole'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Migliora la password:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Conferma Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-600" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-600 hover:text-gray-800" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-600 hover:text-gray-800" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
            
            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-2 flex items-center">
                {password === confirmPassword ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">Le password corrispondono</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">Le password non corrispondono</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || passwordStrength.score < 3}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Aggiornamento in corso...
              </div>
            ) : (
              'Aggiorna Password'
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            La tua nuova password sarà crittografata e memorizzata in modo sicuro.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordForm