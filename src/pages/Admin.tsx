import React, { useState, useEffect, useMemo } from 'react'
import { useReservations, useContacts, useMenu } from '../hooks'
import { useAuthContext } from '../hooks/useAuth'
import { Button } from '../components/Button'
import { Card, CardHeader, CardContent } from '../components/Card'
import { useToast } from '../components/Toast'
import { AdminManagement } from '../components/AdminManagement'
import { SessionManager, SecurityDashboard, ChangePasswordForm } from '../components'
import MenuManagement from '../components/MenuManagement/MenuManagement'
import Sidebar from '../components/Sidebar'
import { Breadcrumb } from '../components/Breadcrumb'
import { EyeIcon, TrashIcon, CalendarIcon, UsersIcon, MessageCircleIcon, MenuIcon, CheckIcon, MailIcon, BarChart3Icon, Users2Icon, UserPlusIcon } from 'lucide-react'
import type { Reservation, Contact, MenuItem } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SEO, pageSEO } from '../components/SEO'

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuthContext()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    try {
      await login(email, password)
      showToast('success', 'Accesso effettuato', 'Benvenuto nel pannello amministrativo!')
    } catch (err: any) {
      console.error('❌ [LoginForm] Errore durante login:', err)
      showToast('error', 'Errore di accesso', 'Credenziali non valide. Riprova.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 shadow-2xl rounded-2xl">
        <div className="p-6 pb-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-t-2xl">
          <h2 className="font-display text-2xl font-bold text-center text-gray-100">
            Accesso{' '}
            <span className="text-primary-400 font-accent text-3xl">Admin</span>
          </h2>
          <div className="w-16 h-1 bg-primary-500 rounded-full mx-auto mt-2 mb-4"></div>
          <p className="text-center font-body text-gray-300">
            Inserisci le tue credenziali per accedere al pannello amministrativo
          </p>
        </div>
        <div className="p-6 pt-0">
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-xl">
              <p className="text-red-400 font-body text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block font-heading text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 font-body"
                placeholder="admin@carrobbio.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block font-heading text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 font-body"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-heading font-semibold rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                  Accesso in corso...
                </div>
              ) : (
                'Accedi'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthContext()
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'contacts' | 'menu' | 'menu-dishes' | 'menu-categories' | 'menu-preview' | 'admin-management' | 'security' | 'sessions' | 'change-password' | 'comunicazioni' | 'amministrazione'>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Use custom hooks for data management
  const { 
    reservations, 
    loading: reservationsLoading, 
    error: reservationsError,
    updateReservationStatus: updateStatus,
    fetchReservations
  } = useReservations()
  
  const { 
    contacts, 
    loading: contactsLoading, 
    error: contactsError,
    deleteContact: removeContact,
    fetchContacts
  } = useContacts()
  
  const { 
    menuItems, 
    loading: menuLoading, 
    error: menuError
  } = useMenu()

  // Derived stats for Overview
  const stats = useMemo(() => {
    return {
      totalReservations: reservations.length,
      pendingReservations: reservations.filter(r => r.status === 'pending').length,
      confirmedReservations: reservations.filter(r => r.status === 'confirmed').length,
      totalContacts: contacts.length,
    }
  }, [reservations, contacts])

  // Chart data for last 7 days
  const chartData = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Build last 7 days list (oldest -> newest)
    const days: Date[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      days.push(d)
    }

    const dayKey = (d: Date) => {
      const copy = new Date(d)
      copy.setHours(0, 0, 0, 0)
      return copy.toISOString().slice(0, 10) // YYYY-MM-DD
    }

    const counts = new Map<string, number>()
    days.forEach(d => counts.set(dayKey(d), 0))

    reservations.forEach(r => {
      if (!r.reservation_date) return
      const d = new Date(r.reservation_date)
      d.setHours(0, 0, 0, 0)
      const key = dayKey(d)
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    })

    return days.map(d => {
      const key = dayKey(d)
      const label = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
      return { date: label, prenotazioni: counts.get(key) || 0 }
    })
  }, [reservations])

  // Keep the function used in JSX
  const getChartData = () => chartData

  // Get breadcrumb items based on active tab
  const getBreadcrumbItems = () => {
    const breadcrumbMap: Record<string, { label: string; parent?: string }> = {
      'overview': { label: 'Dashboard' },
      'menu': { label: 'Menu' },
      'menu-dishes': { label: 'Piatti', parent: 'Menu' },
      'menu-categories': { label: 'Categorie', parent: 'Menu' },
      'menu-preview': { label: 'Anteprima', parent: 'Menu' },
      'reservations': { label: 'Prenotazioni', parent: 'Comunicazioni' },
      'contacts': { label: 'Contatti', parent: 'Comunicazioni' },
      'admin-management': { label: 'Gestione Admin', parent: 'Amministrazione' },
      'security': { label: 'Sicurezza', parent: 'Amministrazione' },
      'sessions': { label: 'Sessioni', parent: 'Amministrazione' },
      'change-password': { label: 'Cambia Password', parent: 'Amministrazione' }
    }

    const current = breadcrumbMap[activeTab]
    if (!current) return [{ label: 'Dashboard', isActive: true }]

    const items = []
    if (current.parent) {
      items.push({ label: current.parent })
    }
    items.push({ label: current.label, isActive: true })
    return items
  }

  // Handlers used in JSX
  const handleUpdateReservationStatus = async (
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled'
  ) => {
    try {
      // Update reservation status
      await updateStatus(id, status)
      // Refresh data to ensure UI up-to-date
      await fetchReservations()
    } catch (e) {
      console.error('Errore aggiornando lo stato della prenotazione:', e)
    }
  }

  const handleDeleteContact = async (id: string) => {
    try {
      // Delete contact
      await removeContact(id)
      // Refresh data after deletion
      await fetchContacts()
    } catch (e) {
      console.error('Errore eliminando il contatto:', e)
    }
  }

  const loading = reservationsLoading || contactsLoading || menuLoading
  const error = reservationsError || contactsError || menuError



  // Ensure admin-only data is fetched on mount so loading states are resolved
  useEffect(() => {
    fetchReservations().catch((e) => console.error('Error fetching reservations:', e))
    fetchContacts().catch((e) => console.error('Error fetching contacts:', e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <SEO {...pageSEO.admin} />
      
      {/* Sidebar */}
      <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
        />

      {/* Main Content */}
      <div 
        className={`
          min-h-screen transition-all duration-300
          ${isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-64')}
        `}
        role="main"
        aria-label="Contenuto principale dell'amministrazione"
      >
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700" role="banner">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                {/* Mobile Hamburger Menu */}
                {isMobile && (
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 text-gray-400 hover:bg-gray-700 hover:text-gray-300 rounded-md transition-colors"
                    aria-label={sidebarCollapsed ? "Apri menu" : "Chiudi menu"}
                  >
                    <MenuIcon className="h-6 w-6" />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-100 mb-2">
                    Pannello Amministrativo
                  </h1>
                  <Breadcrumb items={getBreadcrumbItems()} isMobile={isMobile} />
                </div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-red-400 border border-red-600 hover:bg-red-900/20 hover:text-red-300 rounded-md transition-colors focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="Logout dall'amministrazione"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-6 bg-gray-900">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Message */}
            <section className="mb-6" aria-labelledby="welcome-heading">
              <h2 id="welcome-heading" className="sr-only">Messaggio di benvenuto</h2>
              <p className="text-gray-400">
                Benvenuto, {user?.email}
              </p>
            </section>
            
            {/* Stats Cards */}
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">Statistiche del dashboard</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-gray-800 border border-gray-700 hover:bg-gray-750 hover:shadow-lg transition-all duration-200 rounded-lg">
                  <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-400`}>
                          Prenotazioni Totali
                        </p>
                        <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-100`} aria-label={`${stats.totalReservations} prenotazioni totali`}>
                          {stats.totalReservations}
                        </p>
                      </div>
                      <CalendarIcon className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-primary-400`} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              
                <div className="bg-gray-800 border border-gray-700 hover:bg-gray-750 hover:shadow-lg transition-all duration-200 rounded-lg">
                  <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-400`}>
                          In Attesa
                        </p>
                        <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-yellow-400`} aria-label={`${stats.pendingReservations} prenotazioni in attesa`}>
                          {stats.pendingReservations}
                        </p>
                      </div>
                      <CalendarIcon className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-yellow-400`} aria-hidden="true" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 hover:bg-gray-750 hover:shadow-lg transition-all duration-200 rounded-lg">
                  <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-400`}>
                          Confermate
                        </p>
                        <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-400`} aria-label={`${stats.confirmedReservations} prenotazioni confermate`}>
                          {stats.confirmedReservations}
                        </p>
                      </div>
                      <CheckIcon className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-green-400`} aria-hidden="true" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 hover:bg-gray-750 hover:shadow-lg transition-all duration-200 rounded-lg">
                  <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-400`}>
                          Messaggi
                        </p>
                        <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-100`} aria-label={`${stats.totalContacts} messaggi ricevuti`}>
                          {stats.totalContacts}
                        </p>
                      </div>
                      <MailIcon className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-secondary-400`} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Chart */}
             <section aria-labelledby="chart-heading">
               <div className="bg-gray-800 border border-gray-700 hover:bg-gray-750 hover:shadow-lg transition-all duration-200 rounded-lg">
                 <div className={`${isMobile ? 'p-4 pb-2' : 'p-6 pb-4'}`}>
                   <h3 id="chart-heading" className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-100`}>
                     Prenotazioni degli Ultimi 7 Giorni
                   </h3>
                 </div>
                 <div className={`${isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
                   <div className={`${isMobile ? 'h-64' : 'h-80'}`} role="img" aria-labelledby="chart-heading" aria-describedby="chart-description">
                     <p id="chart-description" className="sr-only">
                       Grafico a barre che mostra il numero di prenotazioni per ciascuno degli ultimi 7 giorni
                     </p>
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={getChartData()} margin={{ top: 20, right: isMobile ? 10 : 30, left: isMobile ? 10 : 20, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="opacity-30" />
                         <XAxis 
                           dataKey="date" 
                           className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}
                           tick={{ fontSize: isMobile ? 10 : 12, fill: '#9ca3af' }}
                         />
                         <YAxis 
                           className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}
                           tick={{ fontSize: isMobile ? 10 : 12, fill: '#9ca3af' }}
                         />
                         <Tooltip 
                           contentStyle={{
                             backgroundColor: '#1f2937',
                             border: '1px solid #374151',
                             borderRadius: '8px',
                             color: '#f3f4f6',
                             fontSize: isMobile ? '12px' : '14px'
                           }}
                         />
                         <Bar 
                           dataKey="prenotazioni" 
                           fill="#f59e0b" 
                           radius={[4, 4, 0, 0]}
                         />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
               </div>
             </section>
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 pb-4">
              <h3 className="text-lg font-semibold text-gray-100">
                Gestione Prenotazioni
              </h3>
            </div>
            <div className="p-6 pt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Data & Ora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Persone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Stato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {reservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-100">
                              {reservation.customer_name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {reservation.customer_email}
                            </div>
                            <div className="text-sm text-gray-400">
                              {reservation.customer_phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(reservation.reservation_date)} - {reservation.reservation_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {reservation.party_size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            reservation.status === 'confirmed'
                              ? 'bg-green-900/30 text-green-400'
                              : reservation.status === 'cancelled'
                              ? 'bg-red-900/30 text-red-400'
                              : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {reservation.status === 'confirmed' ? 'Confermata' : 
                             reservation.status === 'cancelled' ? 'Annullata' : 'In Attesa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                onClick={() => handleUpdateReservationStatus(reservation.id, 'confirmed')}
                              >
                                Conferma
                              </button>
                              <button
                                className="px-3 py-1 text-sm border border-red-600 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded transition-colors"
                                onClick={() => handleUpdateReservationStatus(reservation.id, 'cancelled')}
                              >
                                Annulla
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 pb-4">
              <h3 className="text-lg font-semibold text-gray-100">
                Messaggi Ricevuti
              </h3>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border border-gray-600 bg-gray-750 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-100">
                          {contact.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {contact.email} {contact.phone && `• ${contact.phone}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(contact.created_at)}
                        </span>
                        <button
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      {contact.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu Tab and Sub-tabs */}
         {(activeTab === 'menu' || activeTab === 'menu-dishes' || activeTab === 'menu-categories' || activeTab === 'menu-preview') && (
           <MenuManagement activeSubTab={activeTab === 'menu' ? 'dishes' : activeTab.replace('menu-', '')} isMobile={isMobile} />
         )}

        {/* Admin Management Tab */}
        {activeTab === 'admin-management' && user && (
          <AdminManagement currentUser={user} isMobile={isMobile} />
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <SecurityDashboard />
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <SessionManager />
        )}

        {/* Change Password Tab */}
         {activeTab === 'change-password' && (
           <ChangePasswordForm />
         )}
         </div>
       </div>
     </div>
   )
}

const AdminPage: React.FC = () => {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Caricamento...</p>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <LoginForm />
}

export const Admin: React.FC = () => {
  return (
    <AdminPage />
  )
}