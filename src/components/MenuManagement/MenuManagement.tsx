import React, { useState, useEffect } from 'react'
import { AdminCard, AdminCardContent, AdminCardHeader } from '../AdminCard'
import { AdminButton } from '../AdminButton'
import CategorieManager from './CategorieManager'
import PiattiManager from './PiattiManager'
import { DragDropPiattiList, DragDropCategorieList } from './DragDropWrapper'
import { useMenuManagement } from '../../hooks/useMenuManagement'
import { MenuItem } from '../../lib/supabase'
import { 
  ChefHat, 
  Tag, 
  Eye, 
  Settings, 
  BarChart3, 
  Search,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { useToast } from '../Toast'

type TabType = 'dashboard' | 'piatti' | 'categorie' | 'anteprima' | 'impostazioni'

interface MenuStats {
  totalMenuItems: number
  availableMenuItems: number
  totalCategories: number
}

interface MenuManagementProps {
  activeSubTab?: string
  isMobile?: boolean
}

const MenuManagement: React.FC<MenuManagementProps> = ({ activeSubTab = 'dashboard', isMobile = false }) => {
  // Map external sub-tab names to internal tab names
  const getInternalTab = (subTab: string): TabType => {
    const tabMap: Record<string, TabType> = {
      'dishes': 'piatti',
      'categories': 'categorie',
      'preview': 'anteprima',
      'settings': 'impostazioni'
    }
    return tabMap[subTab] || 'dashboard'
  }

  const [activeTab, setActiveTab] = useState<TabType>(getInternalTab(activeSubTab))
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { showToast } = useToast()
  
  const {
    menuItems,
    categories,
    loading,
    error,
    fetchMenuItems,
    fetchCategories,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    uploadImage,
    deleteImage
  } = useMenuManagement()

  // Update internal tab when activeSubTab prop changes
  useEffect(() => {
    setActiveTab(getInternalTab(activeSubTab))
  }, [activeSubTab])

  // Carica i dati iniziali
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchMenuItems(), fetchCategories()])
      } catch (error) {
        showToast('error', 'Errore nel caricamento', 'Impossibile caricare i dati del menu')
      }
    }
    loadData()
  }, [])

  // Calcola le statistiche
  const stats: MenuStats = {
    totalMenuItems: menuItems.length,
    availableMenuItems: menuItems.filter(item => item.available).length,
    totalCategories: categories.length
  }

  // Filtri per menu items
  const menuItemsFiltered = menuItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = !filtroCategoria || item.category === filtroCategoria
    const matchAvailable = !showOnlyAvailable || item.available
    return matchSearch && matchCategoria && matchAvailable
  })

  // Converti le categorie da stringhe a oggetti Categoria e filtra in base alla ricerca
  const categoriesFiltered = categories
    .filter(category => category.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(categoryName => ({
      id: categoryName,
      nome: categoryName,
      descrizione: '',
      ordine: 0,
      attiva: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([fetchMenuItems(), fetchCategories()])
      showToast('success', 'Dati aggiornati', 'I dati del menu sono stati aggiornati con successo')
    } catch (error) {
      showToast('error', 'Errore aggiornamento', 'Impossibile aggiornare i dati del menu')
    } finally {
      setIsRefreshing(false)
    }
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
    { id: 'piatti' as TabType, label: 'Piatti', icon: ChefHat },
    { id: 'categorie' as TabType, label: 'Categorie', icon: Tag },
    { id: 'anteprima' as TabType, label: 'Anteprima Menu', icon: Eye },
    { id: 'impostazioni' as TabType, label: 'Impostazioni', icon: Settings }
  ]

  const renderDashboard = () => (
    <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      {/* Statistiche */}
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
        <AdminCard className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
          <AdminCardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Piatti Totali</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-100`}>{stats.totalMenuItems}</p>
              </div>
              <ChefHat className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-primary-400`} />
            </div>
          </AdminCardContent>
        </AdminCard>
        
        <AdminCard className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
          <AdminCardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Piatti Disponibili</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-100`}>{stats.availableMenuItems}</p>
              </div>
              <Eye className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-green-400`} />
            </div>
          </AdminCardContent>
        </AdminCard>
        
        <AdminCard className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
          <AdminCardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Categorie Totali</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-100`}>{stats.totalCategories}</p>
              </div>
              <Tag className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-secondary-400`} />
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>

      {/* Azioni rapide */}
      <AdminCard className="hover:shadow-md transition-shadow">
        <AdminCardHeader className={`${isMobile ? 'p-4 pb-2' : 'p-6 pb-4'}`}>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-100`}>Azioni Rapide</h3>
        </AdminCardHeader>
        <AdminCardContent className={`${isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
            <AdminButton
              onClick={() => setActiveTab('piatti')}
              variant="success"
              className={`${isMobile ? 'h-10 text-sm touch-manipulation' : 'h-12'}`}
            >
              <ChefHat className={`${isMobile ? 'w-4 h-4 mr-1' : 'w-5 h-5 mr-2'}`} />
              Gestisci Piatti
            </AdminButton>
            <AdminButton
              onClick={() => setActiveTab('categorie')}
              variant="primary"
              className={`${isMobile ? 'h-10 text-sm touch-manipulation' : 'h-12'}`}
            >
              <Tag className={`${isMobile ? 'w-4 h-4 mr-1' : 'w-5 h-5 mr-2'}`} />
              Gestisci Categorie
            </AdminButton>
            <AdminButton
              onClick={() => setActiveTab('anteprima')}
              variant="secondary"
              className={`${isMobile ? 'h-10 text-sm touch-manipulation' : 'h-12'}`}
            >
              <Eye className={`${isMobile ? 'w-4 h-4 mr-1' : 'w-5 h-5 mr-2'}`} />
              Anteprima Menu
            </AdminButton>
            <AdminButton
              onClick={handleRefresh}
              variant="outline"
              className={`${isMobile ? 'h-10 text-sm touch-manipulation' : 'h-12'}`}
              disabled={loading}
            >
              <RefreshCw className={`${isMobile ? 'w-4 h-4 mr-1' : 'w-5 h-5 mr-2'} ${loading ? 'animate-spin' : ''}`} />
              Aggiorna Dati
            </AdminButton>
          </div>
        </AdminCardContent>
      </AdminCard>

      {/* Panoramica recente */}
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-6'}`}>
        <AdminCard className="hover:shadow-md transition-shadow">
          <AdminCardHeader className={`${isMobile ? 'p-4 pb-2' : 'p-6 pb-4'}`}>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-100`}>Piatti Recenti</h3>
          </AdminCardHeader>
          <AdminCardContent className={`${isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
            <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
              {menuItems.slice(0, 5).map(item => (
                <div key={item.id} className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-3'} bg-gray-700 rounded-lg`}>
                  <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} object-cover rounded-lg`}
                      />
                    )}
                    <div>
                      <p className={`font-medium text-gray-100 ${isMobile ? 'text-sm' : ''}`}>{item.name}</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300`}>€{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center ${isMobile ? 'px-1.5 py-0.5' : 'px-2 py-1'} rounded-full ${isMobile ? 'text-xs' : 'text-xs'} font-medium ${
                    item.available 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {item.available ? 'Disponibile' : 'Non disponibile'}
                  </span>
                </div>
              ))}
              {menuItems.length === 0 && (
                <p className={`text-gray-400 text-center ${isMobile ? 'py-3 text-sm' : 'py-4'}`}>Nessun piatto trovato</p>
              )}
            </div>
          </AdminCardContent>
        </AdminCard>
        
        <AdminCard className="hover:shadow-md transition-shadow">
          <AdminCardHeader className={`${isMobile ? 'p-4 pb-2' : 'p-6 pb-4'}`}>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-100`}>Categorie</h3>
          </AdminCardHeader>
          <AdminCardContent className={`${isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
            <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
              {categories.slice(0, 5).map(category => (
                <div key={category} className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-3'} bg-gray-700 rounded-lg`}>
                  <div>
                    <p className={`font-medium text-gray-100 ${isMobile ? 'text-sm' : ''}`}>{category}</p>
                  </div>
                  <span className={`inline-flex items-center ${isMobile ? 'px-1.5 py-0.5' : 'px-2 py-1'} rounded-full ${isMobile ? 'text-xs' : 'text-xs'} font-medium bg-green-900/30 text-green-400`}>
                    Attiva
                  </span>
                </div>
              ))}
              {categories.length === 0 && (
                <p className={`text-gray-400 text-center ${isMobile ? 'py-3 text-sm' : 'py-4'}`}>Nessuna categoria trovata</p>
              )}
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>
    </div>
  )

  const renderAnteprimaMenu = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Anteprima Menu</h2>
          <p className="text-gray-300 mt-1">Visualizza come apparirà il menu ai clienti</p>
        </div>
        <AdminButton
          onClick={handleRefresh}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna
        </AdminButton>
      </div>

      {/* Menu per categorie */}
      <div className="space-y-8">
        {categories.map(category => {
            const menuItemsCategory = menuItems.filter(item => 
              item.available && item.category === category
            )

            if (menuItemsCategory.length === 0) return null

            return (
              <AdminCard key={category}>
                <AdminCardHeader className="bg-gray-800">
                  <h3 className="text-xl font-bold text-gray-100">{category}</h3>
                </AdminCardHeader>
                <AdminCardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItemsCategory.map(item => (
                      <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-700 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-lg text-gray-100">{item.name}</h4>
                            <span className="font-bold text-green-600 text-lg">€{item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                          {item.allergens && item.allergens.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.allergens.map(allergen => (
                                <span key={allergen} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-900/30 text-orange-400">
                                  {allergen}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AdminCardContent>
              </AdminCard>
            )
          })
        }
        
        {categories.length === 0 && (
          <AdminCard>
            <AdminCardContent className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-600 mb-4" />
              <p className="text-gray-300 text-lg">Nessuna categoria trovata</p>
              <p className="text-gray-400 text-sm mt-1">Aggiungi categorie per visualizzare il menu</p>
            </AdminCardContent>
          </AdminCard>
        )}
      </div>
    </div>
  )

  const renderImpostazioni = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">Impostazioni Menu</h2>
        <p className="text-gray-300 mt-1">Configura le impostazioni generali del menu</p>
      </div>

      <AdminCard>
        <AdminCardHeader>
          <h3 className="text-lg font-semibold text-gray-100">Configurazione Generale</h3>
        </AdminCardHeader>
        <AdminCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Valuta predefinita
              </label>
              <select className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400">
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollaro ($)</option>
                <option value="GBP">Sterlina (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Formato prezzo
              </label>
              <select className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400">
                <option value="2">2 decimali (€10.00)</option>
                <option value="0">Nessun decimale (€10)</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show-allergeni"
              className="h-4 w-4 text-primary-400 focus:ring-primary-400 bg-gray-700 border-gray-600 rounded"
              defaultChecked
            />
            <label htmlFor="show-allergeni" className="text-sm text-gray-300">
              Mostra allergeni nel menu pubblico
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show-images"
              className="h-4 w-4 text-primary-400 focus:ring-primary-400 bg-gray-700 border-gray-600 rounded"
              defaultChecked
            />
            <label htmlFor="show-images" className="text-sm text-gray-300">
              Mostra immagini nel menu pubblico
            </label>
          </div>
        </AdminCardContent>
      </AdminCard>

      <AdminCard>
        <AdminCardHeader>
          <h3 className="text-lg font-semibold text-gray-100">Statistiche e Backup</h3>
        </AdminCardHeader>
        <AdminCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminButton variant="outline" className="h-12">
              <BarChart3 className="w-5 h-5 mr-2" />
              Esporta Statistiche
            </AdminButton>
            <AdminButton variant="outline" className="h-12">
              <RefreshCw className="w-5 h-5 mr-2" />
              Backup Menu
            </AdminButton>
            <AdminButton variant="outline" className="h-12">
              <Settings className="w-5 h-5 mr-2" />
              Ripristina Menu
            </AdminButton>
          </div>
        </AdminCardContent>
      </AdminCard>
    </div>
  )

  if (error) {
    return (
      <div className="border border-red-600 bg-red-900/20 rounded-lg">
        <div className="text-center py-8 p-6">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-400 text-lg font-semibold">Errore nel caricamento</p>
          <p className="text-red-300 text-sm mt-1">{error}</p>
          <AdminButton
            onClick={handleRefresh}
            loading={isRefreshing}
            variant="danger"
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Riprova
          </AdminButton>
        </div>
      </div>
    )
  }

  // Get page title based on active tab
  const getPageTitle = () => {
    const titles: Record<TabType, string> = {
      'dashboard': 'Dashboard Menu',
      'piatti': 'Gestione Piatti',
      'categorie': 'Gestione Categorie', 
      'anteprima': 'Anteprima Menu',
      'impostazioni': 'Impostazioni Menu'
    }
    return titles[activeTab] || 'Gestione Menu'
  }

  const getPageDescription = () => {
    const descriptions: Record<TabType, string> = {
      'dashboard': 'Panoramica generale del menu e statistiche',
      'piatti': 'Aggiungi, modifica e gestisci i piatti del menu',
      'categorie': 'Organizza i piatti in categorie',
      'anteprima': 'Visualizza come apparirà il menu ai clienti',
      'impostazioni': 'Configura le impostazioni generali del menu'
    }
    return descriptions[activeTab] || 'Gestisci il menu del ristorante'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{getPageTitle()}</h1>
          <p className="text-gray-300 mt-1">{getPageDescription()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <AdminButton
            onClick={handleRefresh}
            variant="outline"
            loading={isRefreshing}
            aria-label="Aggiorna dati menu"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Aggiorna
          </AdminButton>
        </div>
      </div>

      {/* Filtri globali per piatti e categorie */}
      {(activeTab === 'piatti' || activeTab === 'categorie') && (
        <AdminCard>
          <AdminCardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <Search className="w-4 h-4 inline mr-1" />
                  Cerca
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  placeholder={activeTab === 'piatti' ? 'Cerca piatti...' : 'Cerca categorie...'}
                />
              </div>
              {activeTab === 'piatti' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <Filter className="w-4 h-4 inline mr-1" />
                    Filtra per categoria
                  </label>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  >
                    <option value="">Tutte le categorie</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="show-only-available"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="h-4 w-4 text-primary-400 focus:ring-primary-400 bg-gray-700 border-gray-600 rounded"
                />
                <label htmlFor="show-only-available" className="ml-2 block text-sm text-gray-300">
                  Solo {activeTab === 'piatti' ? 'disponibili' : 'attive'}
                </label>
              </div>
            </div>
          </AdminCardContent>
        </AdminCard>
      )}

      {/* Contenuto delle tab */}
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && renderDashboard()}
        
        {activeTab === 'piatti' && (
          <PiattiManager
            piatti={menuItemsFiltered}
            loading={loading}
            onCreatePiatto={createMenuItem}
            onUpdatePiatto={updateMenuItem}
            onDeletePiatto={deleteMenuItem}
            onToggleDisponibilita={toggleAvailability}
            onUploadImmagine={uploadImage}
            onEliminaImmagine={deleteImage}
          />
        )}
        
        {activeTab === 'categorie' && (
          <CategorieManager
            categorie={categoriesFiltered}
            loading={loading}
            onCreateCategoria={async (categoria) => ({ id: '', nome: '', descrizione: '', ordine: 0, attiva: true, created_at: '', updated_at: '', ...categoria })}
            onUpdateCategoria={async (id, updates) => ({ id, nome: '', descrizione: '', ordine: 0, attiva: true, created_at: '', updated_at: '', ...updates })}
            onDeleteCategoria={async () => {}}
            onToggleAttiva={async () => {}}
            onReorderCategorie={async () => {}}
          />
        )}
        
        {activeTab === 'anteprima' && renderAnteprimaMenu()}
        
        {activeTab === 'impostazioni' && renderImpostazioni()}
      </div>
    </div>
  )
}

export default MenuManagement