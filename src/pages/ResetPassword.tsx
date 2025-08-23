import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ResetPasswordForm } from '../components'
import { AuthProvider } from '../hooks/useAuth'

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [passwordReset, setPasswordReset] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      // Redirect to forgot password if no token
      navigate('/forgot-password')
      return
    }
    setToken(tokenParam)
  }, [searchParams, navigate])

  const handleSuccess = () => {
    setPasswordReset(true)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica del token in corso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to Login Link */}
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna al login
          </Link>
        </div>

        {!passwordReset ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Reset Password
              </h2>
              <p className="mt-2 text-gray-600">
                Inserisci la tua nuova password
              </p>
            </div>
            <ResetPasswordForm token={token} onSuccess={handleSuccess} />
          </>
        ) : (
          <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Password Aggiornata!
              </h3>
              <p className="text-gray-600 mb-8">
                La tua password è stata aggiornata con successo.
              </p>
              <Link
                to="/admin"
                className="inline-flex justify-center w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Vai al Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const ResetPassword: React.FC = () => {
  return (
    <AuthProvider>
      <ResetPasswordPage />
    </AuthProvider>
  )
}