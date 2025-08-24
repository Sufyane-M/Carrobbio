import { useState, useEffect } from 'react'
import { supabase, Reservation } from '../lib/supabase'

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all reservations (admin only)
  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_date', { ascending: false })
        .order('reservation_time', { ascending: false })
      
      if (error) throw error
      
      setReservations(data || [])
    } catch (err) {
      console.error('Error fetching reservations:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle prenotazioni')
    } finally {
      setLoading(false)
    }
  }

  // Fetch reservations by date range
  const fetchReservationsByDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('reservation_date', startDate)
        .lte('reservation_date', endDate)
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true })
      
      if (error) throw error
      
      return data || []
    } catch (err) {
      console.error('Error fetching reservations by date range:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle prenotazioni')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Create new reservation
  const createReservation = async (reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      setError(null)
      
      // Check for conflicts
      const { data: existingReservations, error: checkError } = await supabase
        .from('reservations')
        .select('*')
        .eq('reservation_date', reservation.reservation_date)
        .eq('reservation_time', reservation.reservation_time)
        .neq('status', 'cancelled')
      
      if (checkError) throw checkError
      
      // Simple conflict check - in a real app you'd want more sophisticated logic
      const totalPartySize = existingReservations?.reduce((sum, res) => sum + res.party_size, 0) || 0
      if (totalPartySize + reservation.party_size > 50) { // Assuming max capacity of 50
        throw new Error('Non ci sono posti disponibili per questo orario')
      }
      
      const { data, error } = await supabase
        .from('reservations')
        .insert([{ ...reservation, status: 'pending' as const }])
        .select()
        .single()
      
      if (error) throw error
      
      setReservations(prev => [...prev, data])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione della prenotazione')
      throw err
    }
  }

  // Update reservation status (admin only)
  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      setReservations(prev => prev.map(res => res.id === id ? data : res))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento dello stato')
      throw err
    }
  }

  // Update reservation details (admin only)
  const updateReservation = async (id: string, updates: Partial<Reservation>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      setReservations(prev => prev.map(res => res.id === id ? data : res))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento della prenotazione')
      throw err
    }
  }

  // Delete reservation (admin only)
  const deleteReservation = async (id: string) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setReservations(prev => prev.filter(res => res.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella cancellazione della prenotazione')
      throw err
    }
  }

  // Get available time slots for a specific date
  const getAvailableTimeSlots = async (date: string) => {
    try {
      const { data: existingReservations, error } = await supabase
        .from('reservations')
        .select('reservation_time, party_size')
        .eq('reservation_date', date)
        .neq('status', 'cancelled')
      
      if (error) throw error
      
      // Define available time slots
      const allTimeSlots = [
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
      ]
      
      // Calculate availability for each slot
      const availableSlots = allTimeSlots.filter(slot => {
        const slotReservations = existingReservations?.filter(res => res.reservation_time === slot) || []
        const totalPartySize = slotReservations.reduce((sum, res) => sum + res.party_size, 0)
        return totalPartySize < 50 // Assuming max capacity of 50 per slot
      })
      
      return availableSlots
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli orari disponibili')
      return []
    }
  }

  useEffect(() => {
    // Don't auto-fetch reservations as they're admin-only
    // fetchReservations()
  }, [])

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    fetchReservationsByDateRange,
    createReservation,
    updateReservationStatus,
    updateReservation,
    deleteReservation,
    getAvailableTimeSlots
  }
}

export default useReservations