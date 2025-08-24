import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader } from '../Card'
import { Button } from '../Button'
import { MenuItem } from '../../lib/supabase'

type CategoryType = 'antipasti' | 'pizza' | 'pasta' | 'pesce' | 'dolci' | 'bevande'

// Simplified interface for menu items
interface MenuItemWithExtras extends MenuItem {
  allergens?: string[]
  sort_order?: number
}
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, X, Tag, Euro, GripVertical, Image as ImageIcon } from 'lucide-react'
import { useToast } from '../Toast'
import MultiStepPiattoForm from './MultiStepPiattoForm'

interface PiattiManagerProps {
  piatti: MenuItemWithExtras[]
  loading?: boolean
  onCreatePiatto: (piatto: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => Promise<MenuItemWithExtras>
  onUpdatePiatto: (id: string, updates: Partial<MenuItem>) => Promise<MenuItemWithExtras>
  onDeletePiatto: (id: string) => Promise<void>
  onToggleDisponibilita: (id: string, disponibile: boolean) => Promise<void>
  onUploadImmagine: (file: File, piattoId?: string) => Promise<string>
  onEliminaImmagine: (piattoId: string) => Promise<void>
}

export interface PiattoFormData {
  nome: string
  descrizione: string
  prezzo: number
  allergeni: string[]
  disponibile: boolean
  ordine: number
  immagine_url: string
}

const allergeniComuni = [
  'glutine', 'crostacei', 'uova', 'pesce', 'arachidi', 'soia', 
  'latte', 'frutta a guscio', 'sedano', 'senape', 'sesamo', 
  'anidride solforosa', 'lupini', 'molluschi'
]

const PiattiManager: React.FC<PiattiManagerProps> = ({
  piatti,
  loading,
  onCreatePiatto,
  onUpdatePiatto,
  onDeletePiatto,
  onToggleDisponibilita,
  onUploadImmagine,
  onEliminaImmagine
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editingPiatto, setEditingPiatto] = useState<MenuItemWithExtras | null>(null)
  const [formData, setFormData] = useState<PiattoFormData>({
    nome: '',
    descrizione: '',
    prezzo: 0,
    allergeni: [],
    disponibile: true,
    ordine: 0,
    immagine_url: ''
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('')
  const [termineRicerca, setTermineRicerca] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const resetForm = () => {
    setFormData({
      nome: '',
      descrizione: '',
      prezzo: 0,
      allergeni: [],
      disponibile: true,
      ordine: piatti.length,
      immagine_url: ''
    })
    setSelectedCategory('')
    setEditingPiatto(null)
    setShowForm(false)
  }

  const handleEdit = (piatto: MenuItemWithExtras) => {
    setFormData({
      nome: piatto.name,
      descrizione: piatto.description,
      prezzo: piatto.price,
      allergeni: piatto.allergens || [],
      disponibile: piatto.available,
      ordine: piatto.sort_order || 0,
      immagine_url: piatto.image_url || ''
    })
    setSelectedCategory(piatto.category)
    setEditingPiatto(piatto)
    setShowForm(true)
  }

  const handleFormSubmit = async (formData: PiattoFormData, category: string) => {
    try {
      setIsSubmitting(true)
      
      // Creiamo l'oggetto piatto per le funzioni del hook
      const piattoData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.nome,
        description: formData.descrizione,
        price: formData.prezzo,
        allergens: formData.allergeni,
        available: formData.disponibile,
        sort_order: formData.ordine,
        image_url: formData.immagine_url,
        category: category as MenuItem['category']
      }
      
      if (editingPiatto) {
        await onUpdatePiatto(editingPiatto.id, piattoData)
        showToast('success', 'Piatto aggiornato', 'Il piatto è stato aggiornato con successo')
      } else {
        await onCreatePiatto(piattoData)
        showToast('success', 'Piatto creato', 'Il piatto è stato creato con successo')
      }
      
      resetForm()
    } catch (error) {
      showToast('error', 'Errore', 'Si è verificato un errore durante il salvataggio')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (piatto: MenuItemWithExtras) => {
    if (!confirm(`Sei sicuro di voler eliminare il piatto "${piatto.name}"?`)) {
      return
    }

    try {
      if (piatto.image_url) {
        await onEliminaImmagine(piatto.id)
      }
      await onDeletePiatto(piatto.id)
      showToast('success', 'Piatto eliminato', 'Il piatto è stato eliminato con successo')
    } catch (error) {
      showToast('error', 'Errore eliminazione', 'Errore nell\'eliminazione del piatto')
    }
  }

  const handleToggleDisponibilita = async (piatto: MenuItemWithExtras) => {
    try {
      await onToggleDisponibilita(piatto.id, !piatto.available)
      showToast('success', 'Disponibilità aggiornata', `Piatto ${piatto.available ? 'disattivato' : 'attivato'} con successo`)
    } catch (error) {
      showToast('error', 'Errore disponibilità', 'Errore nell\'aggiornamento della disponibilità')
    }
  }





  // Filtriamo i piatti in base alla categoria selezionata e al termine di ricerca
  const piattiFiltrati = piatti.filter(piatto => {
    const matchCategoria = !filtroCategoria || piatto.category === filtroCategoria
    const matchRicerca = !termineRicerca || 
      piatto.name.toLowerCase().includes(termineRicerca.toLowerCase()) ||
      piatto.description.toLowerCase().includes(termineRicerca.toLowerCase())
    return matchCategoria && matchRicerca
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Gestione Piatti</h2>
          <p className="text-gray-300 mt-1">Crea e gestisci i piatti del menu</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Piatto
        </Button>
      </div>

      {/* Filtri */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cerca piatti
              </label>
              <input
                type="text"
                value={termineRicerca}
                onChange={(e) => setTermineRicerca(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-gray-700 text-gray-100 placeholder-gray-400"
                placeholder="Cerca per nome o descrizione..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Filtra per categoria
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-gray-700 text-gray-100"
              >
                <option value="">Tutte le categorie</option>
                <option value="antipasti">Antipasti</option>
                <option value="primi">Primi</option>
                <option value="secondi">Secondi</option>
                <option value="contorni">Contorni</option>
                <option value="dolci">Dolci</option>
                <option value="bevande">Bevande</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Step Form */}
      {showForm && (
        <MultiStepPiattoForm
          piatto={editingPiatto}
          selectedCategory={(editingPiatto?.category as CategoryType) || 'antipasti'}
          onCategoryChange={(category) => {
            if (editingPiatto) {
              setEditingPiatto({ ...editingPiatto, category: category as CategoryType })
            }
          }}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setEditingPiatto(null)
            setShowForm(false)
          }}
        />
      )}

      {/* Lista Piatti */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-300 mt-2">Caricamento piatti...</p>
          </div>
        ) : piattiFiltrati.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-300">
                {termineRicerca || filtroCategoria ? 'Nessun piatto trovato con i filtri selezionati' : 'Nessun piatto trovato'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {termineRicerca || filtroCategoria ? 'Prova a modificare i filtri' : 'Crea il primo piatto per iniziare'}
              </p>
            </CardContent>
          </Card>
        ) : (
          piattiFiltrati.map((piatto) => (
              <Card key={piatto.id} className={`${piatto.available ? 'border-gray-700 bg-gray-800' : 'border-gray-600 bg-gray-800/50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="cursor-move text-gray-400 hover:text-gray-200 mt-1">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
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
                      
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 capitalize">
                          <Tag className="w-3 h-3 mr-1" />
                          {piatto.category}
                        </span>
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
                    <Button
                      onClick={() => handleToggleDisponibilita(piatto)}
                      variant="outline"
                      size="sm"
                      className={piatto.available ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {piatto.available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={() => handleEdit(piatto)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(piatto)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default PiattiManager