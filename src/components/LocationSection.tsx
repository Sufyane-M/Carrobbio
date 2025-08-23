import React, { useState } from 'react'
import { MapPin, Navigation, Phone, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader } from './Card'
import { Button } from './Button'

interface LocationInfo {
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  phone: string
  website?: string
  description: string
}



interface LocationSectionProps {
  className?: string
  showMap?: boolean
  compact?: boolean
}

const locationInfo: LocationInfo = {
  name: 'Il Carrobbio',
  address: 'Santuario della Beata Vergine del Carrobbio, 42034 Casina (RE)',
  coordinates: {
    lat: 44.5678901234567,
    lng: 10.4567890123456
  },
  phone: '+39 0522 618 XXX',
  description: 'Situato nel suggestivo Santuario della Beata Vergine del Carrobbio, il nostro ristorante offre un\'esperienza unica immersa nella natura e nella storia dell\'Appennino Reggiano.'
}



const getMapEmbedUrl = (coordinates: { lat: number; lng: number }) => {
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2836.8234567890123!2d${coordinates.lng}!3d${coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${coordinates.lat}N%20${coordinates.lng}E!5e0!3m2!1sit!2sit!4v1234567890123!5m2!1sit!2sit`
}

const getDirectionsUrl = (coordinates: { lat: number; lng: number }) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}&travelmode=driving`
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  className = '',
  showMap = true,
  compact = false
}) => {
  const [mapLoaded, setMapLoaded] = useState(false)

  return (
    <section 
      className={`py-16 ${className}`} 
      aria-labelledby="location-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 
            id="location-heading"
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-neutral-800"
          >
            Dove{' '}
            <span className="text-primary-600 font-accent text-4xl md:text-5xl lg:text-6xl">
              Siamo
            </span>
          </h2>
          <p className="font-body text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            {locationInfo.description}
          </p>
        </div>

        <div className={`grid grid-cols-1 ${compact ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8`}>
          {/* Location Info Card */}
          <div className={compact ? 'lg:col-span-1' : 'lg:col-span-1'}>
            <Card className="h-full transition-all duration-300 hover:shadow-strong">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-primary-500 text-white rounded-lg">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-neutral-800">
                      {locationInfo.name}
                    </h3>
                    <p className="font-body text-neutral-600">
                      Ristorante & Pizzeria
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Address */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin size={18} className="text-primary-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-neutral-800">Indirizzo</p>
                      <p className="font-body text-neutral-600 leading-relaxed">
                        {locationInfo.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone size={18} className="text-primary-500" />
                    <div>
                      <p className="font-medium text-neutral-800">Telefono</p>
                      <a 
                        href={`tel:${locationInfo.phone}`}
                        className="font-body text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {locationInfo.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock size={18} className="text-primary-500" />
                    <div>
                      <p className="font-medium text-neutral-800">Orari</p>
                      <p className="font-body text-neutral-600">
                        Mar-Dom: 18:00-23:00
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-neutral-200">
                  <a
                    href={getDirectionsUrl(locationInfo.coordinates)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button 
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white font-heading font-semibold"
                      size="lg"
                    >
                      <Navigation size={18} className="mr-2" />
                      Ottieni Indicazioni
                      <ExternalLink size={14} className="ml-2" />
                    </Button>
                  </a>

                  <a
                    href={`tel:${locationInfo.phone}`}
                    className="block"
                  >
                    <Button 
                      variant="outline"
                      className="w-full border-primary-500 text-primary-700 hover:bg-primary-500 hover:text-white font-heading font-semibold"
                      size="lg"
                    >
                      <Phone size={18} className="mr-2" />
                      Chiama Ora
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          {showMap && (
            <div className={compact ? 'lg:col-span-1' : 'lg:col-span-2'}>
              <Card className="h-full overflow-hidden">
                <div className="relative h-full min-h-[600px]">
                  {!mapLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 animate-pulse flex items-center justify-center">
                      <div className="text-center">
                        <MapPin size={48} className="text-primary-600 mx-auto mb-2" />
                        <p className="text-primary-600 font-medium">Caricamento mappa...</p>
                      </div>
                    </div>
                  )}
                  
                  <iframe
                    src={getMapEmbedUrl(locationInfo.coordinates)}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '600px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mappa del Carrobbio - Dove Siamo"
                    onLoad={() => setMapLoaded(true)}
                    className={`transition-opacity duration-500 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                  
                  {/* Map overlay with address */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-medium max-w-xs">
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-primary-500 flex-shrink-0" />
                      <p className="font-medium text-sm text-neutral-800">
                        {locationInfo.name}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      Casina (RE), Emilia-Romagna
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>




      </div>
    </section>
  )
}