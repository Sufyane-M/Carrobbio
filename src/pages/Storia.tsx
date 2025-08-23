import React from 'react'
import { Card, CardContent, CardHeader } from '../components/Card'
import { SEO, pageSEO } from '../components/SEO'

export const Storia: React.FC = () => {
  const timelineEvents = [
    {
      year: '1985',
      title: 'Le Origini',
      description: 'Nasce Il Carrobbio nel suggestivo Santuario della Beata Vergine del Carrobbio, con la visione di portare i sapori autentici della tradizione italiana in un luogo di pace e spiritualità.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
    },
    {
      year: '1992',
      title: 'Il Forno a Legna',
      description: 'Viene installato il nostro caratteristico forno a legna, che ancora oggi è il cuore pulsante della nostra cucina, donando ai nostri piatti quel sapore unico e inconfondibile.',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop'
    },
    {
      year: '2005',
      title: 'Rinnovamento',
      description: 'Il ristorante viene completamente rinnovato mantenendo il fascino rustico originale ma aggiungendo comfort moderni per offrire un\'esperienza ancora più piacevole ai nostri ospiti.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
    },
    {
      year: '2020',
      title: 'Tradizione e Innovazione',
      description: 'Pur mantenendo salda la tradizione culinaria, Il Carrobbio si adatta ai tempi moderni introducendo nuove tecnologie e servizi per continuare a servire la comunità con passione.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop'
    }
  ]

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
      alt: 'La sala principale del ristorante'
    },
    {
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      alt: 'Il nostro forno a legna'
    },
    {
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
      alt: 'L\'atmosfera accogliente'
    },
    {
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
      alt: 'Il team del Carrobbio'
    },
    {
      url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop',
      alt: 'La preparazione delle pizze'
    },
    {
      url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&h=400&fit=crop',
      alt: 'I nostri ingredienti freschi'
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO {...pageSEO.storia} />
      
      {/* Hero Header Section - Enhanced with brand styling */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-neutral-800 leading-tight">
              La Nostra{' '}
              <span className="text-primary-600 font-accent text-5xl md:text-6xl">
                Storia
              </span>
            </h1>
            <div className="w-24 h-1 bg-primary-500 rounded-full mx-auto mb-8"></div>
            <p className="font-body text-lg leading-relaxed text-neutral-700 max-w-3xl mx-auto">
              Un viaggio attraverso i decenni che hanno fatto del Carrobbio un punto 
              di riferimento per la cucina italiana autentica nel cuore dell'Emilia-Romagna
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-neutral-800">
            La Nostra{' '}
            <span className="text-secondary-600 font-accent text-4xl">Timeline</span>
          </h2>
          <div className="space-y-16">
            {timelineEvents.map((event, index) => (
              <div key={event.year} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="lg:w-1/2">
                  <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-64 lg:h-80 object-cover transform hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent" />
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <div className="text-center lg:text-left space-y-6">
                    <span className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-display font-bold text-xl rounded-2xl shadow-md">
                      {event.year}
                    </span>
                    <h3 className="font-heading text-2xl lg:text-3xl font-bold text-neutral-800">
                      {event.title}
                    </h3>
                    <p className="font-body text-neutral-700 text-lg leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Quote Section */}
      <section className="py-16 bg-gradient-to-br from-accent-50 to-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-white to-accent-50 rounded-2xl p-12 border border-accent-100 shadow-lg">
            <div className="text-center">
              <div className="w-20 h-1 bg-accent-500 rounded-full mx-auto mb-8"></div>
              <blockquote className="font-body text-xl md:text-2xl font-medium text-neutral-800 mb-8 italic leading-relaxed">
                "Il Carrobbio non è solo un ristorante, è il luogo dove le famiglie si riuniscono, 
                dove gli amici condividono momenti speciali e dove ogni piatto racconta una storia 
                di passione e tradizione. La nostra missione è far sentire ogni ospite come a casa propria."
              </blockquote>
              <cite className="font-heading text-lg text-accent-700 font-semibold">
                — Mario Rossi, Fondatore del{' '}
                <span className="font-accent text-xl text-accent-600">Carrobbio</span>
              </cite>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-neutral-800">
            La Nostra{' '}
            <span className="text-primary-600 font-accent text-4xl">Galleria</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((image, index) => (
              <Card key={index} variant="primary" hover className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-64 object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent" />
                </div>
                <CardContent className="bg-gradient-to-r from-neutral-50 to-primary-50">
                  <p className="font-body text-sm text-neutral-700 text-center py-3 leading-relaxed">
                    {image.alt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-neutral-800">
            I Nostri{' '}
            <span className="text-secondary-600 font-accent text-4xl">Valori</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="primary" className="text-center p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-primary-600">🏛️</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-neutral-800">
                  <span className="text-primary-600 font-accent text-2xl">Tradizione</span>
                </h3>
              </CardHeader>
              <CardContent>
                <p className="font-body text-neutral-700 leading-relaxed">
                  Manteniamo vive le ricette e le tecniche culinarie tramandate 
                  di generazione in generazione.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="secondary" className="text-center p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-secondary-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-secondary-600">⭐</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-neutral-800">
                  <span className="text-secondary-600 font-accent text-2xl">Qualità</span>
                </h3>
              </CardHeader>
              <CardContent>
                <p className="font-body text-neutral-700 leading-relaxed">
                  Utilizziamo solo ingredienti freschi e di prima qualità, 
                  selezionati con cura dai migliori fornitori locali.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="accent" className="text-center p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-accent-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-accent-600">❤️</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-neutral-800">
                  <span className="text-accent-600 font-accent text-2xl">Ospitalità</span>
                </h3>
              </CardHeader>
              <CardContent>
                <p className="font-body text-neutral-700 leading-relaxed">
                  Ogni ospite è benvenuto nella nostra famiglia e trattiamo 
                  tutti con il calore dell'ospitalità italiana.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}