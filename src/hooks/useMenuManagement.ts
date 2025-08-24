import { useState, useEffect } from 'react'
import { supabase, MenuItem } from '../lib/supabase'

export const useMenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch tutte le categorie uniche dai menu items
  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('category')
      
      if (error) throw error
      
      // Estrai categorie uniche
      const uniqueCategories = [...new Set(data?.map(item => item.category).filter(Boolean) || [])]
      setCategories(uniqueCategories.sort())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle categorie')
    } finally {
      setLoading(false)
    }
  }

  // Fetch tutti i menu items
  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      if (!data || data.length === 0) {
        setError('Nessun piatto disponibile al momento')
        setMenuItems([])
        return
      }
      
      setMenuItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nessun piatto disponibile al momento')
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }

  // Crea un nuovo menu item
  const createMenuItem = async (menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('menu_items')
        .insert([menuItem])
        .select()
        .single()
      
      if (error) throw error
      
      setMenuItems(prev => [...prev, data])
      // Aggiorna anche le categorie se è una nuova categoria
      if (data.category && !categories.includes(data.category)) {
        setCategories(prev => [...prev, data.category].sort())
      }
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione del piatto')
      throw err
    }
  }

  // Aggiorna un menu item
  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      setMenuItems(prev => prev.map(item => item.id === id ? data : item))
      // Aggiorna le categorie se necessario
      if (data.category && !categories.includes(data.category)) {
        setCategories(prev => [...prev, data.category].sort())
      }
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento del piatto')
      throw err
    }
  }

  // Elimina un menu item
  const deleteMenuItem = async (id: string) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setMenuItems(prev => prev.filter(item => item.id !== id))
      // Aggiorna le categorie rimuovendo quelle non più utilizzate
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione del piatto')
      throw err
    }
  }







  // Toggle disponibilità menu item
  const toggleAvailability = async (id: string, available: boolean) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('menu_items')
        .update({ available })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      setMenuItems(prev => prev.map(item => item.id === id ? { ...item, available } : item))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento della disponibilità')
      throw err
    }
  }







  // Upload immagine
  const uploadImage = async (file: File, menuItemId: string) => {
    try {
      setError(null)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${menuItemId}.${fileExt}`
      const filePath = `menu-items/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, { upsert: true })
      
      if (uploadError) throw uploadError
      
      const { data } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath)
      
      return data.publicUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'upload dell\'immagine')
      throw err
    }
  }

  // Elimina immagine
  const deleteImage = async (menuItemId: string) => {
    try {
      setError(null)
      
      // Troviamo tutti i file per questo menu item
      const { data: files } = await supabase.storage
        .from('menu-images')
        .list('menu-items', {
          search: menuItemId
        })
      
      if (files && files.length > 0) {
        const filePaths = files.map(file => `menu-items/${file.name}`)
        const { error } = await supabase.storage
          .from('menu-images')
          .remove(filePaths)
        
        if (error) throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione dell\'immagine')
      throw err
    }
  }

  // Inizializzazione
  useEffect(() => {
    fetchCategories()
    fetchMenuItems()
  }, [])

  return {
    // Stato
    menuItems,
    categories,
    loading,
    error,
    
    // Funzioni menu items
    fetchMenuItems,
    fetchCategories,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    
    // Funzioni immagini
    uploadImage,
    deleteImage,
    
    // Alias per compatibilità con codice esistente
    piatti: menuItems,
    categorie: categories.map(cat => ({ nome: cat })),
    fetchPiatti: fetchMenuItems,
    createPiatto: createMenuItem,
    updatePiatto: updateMenuItem,
    deletePiatto: deleteMenuItem,
    toggleDisponibilitaPiatto: toggleAvailability,
    uploadImmagine: uploadImage,
    eliminaImmagine: deleteImage
  }
}