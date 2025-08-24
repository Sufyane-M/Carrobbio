import { useState, useEffect } from 'react'
import { supabase, Contact } from '../lib/supabase'

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all contacts (admin only)
  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setContacts(data || [])
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei messaggi')
    } finally {
      setLoading(false)
    }
  }

  // Fetch contacts by status (admin only)
  const fetchContactsByStatus = async (status: Contact['status']) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data || []
    } catch (err) {
      console.error('Error fetching contacts by status:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei messaggi')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Create new contact message
  const createContact = async (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([{ ...contact, status: 'new' as const }])
        .select()
        .single()
      
      if (error) {
        // Handle specific error types
        if (error.code === '42501') {
          throw new Error('Permessi insufficienti per inviare il messaggio')
        }
        if (error.code === '23505') {
          throw new Error('Messaggio duplicato rilevato')
        }
        if (error.code === '23502') {
          throw new Error('Tutti i campi obbligatori devono essere compilati')
        }
        throw error
      }
      
      setContacts(prev => [data, ...prev])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'invio del messaggio'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Update contact status (admin only)
  const updateContactStatus = async (id: string, status: Contact['status']) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('contacts')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      setContacts(prev => prev.map(contact => contact.id === id ? data : contact))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento dello stato')
      throw err
    }
  }

  // Mark contact as read (admin only)
  const markAsRead = async (id: string) => {
    return updateContactStatus(id, 'read')
  }

  // Mark contact as replied (admin only)
  const markAsReplied = async (id: string) => {
    return updateContactStatus(id, 'replied')
  }

  // Delete contact (admin only)
  const deleteContact = async (id: string) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setContacts(prev => prev.filter(contact => contact.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella cancellazione del messaggio')
      throw err
    }
  }

  // Get unread contacts count (admin only)
  const getUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
      
      if (error) throw error
      
      return count || 0
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel conteggio dei messaggi non letti')
      return 0
    }
  }

  // Search contacts by name or email (admin only)
  const searchContacts = async (query: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data || []
    } catch (err) {
      console.error('Error searching contacts:', err)
      setError(err instanceof Error ? err.message : 'Errore nella ricerca dei messaggi')
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Don't auto-fetch contacts as they're admin-only
    // fetchContacts()
  }, [])

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    fetchContactsByStatus,
    createContact,
    updateContactStatus,
    markAsRead,
    markAsReplied,
    deleteContact,
    getUnreadCount,
    searchContacts
  }
}

export default useContacts