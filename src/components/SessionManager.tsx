import React, { useState, useEffect } from 'react'
import { Monitor, Smartphone, Tablet, MapPin, Clock, Trash2, Shield, AlertTriangle, RefreshCw } from 'lucide-react'
import { useAuthContext } from '../hooks/useAuth'
import { toast } from 'sonner'
import { UserSession } from '../../shared/types'

interface SessionManagerProps {
  className?: string
}

const SessionManager: React.FC<SessionManagerProps> = ({ className = '' }) => {
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(true)
  const [terminating, setTerminating] = useState<string | null>(null)
  const [terminatingAll, setTerminatingAll] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const { getActiveSessions, terminateSession, logoutAllSessions } = useAuthContext()

  // Load active sessions
  const loadSessions = async () => {
    try {
      setRefreshing(true)
      const activeSessions = await getActiveSessions()
      setSessions(activeSessions)
    } catch (error) {
      console.error('Error loading sessions:', error)
      toast.error('Errore nel caricamento delle sessioni')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load sessions on component mount
  useEffect(() => {
    loadSessions()
  }, [])

  // Get device icon based on user agent
  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase()
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5" />
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="w-5 h-5" />
    }
    return <Monitor className="w-5 h-5" />
  }

  // Get browser name from user agent
  const getBrowserName = (userAgent: string) => {
    const ua = userAgent.toLowerCase()
    if (ua.includes('chrome')) return 'Chrome'
    if (ua.includes('firefox')) return 'Firefox'
    if (ua.includes('safari')) return 'Safari'
    if (ua.includes('edge')) return 'Edge'
    if (ua.includes('opera')) return 'Opera'
    return 'Browser Sconosciuto'
  }

  // Get OS name from user agent
  const getOSName = (userAgent: string) => {
    const ua = userAgent.toLowerCase()
    if (ua.includes('windows')) return 'Windows'
    if (ua.includes('mac')) return 'macOS'
    if (ua.includes('linux')) return 'Linux'
    if (ua.includes('android')) return 'Android'
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS'
    return 'OS Sconosciuto'
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Ora'
    if (diffMins < 60) return `${diffMins} min fa`
    if (diffHours < 24) return `${diffHours} ore fa`
    if (diffDays < 7) return `${diffDays} giorni fa`
    
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Check if session is expiring soon (within 30 minutes)
  const isExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diffMs = expiry.getTime() - now.getTime()
    return diffMs < 30 * 60 * 1000 && diffMs > 0 // 30 minutes
  }

  // Handle single session termination
  const handleTerminateSession = async (sessionId: string) => {
    if (terminating) return

    const session = sessions.find(s => s.id === sessionId)
    if (session?.is_current) {
      toast.error('Non puoi terminare la sessione corrente')
      return
    }

    setTerminating(sessionId)
    try {
      await terminateSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      toast.success('Sessione terminata con successo')
    } catch (error) {
      console.error('Error terminating session:', error)
      toast.error('Errore nella terminazione della sessione')
    } finally {
      setTerminating(null)
    }
  }

  // Handle all sessions termination
  const handleTerminateAllSessions = async () => {
    if (terminatingAll) return

    const otherSessions = sessions.filter(s => !s.is_current)
    if (otherSessions.length === 0) {
      toast.info('Nessuna altra sessione da terminare')
      return
    }

    setTerminatingAll(true)
    try {
      await logoutAllSessions()
      setSessions(prev => prev.filter(s => s.is_current))
      toast.success(`${otherSessions.length} sessioni terminate con successo`)
    } catch (error) {
      console.error('Error terminating all sessions:', error)
      toast.error('Errore nella terminazione delle sessioni')
    } finally {
      setTerminatingAll(false)
    }
  }

  if (loading) {
    return (
      <div className={`bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800 rounded-lg shadow-sm border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-primary-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-100">
                Sessioni Attive
              </h3>
              <p className="text-sm text-gray-400">
                {sessions.length} sessione{sessions.length !== 1 ? 'i' : ''} attiva{sessions.length !== 1 ? 'e' : ''}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadSessions}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Aggiorna
            </button>
            {sessions.filter(s => !s.is_current).length > 0 && (
              <button
                onClick={handleTerminateAllSessions}
                disabled={terminatingAll}
                className="inline-flex items-center px-3 py-2 border border-red-600 shadow-sm text-sm leading-4 font-medium rounded-md text-red-400 bg-red-900/20 hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 focus:ring-offset-gray-800 disabled:opacity-50"
              >
                {terminatingAll ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-1"></div>
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
                )}
                Termina Tutte
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="p-6">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Nessuna sessione attiva</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`border rounded-lg p-4 transition-colors ${
                  session.is_current
                    ? 'border-green-700 bg-green-900/20'
                    : isExpiringSoon(session.expires_at)
                    ? 'border-yellow-700 bg-yellow-900/20'
                    : 'border-gray-600 bg-gray-750 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      session.is_current ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {getDeviceIcon(session.user_agent)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-100">
                          {getBrowserName(session.user_agent)} su {getOSName(session.user_agent)}
                        </h4>
                        {session.is_current && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400">
                            Corrente
                          </span>
                        )}
                        {isExpiringSoon(session.expires_at) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900/30 text-yellow-400">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            In scadenza
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{session.ip_address}</span>
                          {session.location && (
                            <span className="ml-2 text-gray-500">• {session.location}</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Ultima attività: {formatDate(session.last_activity)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Scade: {formatDate(session.expires_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!session.is_current && (
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      disabled={terminating === session.id}
                      className="inline-flex items-center p-2 border border-transparent rounded-md text-red-400 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 focus:ring-offset-gray-800 disabled:opacity-50"
                      title="Termina sessione"
                    >
                      {terminating === session.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="px-6 py-4 bg-gray-700 border-t border-gray-600 rounded-b-lg">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-primary-400 mr-2 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1 text-gray-200">Sicurezza delle Sessioni</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• Le sessioni scadono automaticamente dopo 24 ore di inattività</li>
              <li>• Termina le sessioni sospette o non riconosciute</li>
              <li>• La sessione corrente non può essere terminata da qui</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionManager