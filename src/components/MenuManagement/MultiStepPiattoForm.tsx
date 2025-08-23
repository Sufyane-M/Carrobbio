import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader } from '../Card'
import { Button } from '../Button'
import { MenuItem } from '../../lib/supabase'

// Category options for menu items
const CATEGORY_OPTIONS = [
  { value: 'antipasti', label: 'Antipasti' },
  { value: 'primi', label: 'Primi' },
  { value: 'secondi', label: 'Secondi' },
  { value: 'contorni', label: 'Contorni' },
  { value: 'dolci', label: 'Dolci' },
  { value: 'bevande', label: 'Bevande' }
]
import { ChevronLeft, ChevronRight, Check, Euro, Upload, X, Tag, ImageIcon, AlertCircle, CheckCircle2, CloudUpload } from 'lucide-react'
import { useToast } from '../Toast'
import AllergenManager from '../ui/AllergenManager'

interface MultiStepPiattoFormProps {
  piatto?: MenuItem | null
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onSubmit: (data: PiattoFormData, category: string) => Promise<void>
  onCancel: () => void
}

interface PiattoFormData {
  nome: string
  descrizione: string
  prezzo: number
  allergeni: string[]
  disponibile: boolean
  ordine: number
  immagine_url?: string
}

interface Allergen {
  id: string
  nome: string
  icona?: string
  colore?: string
}

const allergeniComuni = [
  'glutine', 'crostacei', 'uova', 'pesce', 'arachidi', 'soia', 
  'latte', 'frutta a guscio', 'sedano', 'senape', 'sesamo', 
  'anidride solforosa', 'lupini', 'molluschi'
]

const MultiStepPiattoForm: React.FC<MultiStepPiattoFormProps> = ({
  piatto,
  selectedCategory,
  onCategoryChange,
  onSubmit,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PiattoFormData>({
    nome: piatto?.name || '',
    descrizione: piatto?.description || '',
    prezzo: piatto?.price || 0,
    allergeni: piatto?.allergens || [],
    disponibile: piatto?.available ?? true,
    ordine: piatto?.sort_order || 0,
    immagine_url: piatto?.image_url || ''
  })
  // Category is now managed by parent component
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fieldValidation, setFieldValidation] = useState<Record<string, boolean>>({})
  const [isValidatingStep, setIsValidatingStep] = useState(false)
  const { showToast } = useToast()

  const totalSteps = 3

  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'nome':
        return !value?.trim() ? 'Il nome del piatto è obbligatorio' : ''
      case 'prezzo':
        return value <= 0 ? 'Il prezzo deve essere maggiore di 0' : ''
      case 'descrizione':
        return !value?.trim() ? 'La descrizione è obbligatoria' : ''
      case 'category':
        return !selectedCategory ? 'Seleziona una categoria' : ''
      default:
        return ''
    }
  }

  const validateStep = (step: number): boolean => {
    setIsValidatingStep(true)
    const newErrors: Record<string, string> = {}
    const newFieldValidation: Record<string, boolean> = {}

    if (step === 1) {
      const nomeError = validateField('nome', formData.nome)
      const prezzoError = validateField('prezzo', formData.prezzo)
      const descrizioneError = validateField('descrizione', formData.descrizione)
      
      if (nomeError) newErrors.nome = nomeError
      if (prezzoError) newErrors.prezzo = prezzoError
      if (descrizioneError) newErrors.descrizione = descrizioneError
      
      newFieldValidation.nome = !nomeError
      newFieldValidation.prezzo = !prezzoError
      newFieldValidation.descrizione = !descrizioneError
    }

    if (step === 2) {
      const categoryError = validateField('category', selectedCategory)
      if (categoryError) newErrors.category = categoryError
      newFieldValidation.category = !categoryError
    }

    setErrors(newErrors)
    setFieldValidation(newFieldValidation)
    setIsValidatingStep(false)
    return Object.keys(newErrors).length === 0
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    const error = validateField(fieldName, value)
    setErrors(prev => ({ ...prev, [fieldName]: error }))
    setFieldValidation(prev => ({ ...prev, [fieldName]: !error }))
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep(currentStep)) {
      await onSubmit(formData, selectedCategory)
    }
  }

  const toggleAllergene = (allergene: string) => {
    setFormData(prev => ({
      ...prev,
      allergeni: prev.allergeni.includes(allergene)
        ? prev.allergeni.filter(a => a !== allergene)
        : [...prev.allergeni, allergene]
    }))
  }

  const handleCategoryChange = (category: string) => {
    onCategoryChange(category)
    // Clear category error when user selects a category
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }))
    }
  }



  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => {
        const isCompleted = step < currentStep
        const isCurrent = step === currentStep
        const stepTitles = ['Dettagli Base', 'Categorie & Allergeni', 'Immagine & Opzioni']
        
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                isCurrent
                  ? 'border-green-500 bg-green-500 text-white shadow-lg scale-110'
                  : isCompleted
                    ? 'border-green-500 bg-green-500 text-white shadow-md'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-green-400'
              }`}>
                {isCompleted ? (
                  <Check className="w-6 h-6 animate-in fade-in duration-200" />
                ) : (
                  <span className={`text-sm font-bold transition-all duration-200 ${
                    isCurrent ? 'scale-110' : ''
                  }`}>{step}</span>
                )}
              </div>
              <div className={`mt-2 text-xs font-medium transition-colors duration-200 text-center max-w-20 ${
                isCurrent ? 'text-green-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
              }`}>
                {stepTitles[step - 1]}
              </div>
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-600'
              }`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Informazioni Base
        </h3>
        <p className="text-sm text-gray-300">
          Inserisci nome, descrizione e prezzo del piatto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nome del piatto *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => {
                const value = e.target.value
                setFormData(prev => ({ ...prev, nome: value }))
                handleFieldChange('nome', value)
              }}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors bg-gray-700 text-gray-100 placeholder-gray-400 ${
                errors.nome ? 'border-red-600 bg-red-900/20' : 
                fieldValidation.nome ? 'border-green-600 bg-green-900/20' : 'border-gray-600'
              }`}
              placeholder="Es. Pizza Margherita"
            />
            {fieldValidation.nome && !errors.nome && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
            {errors.nome && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </div>
          {errors.nome && (
            <p className="mt-1 text-sm text-red-400">{errors.nome}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Prezzo *
          </label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.prezzo}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0
                setFormData(prev => ({ ...prev, prezzo: value }))
                handleFieldChange('prezzo', value)
              }}
              className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors bg-gray-700 text-gray-100 placeholder-gray-400 ${
                errors.prezzo ? 'border-red-600 bg-red-900/20' : 
                fieldValidation.prezzo ? 'border-green-600 bg-green-900/20' : 'border-gray-600'
              }`}
              placeholder="0.00"
            />
            {fieldValidation.prezzo && !errors.prezzo && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
            {errors.prezzo && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </div>
          {errors.prezzo && (
            <p className="mt-1 text-sm text-red-400">{errors.prezzo}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Descrizione *
        </label>
        <div className="relative">
          <textarea
            value={formData.descrizione}
            onChange={(e) => {
              const value = e.target.value
              setFormData(prev => ({ ...prev, descrizione: value }))
              handleFieldChange('descrizione', value)
            }}
            rows={4}
            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 resize-none transition-colors bg-gray-700 text-gray-100 placeholder-gray-400 ${
              errors.descrizione ? 'border-red-600 bg-red-900/20' : 
              fieldValidation.descrizione ? 'border-green-600 bg-green-900/20' : 'border-gray-600'
            }`}
            placeholder="Descrivi gli ingredienti e le caratteristiche del piatto..."
          />
          {fieldValidation.descrizione && !errors.descrizione && (
            <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
          )}
          {errors.descrizione && (
            <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
          )}
        </div>
        {errors.descrizione && (
          <p className="mt-1 text-sm text-red-400">{errors.descrizione}</p>
        )}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Categorie e Allergeni
        </h3>
        <p className="text-sm text-gray-300">
          Seleziona le categorie di appartenenza e gli eventuali allergeni
        </p>
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Categoria *
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              handleCategoryChange(e.target.value)
              handleFieldChange('category', e.target.value)
            }}
            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors bg-gray-700 text-gray-100 border-gray-600 ${
              errors.category ? 'border-red-600 bg-red-900/20' : 
              fieldValidation.category ? 'border-green-600 bg-green-900/20' : 'border-gray-600'
            }`}
          >
            <option value="">Seleziona una categoria</option>
            {CATEGORY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldValidation.category && !errors.category && (
            <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
          )}
          {errors.category && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
          )}
        </div>
        {errors.category && (
          <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-600 rounded-lg mt-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{errors.category}</p>
          </div>
        )}
        {selectedCategory && !errors.category && (
          <div className="flex items-center space-x-2 p-3 bg-green-900/20 border border-green-600 rounded-lg mt-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-400 capitalize">
              Categoria selezionata: {selectedCategory}
            </p>
          </div>
        )}
      </div>

      {/* Allergeni */}
      <AllergenManager
        availableAllergens={allergeniComuni.map((nome, index) => ({
          id: nome,
          nome: nome.charAt(0).toUpperCase() + nome.slice(1)
        }))}
        selectedAllergens={formData.allergeni}
        onSelectionChange={(selectedIds) => {
          setFormData(prev => ({ ...prev, allergeni: selectedIds }))
        }}
        maxSelections={10}
        showCounter={true}
        variant="default"
      />
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Immagine e Opzioni
        </h3>
        <p className="text-sm text-gray-300">
          Carica un'immagine e configura le opzioni finali
        </p>
      </div>

      {/* Immagine */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Immagine del piatto (opzionale)
        </label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center bg-gray-800">
          {formData.immagine_url ? (
            <div className="relative">
              <img
                src={formData.immagine_url}
                alt="Anteprima piatto"
                className="mx-auto max-h-48 rounded-lg shadow-md"
              />
              <Button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, immagine_url: '' }))}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <X className="w-4 h-4 mr-1" />
                Rimuovi
              </Button>
            </div>
          ) : (
            <div className="text-gray-300">
              <ImageIcon className="mx-auto h-12 w-12 mb-2" />
              <p>Nessuna immagine caricata</p>
              <p className="text-sm">L'immagine può essere aggiunta successivamente</p>
            </div>
          )}
        </div>
      </div>

      {/* Opzioni */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Ordine di visualizzazione
          </label>
          <input
            type="number"
            value={formData.ordine}
            onChange={(e) => setFormData(prev => ({ ...prev, ordine: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 placeholder-gray-400"
            min="0"
            placeholder="0"
          />
          <p className="text-xs text-gray-400 mt-1">
            Numero più basso = posizione più alta nel menu
          </p>
        </div>
        
        <div className="flex items-center pt-6">
          <input
            type="checkbox"
            id="disponibile"
            checked={formData.disponibile}
            onChange={(e) => setFormData(prev => ({ ...prev, disponibile: e.target.checked }))}
            className="h-4 w-4 text-primary-400 focus:ring-primary-400 border-gray-600 bg-gray-700 rounded"
          />
          <label htmlFor="disponibile" className="ml-3 block text-sm font-medium text-gray-300">
            Piatto disponibile per gli ordini
          </label>
        </div>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    const stepContent = (() => {
      switch (currentStep) {
        case 1:
          return renderStep1()
        case 2:
          return renderStep2()
        case 3:
          return renderStep3()
        default:
          return renderStep1()
      }
    })()
    
    return (
      <div 
        key={currentStep}
        className="animate-in fade-in slide-in-from-right-5 duration-300 ease-out"
      >
        {stepContent}
      </div>
    )
  }

  return (
    <Card className="border-green-600 bg-green-900/20">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-100">
          {piatto ? 'Modifica Piatto' : 'Nuovo Piatto'}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {renderStepIndicator()}
          
          <div className="min-h-[400px]">
            {renderCurrentStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-700 mt-8">
            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="transition-all duration-200 hover:scale-105"
              >
                Annulla
              </Button>
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className="transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Indietro
                </Button>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-300 font-medium">
                Passo {currentStep} di {totalSteps}
              </div>
              <div className="flex space-x-1 mt-1">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      step === currentStep
                        ? 'bg-green-500 scale-125'
                        : step < currentStep
                          ? 'bg-green-400'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                  disabled={isValidatingStep}
                >
                  {isValidatingStep ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Validazione...
                    </div>
                  ) : (
                    <>
                      Avanti
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {piatto ? 'Aggiorna Piatto' : 'Crea Piatto'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default MultiStepPiattoForm