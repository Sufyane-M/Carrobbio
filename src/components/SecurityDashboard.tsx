import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Eye, Clock, MapPin, TrendingUp, TrendingDown, RefreshCw, Calendar } from 'lucide-react'
import { useAuthContext } from '../hooks/useAuth'
import { toast } from 'sonner'
import { SecurityStats, LoginAttempt } from '../../shared/types'

interface SecurityDashboardProps {
  className?: string
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [loginHistory, setLoginHistory] = useState<LoginAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [showOnlyFailed, setShowOnlyFailed] = useState(false)

  const { getSecurityStats, getLoginHistory } = useAuthContext()

  // Load security data
  const loadSecurityData = async () => {
    try {
      setRefreshing(true)
      const [securityStats, history] = await Promise.all([
        getSecurityStats(),
        getLoginHistory()
      ])
      setStats(securityStats)
      setLoginHistory(history)
    } catch (error) {
      console.error('Error loading security data:', error)
      toast.error('Errore nel caricamento dei dati di sicurezza')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load data on component mount and when time range changes
  useEffect(() => {
    loadSecurityData()
  }, [timeRange])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get browser name from user agent
  const getBrowserName = (userAgent: string) => {
    const ua = userAgent.toLowerCase()
    if (ua.includes('chrome')) return 'Chrome'
    if (ua.includes('firefox')) return 'Firefox'
    if (ua.includes('safari')) return 'Safari'
    if (ua.includes('edge')) return 'Edge'
    if (ua.includes('opera')) return 'Opera'
    return 'Sconosciuto'
  }

  // Filter login history based on success/failure
  const filteredHistory = showOnlyFailed 
    ? loginHistory.filter(attempt => !attempt.success)
    : loginHistory

  // Get security level based on stats
  const getSecurityLevel = () => {
    if (!stats) return { level: 'unknown', color: 'gray', text: 'Sconosciuto' }
    
    const failureRate = stats.total_login_attempts > 0 
      ? (stats.failed_logins / stats.total_login_attempts) * 100 
      : 0
    
    if (failureRate < 10 && stats.suspicious_activities < 5) {
      return { level: 'high', color: 'green', text: 'Alto' }
    } else if (failureRate < 25 && stats.suspicious_activities < 15) {
      return { level: 'medium', color: 'yellow', text: 'Medio' }
    } else {
      return { level: 'low', color: 'red', text: 'Basso' }
    }
  }

  const securityLevel = getSecurityLevel()

  if (loading) {
    return (
      <div className={`bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-700 rounded"></div>
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
                Dashboard Sicurezza
              </h3>
              <p className="text-sm text-gray-400">
                Monitoraggio attività e statistiche di sicurezza
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Security Level Badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              securityLevel.color === 'green' ? 'bg-green-900/30 text-green-400' :
              securityLevel.color === 'yellow' ? 'bg-yellow-900/30 text-yellow-400' :
              securityLevel.color === 'red' ? 'bg-red-900/30 text-red-400' :
              'bg-gray-700 text-gray-300'
            }`}>
              <Shield className="w-4 h-4 mr-1" />
              Sicurezza: {securityLevel.text}
            </div>
            <button
              onClick={loadSecurityData}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Aggiorna
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-primary-900/20 border border-primary-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary-900/30 rounded-lg">
                  <Eye className="w-5 h-5 text-primary-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-primary-300">Tentativi Totali</p>
                  <p className="text-2xl font-bold text-primary-400">{stats.total_login_attempts}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-300">Login Riusciti</p>
                  <p className="text-2xl font-bold text-green-400">{stats.successful_logins}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-300">Login Falliti</p>
                  <p className="text-2xl font-bold text-red-400">{stats.failed_logins}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-300">Attività Sospette</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.suspicious_activities}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Tasso di Successo</p>
                  <p className="text-xl font-bold text-gray-100">{stats.success_rate.toFixed(1)}%</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  stats.success_rate >= 80 ? 'bg-green-900/30' : stats.success_rate >= 60 ? 'bg-yellow-900/30' : 'bg-red-900/30'
                }`}>
                  <TrendingUp className={`w-6 h-6 ${
                    stats.success_rate >= 80 ? 'text-green-400' : stats.success_rate >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`} />
                </div>
              </div>
            </div>

            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Sessioni Attive</p>
                  <p className="text-xl font-bold text-gray-100">{stats.active_sessions}</p>
                </div>
                <div className="w-12 h-12 bg-primary-900/30 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">IP Bloccati</p>
                  <p className="text-xl font-bold text-gray-100">{stats.blocked_ips}</p>
                </div>
                <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login History */}
        <div className="border border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-100">Cronologia Login</h4>
              <div className="flex items-center space-x-3">
                {/* Time Range Selector */}
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
                  className="text-sm border border-gray-600 bg-gray-700 text-gray-200 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                >
                  <option value="24h">Ultime 24 ore</option>
                  <option value="7d">Ultimi 7 giorni</option>
                  <option value="30d">Ultimi 30 giorni</option>
                </select>
                
                {/* Filter Toggle */}
                <label className="flex items-center text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={showOnlyFailed}
                    onChange={(e) => setShowOnlyFailed(e.target.checked)}
                    className="mr-2 h-4 w-4 text-red-400 focus:ring-red-400 bg-gray-700 border-gray-600 rounded"
                  />
                  Solo falliti
                </label>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  {showOnlyFailed ? 'Nessun tentativo fallito' : 'Nessun tentativo di login'} nel periodo selezionato
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredHistory.map((attempt) => (
                  <div key={attempt.id} className="p-4 hover:bg-gray-750">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          attempt.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                          {attempt.success ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-gray-100">
                              {attempt.email}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              attempt.success 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-red-900/30 text-red-400'
                            }`}>
                              {attempt.success ? 'Successo' : 'Fallito'}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-400">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{attempt.ip_address}</span>
                              {attempt.location && (
                                <span className="ml-2 text-gray-500">• {attempt.location}</span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              <span>{getBrowserName(attempt.user_agent)}</span>
                            </div>
                            {!attempt.success && attempt.failure_reason && (
                              <div className="flex items-center text-red-400">
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                <span>{attempt.failure_reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{formatDate(attempt.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityDashboard