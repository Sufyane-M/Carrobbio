import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { designSystem } from '../../styles/design-system'
import { Text, Label } from './Typography'
import { Stack, Box } from './Spacing'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  maxFileSize?: number // in MB
  acceptedFormats?: string[]
  disabled?: boolean
  showPreview?: boolean
  allowReorder?: boolean
  uploadText?: string
  dragText?: string
}

interface UploadState {
  isDragging: boolean
  isUploading: boolean
  error: string | null
  uploadProgress: number
}

const DEFAULT_ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const DEFAULT_MAX_FILE_SIZE = 5 // 5MB

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  disabled = false,
  showPreview = true,
  allowReorder = true,
  uploadText = "Clicca per caricare o trascina le immagini qui",
  dragText = "Rilascia le immagini qui"
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isDragging: false,
    isUploading: false,
    error: null,
    uploadProgress: 0
  })
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Formato non supportato. Usa: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File troppo grande. Massimo ${maxFileSize}MB`
    }
    
    return null
  }, [acceptedFormats, maxFileSize])

  const processFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled) return
    
    const fileArray = Array.from(files)
    const remainingSlots = maxImages - images.length
    
    if (fileArray.length > remainingSlots) {
      setUploadState(prev => ({
        ...prev,
        error: `Puoi caricare massimo ${remainingSlots} immagini aggiuntive`
      }))
      return
    }

    setUploadState(prev => ({ ...prev, isUploading: true, error: null, uploadProgress: 0 }))

    try {
      const newImages: string[] = []
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const validationError = validateFile(file)
        
        if (validationError) {
          setUploadState(prev => ({ ...prev, error: validationError, isUploading: false }))
          return
        }

        // Simulate upload progress
        setUploadState(prev => ({ ...prev, uploadProgress: ((i + 1) / fileArray.length) * 100 }))
        
        // Convert to base64 or handle file upload here
        const reader = new FileReader()
        const imageUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        
        newImages.push(imageUrl)
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      onImagesChange([...images, ...newImages])
      setUploadState(prev => ({ ...prev, isUploading: false, uploadProgress: 100 }))
      
      // Clear success state after a moment
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, uploadProgress: 0 }))
      }, 1500)
      
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: 'Errore durante il caricamento delle immagini'
      }))
    }
  }, [images, onImagesChange, maxImages, disabled, validateFile])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setUploadState(prev => ({ ...prev, isDragging: true }))
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    
    if (dragCounter.current === 0) {
      setUploadState(prev => ({ ...prev, isDragging: false }))
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setUploadState(prev => ({ ...prev, isDragging: false }))
    dragCounter.current = 0
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }, [processFiles, disabled])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }, [processFiles])

  const handleRemoveImage = useCallback((index: number) => {
    if (disabled) return
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }, [images, onImagesChange, disabled])

  const handleImageReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (disabled || !allowReorder) return
    
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }, [ images, onImagesChange, disabled, allowReorder])

  const handleImageDragStart = useCallback((e: React.DragEvent, index: number) => {
    if (!allowReorder || disabled) return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }, [allowReorder, disabled])

  const handleImageDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (!allowReorder || disabled || draggedIndex === null) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [allowReorder, disabled, draggedIndex])

  const handleImageDrop = useCallback((e: React.DragEvent, index: number) => {
    if (!allowReorder || disabled || draggedIndex === null) return
    e.preventDefault()
    handleImageReorder(draggedIndex, index)
    setDraggedIndex(null)
  }, [allowReorder, disabled, draggedIndex, handleImageReorder])

  const clearError = useCallback(() => {
    setUploadState(prev => ({ ...prev, error: null }))
  }, [])

  const canUploadMore = images.length < maxImages

  return (
    <Stack gap="md">
      {/* Upload Area */}
      {canUploadMore && (
        <Box>
          <Label className="text-gray-700 mb-2">
            Immagini ({images.length}/{maxImages})
          </Label>
          
          <Box
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
              ${uploadState.isDragging
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${uploadState.isUploading ? 'pointer-events-none' : ''}
            `}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !disabled && !uploadState.isUploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFormats.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
              disabled={disabled}
            />
            
            {uploadState.isUploading ? (
              <Stack gap="sm" align="center">
                <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
                <Text variant="body" className="text-gray-600">
                  Caricamento in corso... {Math.round(uploadState.uploadProgress)}%
                </Text>
                <Box className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                  <Box 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadState.uploadProgress}%` }}
                  />
                </Box>
              </Stack>
            ) : (
              <Stack gap="sm" align="center">
                <Upload className={`h-8 w-8 ${uploadState.isDragging ? 'text-red-500' : 'text-gray-600'}`} />
                <Text variant="body" className="text-gray-600">
                  {uploadState.isDragging ? dragText : uploadText}
                </Text>
                <Text variant="caption" className="text-gray-600">
                  Formati supportati: {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}
                  <br />
                  Dimensione massima: {maxFileSize}MB
                </Text>
              </Stack>
            )}
          </Box>
        </Box>
      )}

      {/* Error Message */}
      {uploadState.error && (
        <Box className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <Text variant="caption" className="text-red-700 flex-1">
            {uploadState.error}
          </Text>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </Box>
      )}

      {/* Success Message */}
      {uploadState.uploadProgress === 100 && (
        <Box className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in duration-300">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <Text variant="caption" className="text-green-700">
            Immagini caricate con successo!
          </Text>
        </Box>
      )}

      {/* Image Preview Grid */}
      {showPreview && images.length > 0 && (
        <Box>
          <Label className="text-gray-700 mb-3">
            Anteprima immagini
            {allowReorder && (
              <Text variant="caption" className="ml-2 text-gray-600">
                (trascina per riordinare)
              </Text>
            )}
          </Label>
          
          <Box className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <Box
                key={index}
                className={`
                  relative group rounded-lg overflow-hidden border-2 transition-all duration-200
                  ${draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                  ${allowReorder && !disabled ? 'cursor-move' : ''}
                  border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600
                `}
                draggable={allowReorder && !disabled}
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDrop={(e) => handleImageDrop(e, index)}
              >
                <Box className="aspect-square">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </Box>
                
                {/* Remove button */}
                {!disabled && (
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                
                {/* Image index */}
                <Box className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                  {index + 1}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <Box className="text-center py-8">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <Text variant="body" className="text-gray-700">
            Nessuna immagine caricata
          </Text>
        </Box>
      )}
    </Stack>
  )
}

export default ImageUpload