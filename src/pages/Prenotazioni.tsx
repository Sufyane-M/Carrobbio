import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/Card'
import { SEO, pageSEO } from '../components/SEO'
import { useToast } from '../components/Toast'
import { useReservations } from '../hooks/useReservations'
import { formatDate, formatTime } from '../lib/utils'
import { Calendar, Clock, Users, Phone } from 'lucide-react'

const reservationSchema = z.object({
  customer_name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  customer_email: z.string().email('Inserisci un indirizzo email valido'),
  customer_phone: z.string().min(10, 'Inserisci un numero di telefono valido'),
  reservation_date: z.string().min(1, 'Seleziona una data'),
  reservation_time: z.string().min(1, 'Seleziona un orario'),
  party_size: z.number().min(1, 'Minimo 1 persona').max(20, 'Massimo 20 persone'),
  special_requests: z.string().optional()
})

type ReservationFormData = z.infer<typeof reservationSchema>

export const Prenotazioni: React.FC = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const { createReservation, loading, error } = useReservations()
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema)
  })

  const selectedDate = watch('reservation_date')

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = []
    // Restaurant is open 19:00-23:00
    for (let hour = 19; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Check if selected date is Thursday (closed day)
  const isThursday = (dateString: string) => {
    const date = new Date(dateString)
    return date.getDay() === 4 // Thursday is day 4
  }

  const onSubmit = async (data: ReservationFormData) => {
    // Check if selected date is Thursday
    if (isThursday(data.reservation_date)) {
      return
    }

    try {
      await createReservation({
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        reservation_date: data.reservation_date,
        reservation_time: data.reservation_time,
        party_size: data.party_size,
        notes: data.special_requests || null
      })

      showToast('success', 'Prenotazione inviata!', 'Riceverai una conferma via email entro 24 ore.')
      reset()
      setSubmitSuccess(true)
      
      // Reset success message after 8 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 8000)
    } catch (err) {
      console.error('Error submitting reservation:', err)
      showToast('error', 'Errore nella prenotazione', 'Si è verificato un errore. Riprova o contattaci direttamente.')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO {...pageSEO.prenotazioni} />
      
      {/* Hero Header Section - Enhanced with brand styling */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-neutral-800 leading-tight">
              Prenota un{' '}
              <span className="text-primary-600 font-accent text-5xl md:text-6xl">
                Tavolo
              </span>
            </h1>
            <div className="w-24 h-1 bg-primary-500 rounded-full mx-auto mb-8"></div>
            <p className="font-body text-lg leading-relaxed text-neutral-700 max-w-2xl mx-auto">
              Riserva il tuo posto al Carrobbio per un'esperienza culinaria indimenticabile. 
              Ti confermeremo la prenotazione il prima possibile.
            </p>
          </div>
        </div>
      </section>

      {/* Restaurant Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card variant="primary" className="text-center p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-3 bg-primary-100 rounded-xl w-fit mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-2">
                Orari di{' '}
                <span className="text-primary-600 font-accent text-xl">Apertura</span>
              </h3>
              <p className="font-body text-sm text-neutral-700 leading-relaxed">
                Lun-Dom: 19:00-23:00<br />
                <span className="text-accent-600 font-medium">Giovedì chiuso</span>
              </p>
            </Card>
            
            <Card variant="secondary" className="text-center p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-3 bg-secondary-100 rounded-xl w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-2">
                <span className="text-secondary-600 font-accent text-xl">Gruppi</span>
              </h3>
              <p className="font-body text-sm text-neutral-700 leading-relaxed">
                Da 1 a 20 persone<br />
                Per gruppi più numerosi contattaci
              </p>
            </Card>
            
            <Card variant="accent" className="text-center p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-3 bg-accent-100 rounded-xl w-fit mx-auto mb-4">
                <Phone className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-2">
                <span className="text-accent-600 font-accent text-xl">Contatti</span>
              </h3>
              <p className="font-body text-sm text-neutral-700 leading-relaxed">
                +39 335 6656335<br />
                0522 206510
              </p>
            </Card>
          </div>

          {/* Reservation Form - Enhanced with brand styling */}
          <Card variant="featured" className="rounded-2xl shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50">
              <h2 className="font-display text-2xl font-bold text-neutral-800">
                Dettagli{' '}
                <span className="text-primary-600 font-accent text-3xl">
                  Prenotazione
                </span>
              </h2>
              <div className="w-20 h-1 bg-primary-500 rounded-full mt-2 mb-4"></div>
              <p className="font-body text-neutral-700">
                Compila tutti i campi per completare la tua prenotazione
              </p>
            </CardHeader>
            <CardContent>
              {submitSuccess && (
                <div className="mb-6 p-6 bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-200 rounded-xl">
                  <h3 className="text-secondary-800 font-heading font-semibold mb-3 flex items-center">
                    <span className="text-secondary-600 mr-2 text-xl">✓</span>
                    Prenotazione inviata con successo!
                  </h3>
                  <p className="text-secondary-700 font-body text-sm leading-relaxed">
                    Riceverai una conferma via email entro 24 ore. Per urgenze, contattaci direttamente.
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-6 bg-gradient-to-r from-accent-50 to-accent-100 border border-accent-200 rounded-xl">
                  <p className="text-accent-800 font-heading font-medium flex items-center">
                    <span className="text-accent-600 mr-2 text-xl">✗</span>
                    {error}
                  </p>
                </div>
              )}

              {selectedDate && isThursday(selectedDate) && (
                <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl">
                  <p className="text-orange-800 font-heading font-medium flex items-center">
                    <span className="text-orange-600 mr-2 text-xl">⚠️</span>
                    Il ristorante è chiuso il giovedì. Seleziona un altro giorno.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="font-heading text-lg font-semibold text-neutral-800 border-b border-primary-200 pb-2">
                    Informazioni{' '}
                    <span className="text-primary-600 font-accent text-xl">Personali</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="customer_name" className="block font-heading text-sm font-medium text-neutral-700 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        {...register('customer_name')}
                        type="text"
                        id="customer_name"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-body"
                        placeholder="Mario Rossi"
                      />
                      {errors.customer_name && (
                        <p className="mt-2 text-sm text-accent-600 font-medium">
                          {errors.customer_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="customer_phone" className="block font-heading text-sm font-medium text-neutral-700 mb-2">
                        Telefono *
                      </label>
                      <input
                        {...register('customer_phone')}
                        type="tel"
                        id="customer_phone"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-body"
                        placeholder="+39 123 456 7890"
                      />
                      {errors.customer_phone && (
                        <p className="mt-2 text-sm text-accent-600 font-medium">
                          {errors.customer_phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="customer_email" className="block font-heading text-sm font-medium text-neutral-700 mb-2">
                      Email *
                    </label>
                    <input
                      {...register('customer_email')}
                      type="email"
                      id="customer_email"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-body"
                      placeholder="mario.rossi@esempio.com"
                      autoComplete="email"
                    />
                    {errors.customer_email && (
                      <p className="mt-2 text-sm text-accent-600 font-medium">
                        {errors.customer_email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="space-y-6">
                  <h3 className="font-heading text-lg font-semibold text-neutral-800 border-b border-secondary-200 pb-2">
                    Dettagli della{' '}
                    <span className="text-secondary-600 font-accent text-xl">Prenotazione</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="reservation_date" className="block font-heading text-sm font-medium text-neutral-700 mb-2">
                        Data *
                      </label>
                      <input
                        {...register('reservation_date')}
                        type="date"
                        id="reservation_date"
                        min={getMinDate()}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-200 font-body"
                      />
                      {errors.reservation_date && (
                        <p className="mt-2 text-sm text-accent-600 font-medium">
                          {errors.reservation_date.message}
                        </p>
                      )}
                      {selectedDate && isThursday(selectedDate) && (
                        <p className="mt-2 text-sm text-accent-600 font-medium">
                          Il ristorante è chiuso il giovedì
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="reservation_time" className="block font-heading text-sm font-medium text-neutral-700 mb-2">
                        Orario *
                      </label>
                      <select
                        {...register('reservation_time')}
                        id="reservation_time"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-200 font-body"
                      >
                        <option value="">Seleziona orario</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {errors.reservation_time && (
                        <p className="mt-2 text-sm text-accent-600 font-medium">
                          {errors.reservation_time.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="party_size" className="block font-heading text-sm font-medium text-neutral-700 mb-2">
                        Numero Persone *
                      </label>
                      <select
                        {...register('party_size', { valueAsNumber: true })}
                        id="party_size"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-200 font-body"
                      >
                        <option value="">Seleziona</option>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'persona' : 'persone'}
                          </option>
                        ))}
                      </select>
                      {errors.party_size && (
                        <p className="mt-2 text-sm text-accent-600 font-medium">
                          {errors.party_size.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="special_requests" className="block font-heading text-sm font-medium text-neutral-700 mb-2">
                    Richieste Speciali (opzionale)
                  </label>
                  <textarea
                    {...register('special_requests')}
                    id="special_requests"
                    rows={4}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 font-body resize-none"
                    placeholder="Allergie, intolleranze, occasioni speciali, ecc..."
                  />
                </div>

                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100">
                  <p className="font-body text-sm text-neutral-700 leading-relaxed">
                    <span className="font-heading font-semibold text-primary-700">Nota:</span> La prenotazione sarà confermata entro 24 ore via email. 
                    Per prenotazioni urgenti o dell'ultimo minuto, contattaci direttamente al telefono.
                  </p>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  disabled={selectedDate && isThursday(selectedDate)}
                  variant="primary"
                  className="w-full py-4 rounded-xl font-heading font-semibold text-lg hover:shadow-lg transition-all duration-200"
                  size="lg"
                >
                  Prenota Tavolo
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}