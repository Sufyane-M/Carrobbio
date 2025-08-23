import React, { useState, useRef, useEffect } from 'react'
import { 
  LayoutDashboard, 
  ChefHat, 
  MessageSquare, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X,
  Utensils,
  Tags,
  Eye,
  Calendar,
  Mail,
  Users,
  Shield,
  Clock,
  Key
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: TabId) => void
  collapsed: boolean
  onToggleCollapse: () => void
  isMobile?: boolean
}

type TabId = 'security' | 'menu' | 'contacts' | 'reservations' | 'sessions' | 'overview' | 'menu-dishes' | 'menu-categories' | 'menu-preview' | 'admin-management' | 'change-password' | 'comunicazioni' | 'amministrazione'

interface MenuItem {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  children?: MenuItem[]
  ariaLabel?: string
}

const menuItems: MenuItem[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard,
    ariaLabel: 'Vai alla dashboard principale'
  },
  {
    id: 'menu',
    label: 'Menu',
    icon: ChefHat,
    ariaLabel: 'Gestione menu del ristorante',
    children: [
      { id: 'menu-dishes', label: 'Piatti', icon: Utensils, ariaLabel: 'Gestisci i piatti del menu' },
      { id: 'menu-categories', label: 'Categorie', icon: Tags, ariaLabel: 'Gestisci le categorie del menu' },
      { id: 'menu-preview', label: 'Anteprima', icon: Eye, ariaLabel: 'Visualizza anteprima del menu' }
    ]
  },
  {
    id: 'comunicazioni',
    label: 'Comunicazioni',
    icon: MessageSquare,
    ariaLabel: 'Gestione comunicazioni e messaggi',
    children: [
      { id: 'reservations', label: 'Prenotazioni', icon: Calendar, ariaLabel: 'Gestisci le prenotazioni' },
      { id: 'contacts', label: 'Contatti', icon: Mail, ariaLabel: 'Visualizza messaggi di contatto' }
    ]
  },
  {
    id: 'amministrazione',
    label: 'Amministrazione',
    icon: Settings,
    ariaLabel: 'Impostazioni e amministrazione sistema',
    children: [
      { id: 'admin-management', label: 'Gestione Admin', icon: Users, ariaLabel: 'Gestisci gli amministratori' },
      { id: 'security', label: 'Sicurezza', icon: Shield, ariaLabel: 'Impostazioni di sicurezza' },
      { id: 'sessions', label: 'Sessioni', icon: Clock, ariaLabel: 'Gestisci le sessioni attive' },
      { id: 'change-password', label: 'Cambia Password', icon: Key, ariaLabel: 'Cambia la password di accesso' }
    ]
  }
]

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  collapsed, 
  onToggleCollapse,
  isMobile = false
}) => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['menu', 'comunicazioni', 'amministrazione'])
  const [focusedItem, setFocusedItem] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, itemId: string, hasChildren?: boolean) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (hasChildren) {
          toggleMenu(itemId)
        } else {
          onTabChange(itemId as TabId)
        }
        break
      case 'Escape':
        if (collapsed) {
          toggleButtonRef.current?.focus()
        }
        break
    }
  }

  // Focus management
  useEffect(() => {
    if (!collapsed && focusedItem) {
      const element = sidebarRef.current?.querySelector(`[data-item-id="${focusedItem}"]`) as HTMLElement
      element?.focus()
    }
  }, [collapsed, focusedItem])

  const isActiveItem = (itemId: string, children?: MenuItem[]) => {
    if (activeTab === itemId) return true
    if (children) {
      return children.some(child => activeTab === child.id)
    }
    return false
  }

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const IconComponent = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedMenus.includes(item.id)
    const isActive = isActiveItem(item.id, item.children)
    const isChildActive = item.children?.some(child => activeTab === child.id)

    return (
      <div key={item.id} className="w-full">
        <button
          data-item-id={item.id}
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id)
            } else {
              onTabChange(item.id)
              // Auto-close sidebar on mobile when selecting an item
              if (isMobile) {
                onToggleCollapse()
              }
            }
          }}
          onKeyDown={(e) => handleKeyDown(e, item.id, hasChildren)}
          onFocus={() => setFocusedItem(item.id)}
          className={`w-full flex items-center justify-between ${
            isMobile ? 'px-4 py-3' : 'px-3 py-2.5'
          } text-sm font-medium rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            isMobile ? 'touch-manipulation' : ''
          } ${
            isActive || isChildActive
              ? 'bg-primary-900/30 text-primary-400 border-l-4 border-primary-500'
              : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
          } ${level > 0 ? 'ml-4' : ''}`}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-label={item.ariaLabel || `${item.label}${hasChildren ? ' (sezione)' : ''}`}
          aria-current={isActive ? 'page' : undefined}
          role={hasChildren ? 'button' : 'menuitem'}
          tabIndex={0}
        >
          <div className="flex items-center space-x-3">
            <IconComponent className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} flex-shrink-0 ${
              isActive || isChildActive 
                ? 'text-primary-400' 
                : 'text-gray-400 group-hover:text-gray-100'
            }`} />
            {!collapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </div>
          {!collapsed && hasChildren && (
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-gray-400`} aria-hidden="true" />
              ) : (
                <ChevronRight className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-gray-400`} aria-hidden="true" />
              )}
            </div>
          )}
        </button>

        {/* Submenu */}
        {!collapsed && hasChildren && isExpanded && (
          <div className={`mt-1 space-y-1 ${isMobile ? 'pl-6' : 'pl-4'}`} role="menu" aria-label={`Sottomenu ${item.label}`}>
            {item.children!.map(child => (
              <button
                key={child.id}
                data-item-id={child.id}
                onClick={() => {
                  onTabChange(child.id)
                  // Auto-close sidebar on mobile when selecting a submenu item
                  if (isMobile) {
                    onToggleCollapse()
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, child.id, false)}
                onFocus={() => setFocusedItem(child.id)}
                className={`w-full flex items-center space-x-3 ${
                  isMobile ? 'px-4 py-3' : 'px-3 py-2'
                } text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  isMobile ? 'touch-manipulation' : ''
                } ${
                  activeTab === child.id
                    ? 'bg-primary-900/20 text-primary-300 font-medium'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
                aria-label={child.ariaLabel || child.label}
                aria-current={activeTab === child.id ? 'page' : undefined}
                role="menuitem"
                tabIndex={0}
              >
                <child.icon className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} flex-shrink-0 ${
                  activeTab === child.id 
                    ? 'text-primary-400' 
                    : 'text-gray-500'
                }`} />
                <span className="truncate">{child.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggleCollapse}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out ${
          isMobile 
            ? (collapsed ? '-translate-x-full w-64' : 'translate-x-0 w-64')
            : (collapsed ? 'w-16 translate-x-0' : 'w-64 translate-x-0')
        }`}
        aria-label="Menu di navigazione principale"
        role="navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-100">
              Il Carrobbio
            </h2>
          )}
          <button
            ref={toggleButtonRef}
            onClick={onToggleCollapse}
            className={`
              ${isMobile ? 'p-3' : 'p-2'} 
              hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded-md transition-colors
              ${isMobile ? 'touch-manipulation' : ''}
            `}
            aria-label={collapsed ? 'Espandi menu' : 'Comprimi menu'}
          >
            {collapsed ? (
              <Menu className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
            ) : (
              <X className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto" role="menubar">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 text-center">
              Admin Dashboard v1.0
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar