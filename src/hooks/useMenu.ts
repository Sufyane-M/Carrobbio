import { useState, useEffect } from 'react'
import { supabase, MenuItem } from '../lib/supabase'

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all menu items
  const fetchMenuItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('name')
      
      if (error) throw error
      
      // Convert price from string to number if needed
      const processedData = (data || []).map(item => ({
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
      }))
      
      setMenuItems(processedData)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      setError('Nessun piatto disponibile al momento')
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch menu items by category
  const fetchMenuItemsByCategory = async (category: MenuItem['category']) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .eq('category', category)
        .order('name')
      
      if (error) throw error
      
      // Convert price from string to number if needed
      const processedData = (data || []).map(item => ({
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
      }))
      
      setMenuItems(processedData)
    } catch (error) {
      console.error('Error fetching menu items by category:', error)
      setError('Nessun piatto disponibile al momento')
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }

  // Add new menu item (admin only)
  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('menu_items')
        .insert([item])
        .select()
        .single()
      
      if (error) throw error
      
      setMenuItems(prev => [...prev, data])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiunta del piatto')
      throw err
    }
  }

  // Update menu item (admin only)
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
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento del piatto')
      throw err
    }
  }

  // Delete menu item (admin only)
  const deleteMenuItem = async (id: string) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setMenuItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella cancellazione del piatto')
      throw err
    }
  }

  // Toggle availability (admin only)
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
      
      setMenuItems(prev => prev.map(item => item.id === id ? data : item))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento della disponibilità')
      throw err
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  return {
    menuItems,
    loading,
    error,
    fetchMenuItems,
    fetchMenuItemsByCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability
  }
}

export default useMenu