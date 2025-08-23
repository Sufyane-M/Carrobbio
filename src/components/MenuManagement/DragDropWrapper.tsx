import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  Active,
  Over
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import {
  CSS
} from '@dnd-kit/utilities'
import { Card, CardContent } from '../Card'
import { GripVertical, Tag, Euro, Eye, EyeOff } from 'lucide-react'
import { MenuItem } from '../../lib/supabase'

// Legacy types for compatibility
interface Categoria {
  id: string
  name: string
  description?: string
  sort_order: number
  attiva: boolean
  created_at: string
}

interface PiattoConCategorie {
  id: string
  name: string
  description: string
  price: number
  allergens?: string[]
  available: boolean
  sort_order: number
  image_url?: string
  created_at: string
  category: string
  categorie?: Categoria[]
}
import { toast } from 'sonner'

interface DragDropWrapperProps {
  children: React.ReactNode
}

interface SortableItemProps {
  id: string
  children: React.ReactNode
  disabled?: boolean
}

interface SortablePiattoProps {
  piatto: PiattoConCategorie
  onEdit: (piatto: PiattoConCategorie) => void
  onDelete: (piatto: PiattoConCategorie) => void
  onToggleDisponibilita: (piatto: PiattoConCategorie) => void
}

interface SortableCategoriaProps {
  categoria: Categoria
  onEdit: (categoria: Categoria) => void
  onDelete: (categoria: Categoria) => void
  onToggleAttiva: (categoria: Categoria) => void
}

interface DragDropPiattiListProps {
  piatti: PiattoConCategorie[]
  onReorder: (oldIndex: number, newIndex: number) => Promise<void>
  onEdit: (piatto: PiattoConCategorie) => void
  onDelete: (piatto: PiattoConCategorie) => void
  onToggleDisponibilita: (piatto: PiattoConCategorie) => void
  loading?: boolean
}

interface DragDropCategorieListProps {
  categorie: Categoria[]
  onReorder: (oldIndex: number, newIndex: number) => Promise<void>
  onEdit: (categoria: Categoria) => void
  onDelete: (categoria: Categoria) => void
  onToggleAttiva: (categoria: Categoria) => void
  loading?: boolean
}

// Componente base per elementi sortable
const SortableItem: React.FC<SortableItemProps> = ({ id, children, disabled = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="relative">
        {!disabled && (
          <div
            {...listeners}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 cursor-move text-gray-400 hover:text-gray-200 z-10"
          >
            <GripVertical className="w-5 h-5" />
          </div>
        )}
        <div className={!disabled ? 'ml-8' : ''}>
          {children}
        </div>
      </div>
    </div>
  )
}

// Componente per piatto sortable
const SortablePiatto: React.FC<SortablePiattoProps> = ({
  piatto,
  onEdit,
  onDelete,
  onToggleDisponibilita
}) => {
  return (
    <SortableItem id={piatto.id}>
      <Card className={`${piatto.available ? 'border-gray-700 bg-gray-800' : 'border-gray-600 bg-gray-800/50'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              {piatto.image_url && (
                <img
                  src={piatto.image_url}
                  alt={piatto.name}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`font-semibold text-lg ${piatto.available ? 'text-gray-100' : 'text-gray-400'}`}>
                    {piatto.name}
                  </h3>
                  <span className={`font-bold ${piatto.available ? 'text-primary-400' : 'text-gray-500'}`}>
                    €{piatto.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400">#{piatto.sort_order}</span>
                  {!piatto.available && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                      Non disponibile
                    </span>
                  )}
                </div>
                
                <p className={`text-sm mb-2 ${piatto.available ? 'text-gray-300' : 'text-gray-400'}`}>
                  {piatto.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {piatto.categorie.map(categoria => (
                    <span key={categoria.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
                      <Tag className="w-3 h-3 mr-1" />
                      {categoria.name}
                    </span>
                  ))}
                </div>
                
                {piatto.allergens && piatto.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {piatto.allergens.map(allergene => (
                      <span key={allergene} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-900/30 text-orange-400">
                        {allergene}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-400">
                  Creato il {new Date(piatto.created_at).toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleDisponibilita(piatto)}
                className={`p-2 rounded-md border border-gray-600 transition-colors ${
                  piatto.available 
                    ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-900/20' 
                    : 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
                }`}
              >
                {piatto.available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onEdit(piatto)}
                className="p-2 rounded-md border border-gray-600 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(piatto)}
                className="p-2 rounded-md border border-gray-600 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SortableItem>
  )
}

// Componente per categoria sortable
const SortableCategoria: React.FC<SortableCategoriaProps> = ({
  categoria,
  onEdit,
  onDelete,
  onToggleAttiva
}) => {
  return (
    <SortableItem id={categoria.id}>
      <Card className={`${categoria.attiva ? 'border-gray-700 bg-gray-800' : 'border-gray-600 bg-gray-800/50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`font-semibold text-lg ${categoria.attiva ? 'text-gray-100' : 'text-gray-400'}`}>
                    {categoria.name}
                  </h3>
                  <span className="text-sm text-gray-400">#{categoria.sort_order}</span>
                  {!categoria.attiva && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                      Disattivata
                    </span>
                  )}
                </div>
                {categoria.description && (
                  <p className={`text-sm ${categoria.attiva ? 'text-gray-300' : 'text-gray-400'}`}>
                    {categoria.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Creata il {new Date(categoria.created_at).toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleAttiva(categoria)}
                className={`p-2 rounded-md border border-gray-600 transition-colors ${
                  categoria.attiva 
                    ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-900/20' 
                    : 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
                }`}
              >
                {categoria.attiva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onEdit(categoria)}
                className="p-2 rounded-md border border-gray-600 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(categoria)}
                className="p-2 rounded-md border border-gray-600 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SortableItem>
  )
}

// Lista drag-and-drop per piatti
export const DragDropPiattiList: React.FC<DragDropPiattiListProps> = ({
  piatti,
  onReorder,
  onEdit,
  onDelete,
  onToggleDisponibilita,
  loading = false
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [isReordering, setIsReordering] = React.useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = piatti.findIndex(p => p.id === active.id)
    const newIndex = piatti.findIndex(p => p.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      setIsReordering(true)
      try {
        await onReorder(oldIndex, newIndex)
        toast.success('Ordine aggiornato con successo')
      } catch (error) {
        toast.error('Errore nell\'aggiornamento dell\'ordine')
      } finally {
        setIsReordering(false)
      }
    }
  }

  const activePiatto = activeId ? piatti.find(p => p.id === activeId) : null

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-300 mt-2">Caricamento piatti...</p>
      </div>
    )
  }

  if (piatti.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-300">Nessun piatto trovato</p>
          <p className="text-sm text-gray-400 mt-1">Crea il primo piatto per iniziare</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={piatti.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className={`space-y-4 ${isReordering ? 'pointer-events-none opacity-75' : ''}`}>
          {piatti.map((piatto) => (
            <SortablePiatto
              key={piatto.id}
              piatto={piatto}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleDisponibilita={onToggleDisponibilita}
            />
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activePiatto && (
          <div className="opacity-90 rotate-3 scale-105">
            <SortablePiatto
              piatto={activePiatto}
              onEdit={() => {}}
              onDelete={() => {}}
              onToggleDisponibilita={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

// Lista drag-and-drop per categorie
export const DragDropCategorieList: React.FC<DragDropCategorieListProps> = ({
  categorie,
  onReorder,
  onEdit,
  onDelete,
  onToggleAttiva,
  loading = false
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [isReordering, setIsReordering] = React.useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = categorie.findIndex(c => c.id === active.id)
    const newIndex = categorie.findIndex(c => c.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      setIsReordering(true)
      try {
        await onReorder(oldIndex, newIndex)
        toast.success('Ordine aggiornato con successo')
      } catch (error) {
        toast.error('Errore nell\'aggiornamento dell\'ordine')
      } finally {
        setIsReordering(false)
      }
    }
  }

  const activeCategoria = activeId ? categorie.find(c => c.id === activeId) : null

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-300 mt-2">Caricamento categorie...</p>
      </div>
    )
  }

  if (categorie.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-300">Nessuna categoria trovata</p>
          <p className="text-sm text-gray-400 mt-1">Crea la prima categoria per iniziare</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={categorie.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className={`space-y-4 ${isReordering ? 'pointer-events-none opacity-75' : ''}`}>
          {categorie.map((categoria) => (
            <SortableCategoria
              key={categoria.id}
              categoria={categoria}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAttiva={onToggleAttiva}
            />
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeCategoria && (
          <div className="opacity-90 rotate-3 scale-105">
            <SortableCategoria
              categoria={activeCategoria}
              onEdit={() => {}}
              onDelete={() => {}}
              onToggleAttiva={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

// Wrapper base per drag-and-drop
const DragDropWrapper: React.FC<DragDropWrapperProps> = ({ children }) => {
  return <div className="drag-drop-wrapper">{children}</div>
}

export default DragDropWrapper