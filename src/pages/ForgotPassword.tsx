import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ForgotPasswordForm } from '../components'
import { AuthProvider } from '../hooks/useAuth'

const ForgotPasswordPage: React.FC = () => {
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const handleSuccess = (email: string) => {
    setEmailSent(true)
    setSentEmail(email)
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

        {!emailSent ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Password Dimenticata
              </h2>
              <p className="mt-2 text-gray-600">
                Inserisci la tua email per ricevere le istruzioni per il reset della password
              </p>
            </div>
            <ForgotPasswordForm onSuccess={handleSuccess} />
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
                Email Inviata!
              </h3>
              <p className="text-gray-600 mb-6">
                Abbiamo inviato le istruzioni per il reset della password a:
              </p>
              <p className="text-lg font-medium text-red-600 mb-6">
                {sentEmail}
              </p>
              <p className="text-sm text-gray-600 mb-8">
                Controlla la tua casella di posta elettronica e segui le istruzioni nel messaggio.
                Se non vedi l'email, controlla anche la cartella spam.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setEmailSent(false)
                    setSentEmail('')
                  }}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Invia di nuovo
                </button>
                <Link
                  to="/admin"
                  className="block w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-center font-medium transition-colors"
                >
                  Torna al Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const ForgotPassword: React.FC = () => {
  return (
    <AuthProvider>
      <ForgotPasswordPage />
    </AuthProvider>
  )
}