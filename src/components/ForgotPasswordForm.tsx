import React, { useState } from 'react'
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthContext } from '../hooks/useAuth'
import { toast } from 'sonner'

interface ForgotPasswordFormProps {
  onBack?: () => void
  onSuccess?: (email: string) => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({})
  const [cooldownTime, setCooldownTime] = useState(0)

  const { forgotPassword } = useAuthContext()

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cooldownTime > 0) {
      toast.error(`Attendi ${cooldownTime} secondi prima di richiedere un nuovo reset.`)
      return
    }

    const newErrors: { email?: string } = {}

    if (!email.trim()) {
      newErrors.email = 'Email è richiesta'
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'Formato email non valido'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await forgotPassword(email.trim().toLowerCase())
      setIsSuccess(true)
      
      // Set cooldown to prevent spam (2 minutes)
      setCooldownTime(120)
      const cooldownInterval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            clearInterval(cooldownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      toast.success('Email di reset inviata con successo!')
      
      // Auto redirect after 5 seconds
      setTimeout(() => {
        onSuccess?.(email)
      }, 5000)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'invio dell\'email'
      setErrors({ general: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

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
              Email Inviata!
            </h2>
            <p className="text-gray-600">
              Controlla la tua casella di posta elettronica
            </p>
          </div>

          {/* Success Message */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-green-800 mb-2">
                Email di reset password inviata a:
              </p>
              <p className="text-sm text-green-700 font-mono bg-green-100 px-3 py-1 rounded">
                {email}
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <p className="text-sm text-gray-700">
                Controlla la tua casella di posta elettronica (inclusa la cartella spam)
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <p className="text-sm text-gray-700">
                Clicca sul link nell'email per reimpostare la password
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <p className="text-sm text-gray-700">
                Il link è valido per 1 ora dalla ricezione
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna al Login
            </button>
            
            {cooldownTime > 0 && (
              <div className="text-center">
                <p className="text-xs text-gray-600">
                  Puoi richiedere un nuovo reset tra {formatTime(cooldownTime)}
                </p>
              </div>
            )}
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
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Password Dimenticata?
          </h2>
          <p className="text-gray-600">
            Inserisci la tua email per ricevere le istruzioni di reset
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

        {/* Cooldown Warning */}
        {cooldownTime > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Attendi prima di richiedere un nuovo reset
                </p>
                <p className="text-sm text-yellow-600">
                  Tempo rimanente: {formatTime(cooldownTime)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-600" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="admin@carrobbio.com"
                disabled={isSubmitting || cooldownTime > 0}
                autoComplete="email"
                autoFocus
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || cooldownTime > 0}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Invio in corso...
              </div>
            ) : (
              <div className="flex items-center">
                <Send className="w-4 h-4 mr-2" />
                Invia Email di Reset
              </div>
            )}
          </button>
        </form>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna al Login
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            Per motivi di sicurezza, riceverai l'email solo se l'indirizzo è registrato nel sistema.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordForm