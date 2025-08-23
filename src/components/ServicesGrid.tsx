import React from 'react'
import { Bike, Calendar, ChefHat, ArrowRight, Users, MapPin, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader } from './Card'
import { Button } from './Button'
import { Link } from 'react-router-dom'

interface Service {
  id: string
  title: string
  subtitle: string
  description: string
  features: string[]
  image: string
  icon: React.ReactNode
  ctaText: string
  ctaLink: string
  badge?: string
  highlighted?: boolean
  color: 'primary' | 'secondary' | 'accent'
}

interface ServicesGridProps {
  className?: string
  showTitle?: boolean
  compact?: boolean
}

const services: Service[] = [
  {
    id: 'ebike-rental',
    title: 'Noleggio E-Bike',
    subtitle: 'Esplora le Colline Reggiane',
    description: 'Scopri i meravigliosi paesaggi dell\'Appennino Reggiano con le nostre e-bike di ultima generazione. Percorsi guidati e liberi disponibili.',
    features: [
      'E-bike di alta qualità',
      'Percorsi consigliati',
      'Assistenza tecnica',
      'Casco e accessori inclusi'
    ],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&q=80',
    icon: <Bike size={24} />,
    ctaText: 'Noleggia Ora',
    ctaLink: '/contatti',
    badge: 'Popolare',
    highlighted: true,
    color: 'secondary'
  },
  {
    id: 'private-events',
    title: 'Eventi Privati',
    subtitle: 'Celebra con Noi',
    description: 'Organizza il tuo evento speciale nel nostro ristorante. Compleanni, anniversari, cene aziendali in un\'atmosfera unica e accogliente.',
    features: [
      'Menu personalizzati',
      'Decorazioni su richiesta',
      'Spazi riservati',
      'Servizio dedicato'
    ],
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop&q=80',
    icon: <Calendar size={24} />,
    ctaText: 'Richiedi Info',
    ctaLink: '/contatti',
    color: 'primary'
  },
  {
    id: 'catering',
    title: 'Catering Service',
    subtitle: 'La Nostra Cucina da Te',
    description: 'Porta la qualità e il sapore del Carrobbio direttamente al tuo evento. Catering professionale per ogni occasione.',
    features: [
      'Consegna a domicilio',
      'Menu completi',
      'Piatti caldi e freddi',
      'Servizio professionale'
    ],
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&q=80',
    icon: <ChefHat size={24} />,
    ctaText: 'Scopri di Più',
    ctaLink: '/contatti',
    badge: 'Nuovo',
    color: 'accent'
  }
]

const getColorClasses = (color: Service['color'], highlighted: boolean = false) => {
  const base = {
    primary: {
      icon: 'bg-primary-500 text-white',
      badge: 'bg-primary-100 text-primary-700 border-primary-200',
      button: 'bg-primary-500 hover:bg-primary-600 text-white',
      highlight: highlighted ? 'ring-2 ring-primary-300 shadow-glow' : '',
      hover: 'hover:shadow-strong hover:-translate-y-2'
    },
    secondary: {
      icon: 'bg-secondary-500 text-white',
      badge: 'bg-secondary-100 text-secondary-700 border-secondary-200',
      button: 'bg-secondary-500 hover:bg-secondary-600 text-white',
      highlight: highlighted ? 'ring-2 ring-secondary-300 shadow-glow' : '',
      hover: 'hover:shadow-strong hover:-translate-y-2'
    },
    accent: {
      icon: 'bg-accent-500 text-white',
      badge: 'bg-accent-100 text-accent-700 border-accent-200',
      button: 'bg-accent-500 hover:bg-accent-600 text-white',
      highlight: highlighted ? 'ring-2 ring-accent-300 shadow-glow-accent' : '',
      hover: 'hover:shadow-strong hover:-translate-y-2'
    }
  }
  
  return base[color]
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  className = '',
  showTitle = true,
  compact = false
}) => {
  return (
    <section className={`py-16 ${className}`} aria-labelledby="services-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 
              id="services-heading"
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-neutral-800"
            >
              I Nostri{' '}
              <span className="text-primary-600 font-accent text-4xl md:text-5xl lg:text-6xl">
                Servizi
              </span>
            </h2>
            <p className="font-body text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Oltre alla nostra eccellente cucina, offriamo servizi unici per rendere 
              la tua esperienza ancora più speciale
            </p>
          </div>
        )}

        <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2 lg:grid-cols-3' : 'lg:grid-cols-3'} gap-8`}>
          {services.map((service, index) => {
            const colorClasses = getColorClasses(service.color, service.highlighted)
            
            return (
              <Card
                key={service.id}
                className={`group relative overflow-hidden transition-all duration-500 ease-out transform ${colorClasses.highlight} ${colorClasses.hover} animate-fade-in-up`}
              >
                <div style={{ animationDelay: `${index * 0.2}s` }} className="contents">
                {/* Badge */}
                {service.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses.badge}`}>
                      {service.badge}
                    </span>
                  </div>
                )}

                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Icon */}
                  <div className={`absolute bottom-4 left-4 p-3 rounded-full transition-transform duration-300 group-hover:scale-110 ${colorClasses.icon}`}>
                    {service.icon}
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <h3 className="font-heading text-xl font-bold text-neutral-800 group-hover:text-primary-700 transition-colors">
                      {service.title}
                    </h3>
                    <p className="font-accent text-lg text-primary-600">
                      {service.subtitle}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="font-body text-neutral-600 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="font-heading text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                      Caratteristiche:
                    </h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center text-sm text-neutral-600"
                        >
                          <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Link to={service.ctaLink} className="block">
                      <Button
                        className={`w-full group/btn ${colorClasses.button} font-heading font-semibold transition-all duration-300 hover:shadow-lg`}
                        size="lg"
                      >
                        <span className="mr-2">{service.ctaText}</span>
                        <ArrowRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </Card>
            )
          })}
        </div>

        {/* Contact Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 border border-primary-200">
            <h3 className="font-heading text-2xl font-bold text-neutral-800 mb-4">
              Hai bisogno di informazioni?
            </h3>
            <p className="font-body text-neutral-600 mb-6 max-w-2xl mx-auto">
              I nostri servizi sono pensati per offrirti un\'esperienza completa. 
              Contattaci per personalizzare la tua esperienza al Carrobbio.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center space-x-2 text-neutral-600">
                <MapPin size={16} className="text-primary-500" />
                <span className="font-medium text-sm">Casina (RE)</span>
              </div>
              
              <div className="flex items-center space-x-2 text-neutral-600">
                <Clock size={16} className="text-primary-500" />
                <span className="font-medium text-sm">Mar-Dom: 18:00-23:00</span>
              </div>
              
              <Link to="/contatti">
                <Button 
                  variant="outline" 
                  className="border-primary-500 text-primary-700 hover:bg-primary-500 hover:text-white font-heading font-semibold"
                >
                  Contattaci
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}