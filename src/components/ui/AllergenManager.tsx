import React, { useState, useCallback } from 'react'
import { X, Plus, AlertTriangle, Check } from 'lucide-react'
import { designSystem } from '../../styles/design-system'
import { Text, Label } from './Typography'
import { Stack, Box, Inline } from './Spacing'

interface Allergen {
  id: string
  nome: string
  icona?: string
  colore?: string
}

interface AllergenManagerProps {
  availableAllergens: Allergen[]
  selectedAllergens: string[]
  onSelectionChange: (selectedIds: string[]) => void
  maxSelections?: number
  showCounter?: boolean
  variant?: 'default' | 'compact'
  disabled?: boolean
}

const ALLERGEN_COLORS = [
  'bg-red-900/30 text-red-400 border-red-600 hover:bg-red-900/50',
  'bg-orange-900/30 text-orange-400 border-orange-600 hover:bg-orange-900/50',
  'bg-yellow-900/30 text-yellow-400 border-yellow-600 hover:bg-yellow-900/50',
  'bg-green-900/30 text-green-400 border-green-600 hover:bg-green-900/50',
  'bg-blue-900/30 text-blue-400 border-blue-600 hover:bg-blue-900/50',
  'bg-purple-900/30 text-purple-400 border-purple-600 hover:bg-purple-900/50',
  'bg-pink-900/30 text-pink-400 border-pink-600 hover:bg-pink-900/50',
  'bg-indigo-900/30 text-indigo-400 border-indigo-600 hover:bg-indigo-900/50'
]

export const AllergenManager: React.FC<AllergenManagerProps> = ({
  availableAllergens,
  selectedAllergens,
  onSelectionChange,
  maxSelections,
  showCounter = true,
  variant = 'default',
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAll, setShowAll] = useState(false)

  const filteredAllergens = availableAllergens.filter(allergen =>
    allergen.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayedAllergens = showAll ? filteredAllergens : filteredAllergens.slice(0, 12)

  const handleToggleAllergen = useCallback((allergenId: string) => {
    if (disabled) return

    const isSelected = selectedAllergens.includes(allergenId)
    let newSelection: string[]

    if (isSelected) {
      newSelection = selectedAllergens.filter(id => id !== allergenId)
    } else {
      if (maxSelections && selectedAllergens.length >= maxSelections) {
        return // Don't add if max selections reached
      }
      newSelection = [...selectedAllergens, allergenId]
    }

    onSelectionChange(newSelection)
  }, [selectedAllergens, onSelectionChange, maxSelections, disabled])

  const getAllergenColorClass = (index: number) => {
    return ALLERGEN_COLORS[index % ALLERGEN_COLORS.length]
  }

  const isCompact = variant === 'compact'

  return (
    <Stack gap={isCompact ? 'sm' : 'md'}>
      {/* Header with counter */}
      <Box className="flex items-center justify-between">
        <Label className="text-gray-300">
          Allergeni
          {maxSelections && (
            <Text variant="caption" className="ml-2 text-gray-400">
              (max {maxSelections})
            </Text>
          )}
        </Label>
        {showCounter && (
          <Box className="flex items-center gap-2">
            <Text variant="caption" className="text-gray-400">
              {selectedAllergens.length} selezionati
            </Text>
            {maxSelections && selectedAllergens.length >= maxSelections && (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
          </Box>
        )}
      </Box>

      {/* Search input */}
      {!isCompact && availableAllergens.length > 8 && (
        <Box>
          <input
            type="text"
            placeholder="Cerca allergeni..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            disabled={disabled}
          />
        </Box>
      )}

      {/* Selected allergens display */}
      {selectedAllergens.length > 0 && (
        <Box>
          <Text variant="caption" className="text-gray-300 mb-2">
            Allergeni selezionati:
          </Text>
          <Inline gap="xs" wrap>
            {selectedAllergens.map(allergenId => {
              const allergen = availableAllergens.find(a => a.id === allergenId)
              if (!allergen) return null
              
              const colorIndex = availableAllergens.findIndex(a => a.id === allergenId)
              
              return (
                <Box
                  key={allergenId}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium transition-all duration-200 ${
                    getAllergenColorClass(colorIndex)
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => !disabled && handleToggleAllergen(allergenId)}
                >
                  <Check className="h-3 w-3" />
                  <span>{allergen.nome}</span>
                  {!disabled && (
                    <X className="h-3 w-3 hover:scale-110 transition-transform" />
                  )}
                </Box>
              )
            })}
          </Inline>
        </Box>
      )}

      {/* Available allergens grid */}
      <Box>
        <Text variant="caption" className="text-gray-300 mb-2">
          Allergeni disponibili:
        </Text>
        <Box className={`grid gap-2 ${
          isCompact 
            ? 'grid-cols-2 sm:grid-cols-3' 
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
        }`}>
          {displayedAllergens.map((allergen, index) => {
            const isSelected = selectedAllergens.includes(allergen.id)
            const isMaxReached = maxSelections && selectedAllergens.length >= maxSelections && !isSelected
            const colorIndex = availableAllergens.findIndex(a => a.id === allergen.id)
            
            return (
              <button
                key={allergen.id}
                type="button"
                onClick={() => handleToggleAllergen(allergen.id)}
                disabled={disabled || isMaxReached}
                className={`
                  relative p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                  ${isSelected 
                    ? `${getAllergenColorClass(colorIndex)} border-current shadow-md scale-105` 
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-600'
                  }
                  ${disabled || isMaxReached 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer hover:shadow-sm'
                  }
                  ${isCompact ? 'py-2' : 'py-3'}
                `}
              >
                {isSelected && (
                  <Check className="absolute top-1 right-1 h-3 w-3" />
                )}
                <Text variant={isCompact ? 'caption' : 'body'} className="truncate">
                  {allergen.nome}
                </Text>
              </button>
            )
          })}
        </Box>

        {/* Show more/less button */}
        {!isCompact && filteredAllergens.length > 12 && (
          <Box className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
              disabled={disabled}
            >
              {showAll ? 'Mostra meno' : `Mostra tutti (${filteredAllergens.length - 12} in più)`}
            </button>
          </Box>
        )}
      </Box>

      {/* No results message */}
      {searchTerm && filteredAllergens.length === 0 && (
        <Box className="text-center py-4">
          <Text variant="body" className="text-gray-700">
            Nessun allergene trovato per "{searchTerm}"
          </Text>
        </Box>
      )}
    </Stack>
  )
}

export default AllergenManager