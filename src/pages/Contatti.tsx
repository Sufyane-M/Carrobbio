import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/Card'
import { SEO, pageSEO } from '../components/SEO'
import { useToast } from '../components/Toast'
import { useContacts } from '../hooks/useContacts'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock 
} from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  email: z.string().email('Inserisci un indirizzo email valido'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Il messaggio deve contenere almeno 10 caratteri')
})

type ContactFormData = z.infer<typeof contactSchema>

export const Contatti: React.FC = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const { createContact, loading, error } = useContacts()
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      setSubmitSuccess(false)
      
      await createContact({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message
      })

      showToast('success', 'Messaggio inviato!', 'Ti risponderemo il prima possibile.')
      setSubmitSuccess(true)
      reset()
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (err) {
      console.error('Error submitting contact form:', err)
      showToast('error', 'Errore nell\'invio', 'Si è verificato un errore. Riprova più tardi.')
    }
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Indirizzo',
      content: 'Santuario della Beata Vergine del Carrobbio, Casina (RE)'
    },
    {
      icon: Phone,
      title: 'Telefono',
      content: '+39 335 6656335 • 0522 206510'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'pizzeriacarrobbio@gmail.com'
    },
    {
      icon: Clock,
      title: 'Orari di Apertura',
      content: 'Lun-Dom 19:00-23:00 • Giovedì chiuso'
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO {...pageSEO.contatti} />
      
      {/* Hero Header Section - Enhanced with brand styling */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-neutral-800 leading-tight">
              Contattaci{' '}
              <span className="text-primary-600 font-accent text-5xl md:text-6xl">
                Subito
              </span>
            </h1>
            <div className="w-24 h-1 bg-primary-500 rounded-full mx-auto mb-8"></div>
            <p className="font-body text-lg leading-relaxed text-neutral-700 max-w-2xl mx-auto">
              Siamo qui per rispondere alle tue domande e accogliere le tue richieste. 
              Non esitare a contattarci!
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="font-display text-2xl font-bold mb-8 text-neutral-800">
                Informazioni di{' '}
                <span className="text-secondary-600 font-accent text-3xl">Contatto</span>
              </h2>
              
              <div className="space-y-6 mb-8">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon
                  const iconColors = [
                    'text-primary-600 bg-primary-100',
                    'text-secondary-600 bg-secondary-100', 
                    'text-accent-600 bg-accent-100',
                    'text-primary-600 bg-primary-100'
                  ]
                  const cardColors = [
                    'from-white to-primary-50 border-primary-100',
                    'from-white to-secondary-50 border-secondary-100',
                    'from-white to-accent-50 border-accent-100', 
                    'from-white to-primary-50 border-primary-100'
                  ]
                  
                  return (
                    <div key={index} className={`bg-gradient-to-br ${cardColors[index]} rounded-xl p-6 border shadow-md hover:shadow-lg transition-all duration-200`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`p-3 ${iconColors[index]} rounded-xl`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-2">
                            {info.title}
                          </h3>
                          <p className="font-body text-neutral-700 leading-relaxed">
                            {info.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Google Maps Embed - Enhanced with brand styling */}
              <Card variant="secondary" className="overflow-hidden shadow-lg">
                <CardHeader className="bg-gradient-to-r from-secondary-50 to-primary-50">
                  <h3 className="font-heading text-xl font-semibold text-neutral-800">
                    Come{' '}
                    <span className="text-secondary-600 font-accent text-2xl">Raggiungerci</span>
                  </h3>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-w-16 aspect-h-12">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2836.8234567890123!2d10.4567890123456!3d44.5678901234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDM0JzA0LjQiTiAxMMKwMjcnMjQuNCJF!5e0!3m2!1sit!2sit!4v1234567890123!5m2!1sit!2sit"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mappa del Carrobbio"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form - Enhanced with brand styling */}
            <div>
              <h2 className="font-display text-2xl font-bold mb-8 text-neutral-800">
                Inviaci un{' '}
                <span className="text-accent-600 font-accent text-3xl">
                  Messaggio
                </span>
              </h2>
              
              <Card variant="accent" className="bg-gradient-to-br from-white to-accent-50 border border-accent-100 rounded-2xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-accent-50 to-primary-50">
                  <div className="w-16 h-1 bg-accent-500 rounded-full mt-2 mb-4"></div>
                  <p className="font-body text-neutral-700">
                    Compila il form sottostante e ti risponderemo il prima possibile
                  </p>
                </CardHeader>
                <CardContent className="pt-8">
                  {submitSuccess && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-200 rounded-xl">
                      <p className="text-secondary-800 font-medium flex items-center leading-relaxed">
                        <span className="text-secondary-600 mr-3">✓</span>
                        Messaggio inviato con successo! Ti risponderemo presto.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-accent-50 to-accent-100 border border-accent-200 rounded-xl">
                      <p className="text-accent-800 font-medium flex items-center leading-relaxed">
                        <span className="text-accent-600 mr-3">✗</span>
                        {error}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div>
                      <label htmlFor="name" className="block font-heading text-sm font-medium text-neutral-700 mb-3">
                        Nome *
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 font-body"
                        placeholder="Il tuo nome"
                      />
                      {errors.name && (
                        <p className="mt-3 text-sm text-accent-600 font-medium">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block font-heading text-sm font-medium text-neutral-700 mb-3">
                        Email *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 font-body"
                        placeholder="la-tua-email@esempio.com"
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="mt-3 text-sm text-accent-600 font-medium">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block font-heading text-sm font-medium text-neutral-700 mb-3">
                        Telefono (opzionale)
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        id="phone"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 font-body"
                        placeholder="+39 123 456 7890"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block font-heading text-sm font-medium text-neutral-700 mb-3">
                        Messaggio *
                      </label>
                      <textarea
                        {...register('message')}
                        id="message"
                        rows={5}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 font-body resize-none"
                        placeholder="Scrivi qui il tuo messaggio..."
                      />
                      {errors.message && (
                        <p className="mt-3 text-sm text-accent-600 font-medium">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        loading={loading}
                        variant="primary"
                        className="w-full py-4 rounded-xl font-heading font-semibold text-lg hover:shadow-lg transition-all duration-200"
                        size="lg"
                      >
                        Invia Messaggio
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}