import React from 'react'
import { Calendar, Phone, MessageCircle, Clock, MapPin, Mail, ArrowRight } from 'lucide-react'
import { Button } from './Button'
import { Link } from 'react-router-dom'

interface CTAAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  button: {
    text: string
    href: string
    variant: 'primary' | 'secondary' | 'accent'
  }
  urgent?: boolean
}

interface CTAFooterProps {
  className?: string
  backgroundImage?: string
  showHours?: boolean
  compact?: boolean
}

const ctaActions: CTAAction[] = [
  {
    id: 'reservation',
    title: 'Prenota un Tavolo',
    description: 'Assicurati un posto nel nostro ristorante. Prenotazione veloce e semplice online.',
    icon: <Calendar size={28} />,
    button: {
      text: 'Prenota Ora',
      href: '/prenotazioni',
      variant: 'accent'
    },
    urgent: true
  },
  {
    id: 'contact',
    title: 'Contattaci',
    description: 'Hai domande sui nostri servizi? Il nostro staff è pronto ad aiutarti.',
    icon: <MessageCircle size={28} />,
    button: {
      text: 'Scrivici',
      href: '/contatti',
      variant: 'primary'
    }
  },
  {
    id: 'phone',
    title: 'Chiamaci Ora',
    description: 'Per prenotazioni urgenti o informazioni immediate, chiamaci direttamente.',
    icon: <Phone size={28} />,
    button: {
      text: 'Chiama',
      href: 'tel:+390522618XXX',
      variant: 'secondary'
    }
  }
]

const quickInfo = {
  phone: '+39 0522 618 XXX',
  email: 'info@carrobbio.it',
  address: 'Santuario del Carrobbio, Casina (RE)',
  hours: {
    closed: 'Lunedì',
    open: 'Mar-Dom: 18:00-23:00'
  }
}

const getVariantClasses = (variant: string, urgent: boolean = false) => {
  const variants = {
    primary: urgent 
      ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-glow ring-2 ring-primary-300' 
      : 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: urgent 
      ? 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-glow ring-2 ring-secondary-300' 
      : 'bg-secondary-500 hover:bg-secondary-600 text-white',
    accent: urgent 
      ? 'bg-accent-600 hover:bg-accent-700 text-white shadow-glow-accent ring-2 ring-accent-300 animate-pulse-soft' 
      : 'bg-accent-500 hover:bg-accent-600 text-white'
  }
  
  return variants[variant as keyof typeof variants] || variants.primary
}

export const CTAFooter: React.FC<CTAFooterProps> = ({
  className = '',
  backgroundImage = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=600&fit=crop&q=80',
  showHours = true,
  compact = false
}) => {
  return (
    <section 
      className={`relative py-20 overflow-hidden ${className}`}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
      aria-labelledby="cta-heading"
    >
      {/* Decorative overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            id="cta-heading"
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Pronto per{' '}
            <span className="text-primary-600 font-accent text-5xl md:text-6xl lg:text-7xl">
              Gustare?
            </span>
          </h2>
          <p className="font-body text-xl md:text-2xl text-neutral-200 max-w-4xl mx-auto leading-relaxed">
            Non aspettare oltre. Prenota il tuo tavolo e vieni a scoprire 
            l\'autentica cucina italiana del Carrobbio.
          </p>
        </div>

        {/* Main CTA Actions */}
        <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2 lg:grid-cols-3' : 'lg:grid-cols-3'} gap-8 mb-16`}>
          {ctaActions.map((action, index) => (
            <div
              key={action.id}
              className={`bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 transform hover:scale-105 animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className={`p-4 rounded-full ${
                  action.urgent 
                    ? 'bg-accent-500 text-white shadow-glow-accent' 
                    : 'bg-white/20 text-white'
                } transition-all duration-300`}>
                  {action.icon}
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-4">
                <h3 className="font-heading text-2xl font-bold text-white">
                  {action.title}
                </h3>
                <p className="font-body text-neutral-200 leading-relaxed">
                  {action.description}
                </p>

                {/* CTA Button */}
                <div className="pt-4">
                  <Link to={action.button.href} className="block">
                    <Button
                      size="lg"
                      className={`w-full font-heading font-semibold px-6 py-4 text-lg rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${getVariantClasses(action.button.variant, action.urgent)}`}
                    >
                      <span className="mr-2">{action.button.text}</span>
                      <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Urgent indicator */}
              {action.urgent && (
                <div className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce-gentle">
                  Popolare!
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Contact Info */}
        <div className="border-t border-white/20 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
            {/* Phone */}
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Phone size={20} className="text-primary-600" />
                <h4 className="font-heading font-semibold text-white">Telefono</h4>
              </div>
              <a 
                href={`tel:${quickInfo.phone}`}
                className="font-body text-neutral-200 hover:text-white transition-colors block"
              >
                {quickInfo.phone}
              </a>
            </div>

            {/* Email */}
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Mail size={20} className="text-primary-600" />
                <h4 className="font-heading font-semibold text-white">Email</h4>
              </div>
              <a 
                href={`mailto:${quickInfo.email}`}
                className="font-body text-neutral-200 hover:text-white transition-colors block"
              >
                {quickInfo.email}
              </a>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <MapPin size={20} className="text-primary-600" />
                <h4 className="font-heading font-semibold text-white">Indirizzo</h4>
              </div>
              <p className="font-body text-neutral-200">
                {quickInfo.address}
              </p>
            </div>

            {/* Hours */}
            {showHours && (
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Clock size={20} className="text-primary-600" />
                  <h4 className="font-heading font-semibold text-white">Orari</h4>
                </div>
                <div className="font-body text-neutral-200 space-y-1">
                  <p className="text-sm">{quickInfo.hours.closed}: Chiuso</p>
                  <p className="text-sm">{quickInfo.hours.open}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-16 pt-8 border-t border-white/20">
          <p className="font-accent text-2xl md:text-3xl text-primary-600 mb-2">
            Ti aspettiamo al Carrobbio!
          </p>
          <p className="font-body text-gray-700">
            Un\'esperienza culinaria che non dimenticherai mai
          </p>
        </div>
      </div>

      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-500/20 rounded-full blur-xl animate-bounce-gentle" />
        <div className="absolute top-1/3 -right-8 w-32 h-32 bg-accent-500/20 rounded-full blur-xl animate-pulse-soft" />
        <div className="absolute -bottom-6 left-1/3 w-20 h-20 bg-secondary-500/20 rounded-full blur-xl animate-bounce-gentle" />
      </div>
    </section>
  )
}