import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '../Card'
import { Button } from '../Button'
// Categoria type removed - using menu_items with integrated categories
interface Categoria {
  id: string
  nome: string
  descrizione?: string
  ordine: number
  attiva: boolean
  created_at?: string
  updated_at?: string
}
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

interface CategorieManagerProps {
  categorie: Categoria[]
  loading: boolean
  onCreateCategoria: (categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>) => Promise<Categoria>
  onUpdateCategoria: (id: string, updates: Partial<Categoria>) => Promise<Categoria>
  onDeleteCategoria: (id: string) => Promise<void>
  onToggleAttiva: (categoria: Categoria) => Promise<void>
  onReorderCategorie: (categorieRiordinate: { id: string; ordine: number }[]) => Promise<void>
}

interface CategoriaFormData {
  nome: string
  descrizione: string
  ordine: number
  attiva: boolean
}

const CategorieManager: React.FC<CategorieManagerProps> = ({
  categorie,
  loading,
  onCreateCategoria,
  onUpdateCategoria,
  onDeleteCategoria,
  onToggleAttiva,
  onReorderCategorie
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [formData, setFormData] = useState<CategoriaFormData>({
    nome: '',
    descrizione: '',
    ordine: 0,
    attiva: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setFormData({
      nome: '',
      descrizione: '',
      ordine: categorie.length,
      attiva: true
    })
    setEditingCategoria(null)
    setShowForm(false)
  }

  const handleEdit = (categoria: Categoria) => {
    setFormData({
      nome: categoria.nome,
      descrizione: categoria.descrizione || '',
      ordine: categoria.ordine,
      attiva: categoria.attiva
    })
    setEditingCategoria(categoria)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome.trim()) {
      toast.error('Il nome della categoria è obbligatorio')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingCategoria) {
        await onUpdateCategoria(editingCategoria.id, {
          nome: formData.nome.trim(),
          descrizione: formData.descrizione.trim() || undefined,
          ordine: formData.ordine,
          attiva: formData.attiva
        })
        toast.success('Categoria aggiornata con successo')
      } else {
        await onCreateCategoria({
          nome: formData.nome.trim(),
          descrizione: formData.descrizione.trim() || undefined,
          ordine: formData.ordine,
          attiva: formData.attiva
        })
        toast.success('Categoria creata con successo')
      }
      resetForm()
    } catch (error) {
      toast.error(editingCategoria ? 'Errore nell\'aggiornamento della categoria' : 'Errore nella creazione della categoria')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (categoria: Categoria) => {
    if (!confirm(`Sei sicuro di voler eliminare la categoria "${categoria.nome}"? Questa azione rimuoverà la categoria da tutti i piatti associati.`)) {
      return
    }

    try {
      await onDeleteCategoria(categoria.id)
      toast.success('Categoria eliminata con successo')
    } catch (error) {
      toast.error('Errore nell\'eliminazione della categoria')
    }
  }

  const handleToggleAttiva = async (categoria: Categoria) => {
    try {
      await onToggleAttiva(categoria)
      toast.success(`Categoria ${categoria.attiva ? 'disattivata' : 'attivata'} con successo`)
    } catch (error) {
      toast.error('Errore nell\'aggiornamento della categoria')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Gestione Categorie</h2>
          <p className="text-gray-300 mt-1">Organizza e gestisci le categorie del menu</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuova Categoria
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-blue-600 bg-blue-900/20">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-100">
              {editingCategoria ? 'Modifica Categoria' : 'Nuova Categoria'}
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-gray-700 text-gray-100 placeholder-gray-400"
                    placeholder="Es. Antipasti, Primi Piatti..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ordine
                  </label>
                  <input
                    type="number"
                    value={formData.ordine}
                    onChange={(e) => setFormData(prev => ({ ...prev, ordine: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-gray-700 text-gray-100"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={formData.descrizione}
                  onChange={(e) => setFormData(prev => ({ ...prev, descrizione: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-gray-700 text-gray-100 placeholder-gray-400"
                  rows={3}
                  placeholder="Descrizione opzionale della categoria..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="attiva"
                  checked={formData.attiva}
                  onChange={(e) => setFormData(prev => ({ ...prev, attiva: e.target.checked }))}
                  className="h-4 w-4 text-primary-400 focus:ring-primary-400 bg-gray-700 border-gray-600 rounded"
                />
                <label htmlFor="attiva" className="ml-2 block text-sm text-gray-300">
                  Categoria attiva
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : (editingCategoria ? 'Aggiorna' : 'Crea')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista Categorie */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-300 mt-2">Caricamento categorie...</p>
          </div>
        ) : categorie.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-300">Nessuna categoria trovata</p>
              <p className="text-sm text-gray-400 mt-1">Crea la prima categoria per iniziare</p>
            </CardContent>
          </Card>
        ) : (
          categorie.map((categoria) => (
            <Card key={categoria.id} className={`${categoria.attiva ? 'border-gray-700 bg-gray-800' : 'border-gray-600 bg-gray-800/50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="cursor-move text-gray-400 hover:text-gray-200">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold ${categoria.attiva ? 'text-gray-100' : 'text-gray-400'}`}>
                          {categoria.nome}
                        </h3>
                        <span className="text-sm text-gray-400">#{categoria.ordine}</span>
                        {!categoria.attiva && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                            Disattivata
                          </span>
                        )}
                      </div>
                      {categoria.descrizione && (
                        <p className={`text-sm mt-1 ${categoria.attiva ? 'text-gray-300' : 'text-gray-400'}`}>
                          {categoria.descrizione}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Creata il {new Date(categoria.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleToggleAttiva(categoria)}
                      variant="outline"
                      size="sm"
                      className={categoria.attiva ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {categoria.attiva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={() => handleEdit(categoria)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(categoria)}
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

export default CategorieManager