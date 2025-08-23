import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '../components/Card'
import { Button } from '../components/Button'
import { SEO, pageSEO } from '../components/SEO'
import { useMenu } from '../hooks/useMenu'
import { formatPrice } from '../lib/utils'
import { MenuItem } from '../lib/supabase'

type Category = 'antipasti' | 'pizza' | 'pasta' | 'pesce' | 'dolci' | 'bevande'

const categoryNames: Record<Category, string> = {
  antipasti: 'Antipasti',
  pizza: 'Pizza',
  pasta: 'Pasta',
  pesce: 'Pesce',
  dolci: 'Dolci',
  bevande: 'Bevande'
}

export const Menu: React.FC = () => {
  const { menuItems, loading, error, fetchMenuItems } = useMenu()
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

  const categories: (Category | 'all')[] = ['all', 'antipasti', 'pizza', 'pasta', 'pesce', 'dolci', 'bevande']

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-500 mx-auto mb-4"></div>
          <p className="font-body text-neutral-600">Caricamento menu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="text-center">
          <div className="text-accent-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-semibold text-neutral-800 mb-2">Errore nel caricamento</h2>
          <p className="font-body text-neutral-600 mb-4">{error}</p>
          <Button onClick={fetchMenuItems}>Riprova</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO {...pageSEO.menu} />
      
      {/* Hero Header Section - Enhanced with brand styling */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-neutral-800 leading-tight">
              Il Nostro{' '}
              <span className="text-primary-600 font-accent text-5xl md:text-6xl">
                Menu
              </span>
            </h1>
            <div className="w-24 h-1 bg-primary-500 rounded-full mx-auto mb-8"></div>
            <p className="font-body text-lg leading-relaxed text-neutral-700 max-w-2xl mx-auto">
              Scopri i sapori autentici della cucina italiana, preparati con ingredienti 
              freschi e ricette tradizionali
            </p>
          </div>

          {/* Category Filter - Enhanced with brand styling */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="px-6 py-3 rounded-xl font-heading font-semibold transition-all duration-200 hover:shadow-md hover:scale-105 border-2 border-primary-200"
              >
                {category === 'all' ? 'Tutti' : categoryNames[category as Category]}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-neutral-600 text-lg">
                {selectedCategory === 'all' ? 'Nessun piatto disponibile al momento.' : 'Nessun piatto disponibile in questa categoria.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  hover 
                  variant="primary"
                  className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102 border border-primary-100"
                >
                  {item.image_url && (
                    <div className="relative">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent" />
                    </div>
                  )}
                  <CardHeader className="bg-gradient-to-br from-neutral-50 to-primary-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-heading text-xl font-semibold text-neutral-800">
                        {item.name}
                      </h3>
                      <span className="font-display text-lg font-bold text-primary-600 ml-2">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full mb-2 font-heading">
                      {categoryNames[item.category]}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="font-body text-neutral-700 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section - Enhanced with brand styling */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-gradient-to-br from-white to-primary-50 rounded-2xl p-12 border border-primary-100 shadow-lg">
            <h2 className="font-display text-3xl font-bold mb-4 text-neutral-800">
              Pronto a gustare i nostri{' '}
              <span className="text-primary-600 font-accent text-4xl">piatti</span>?
            </h2>
            <div className="w-16 h-1 bg-primary-500 rounded-full mx-auto mb-6"></div>
            <p className="font-body text-lg text-neutral-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Prenota un tavolo e vieni a trovarci per un'esperienza culinaria indimenticabile nel cuore dell'Emilia-Romagna
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-4 rounded-xl font-heading font-semibold">
                <a href="/prenotazioni" className="flex items-center">
                  Prenota Ora
                </a>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 rounded-xl font-heading font-semibold border-2 border-primary-300">
                <a href="/contatti" className="flex items-center">
                  Contattaci
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}