import React, { useEffect, Suspense, lazy } from 'react'
import { SEO, pageSEO } from '../components/SEO'
import { useMenu } from '../hooks/useMenu'
import { HeroCarousel } from '../components/HeroCarousel'
import { loadCriticalResources } from '../utils/performance'

// Lazy load non-critical components
const FeaturedDishes = lazy(() => import('../components/FeaturedDishes').then(module => ({ default: module.FeaturedDishes })))
const ServicesGrid = lazy(() => import('../components/ServicesGrid').then(module => ({ default: module.ServicesGrid })))
const LocationSection = lazy(() => import('../components/LocationSection').then(module => ({ default: module.LocationSection })))
const HoursWidget = lazy(() => import('../components/HoursWidget').then(module => ({ default: module.HoursWidget })))
const CTAFooter = lazy(() => import('../components/CTAFooter').then(module => ({ default: module.CTAFooter })))

// Loading fallback component
const SectionLoader = () => (
  <div className="py-20 flex justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
  </div>
)

export const Home: React.FC = () => {
  const { menuItems, loading, error, fetchMenuItems } = useMenu()

  useEffect(() => {
    fetchMenuItems()
    // Preload critical resources
    loadCriticalResources()
  }, [])

  // Get featured dishes (first 3 available items) and convert to enhanced type
  const featuredDishes = menuItems
    .filter(item => item.available)
    .slice(0, 3)
    .map(dish => ({
      ...dish,
      category: dish.category === 'pizza' ? 'Pizze' : 
                dish.category === 'pasta' ? 'Primi Piatti' :
                dish.category === 'pesce' ? 'Secondi Piatti' :
                dish.category === 'antipasti' ? 'Antipasti' :
                dish.category === 'dolci' ? 'Dolci' :
                dish.category === 'bevande' ? 'Bevande' : 'Specialità',
      cooking_time: 15, // Default cooking time
      is_vegetarian: dish.category === 'pizza' || dish.category === 'pasta',
      is_popular: Math.random() > 0.5, // Random for demo
      rating: 4.5 + Math.random() * 0.5 // Random rating between 4.5-5.0
    }))

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO {...pageSEO.home} />
      
      {/* Enhanced Hero Carousel Section */}
      <HeroCarousel 
        autoplay={true}
        autoplayDelay={6000}
        showControls={true}
        showIndicators={true}
      />

      {/* About Section - Enhanced with better typography and layout */}
      <section 
        className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50" 
        aria-labelledby="about-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 
                  id="about-heading"
                  className="font-display text-4xl md:text-5xl font-bold mb-6 text-neutral-800 leading-tight"
                >
                  Chi{' '}
                  <span className="text-primary-600 font-accent text-5xl md:text-6xl">
                    Siamo
                  </span>
                </h2>
                <div className="w-24 h-1 bg-primary-500 rounded-full mb-8"></div>
              </div>
              
              <div className="space-y-6 font-body text-lg leading-relaxed text-neutral-700">
                <p className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  Il Carrobbio è più di un semplice ristorante: è un{' '}
                  <span className="font-semibold text-primary-700">luogo dove la tradizione culinaria italiana</span>{' '}
                  si fonde con l'ospitalità genuina dell'Emilia-Romagna.
                </p>
                <p className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Situato nel suggestivo{' '}
                  <span className="font-semibold text-primary-700">Santuario della Beata Vergine del Carrobbio</span>{' '}
                  a Casina, il nostro ristorante offre un'esperienza gastronomica autentica, preparata 
                  con ingredienti freschi e locali nel nostro{' '}
                  <span className="font-semibold text-accent-600">forno a legna tradizionale</span>.
                </p>
                <p className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  Ogni piatto racconta una storia di{' '}
                  <span className="font-accent text-2xl text-primary-600">passione, tradizione e amore</span>{' '}
                  per la buona cucina italiana.
                </p>
              </div>
            </div>
            
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative overflow-hidden rounded-2xl shadow-strong">
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=500&fit=crop&q=80"
                  alt="Il nostro ristorante - atmosfera accogliente e autentica cucina italiana"
                  className="w-full h-96 lg:h-[500px] object-cover transform hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                {/* Decorative overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent" />
                
                {/* Floating badge */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <p className="font-accent text-xl text-primary-600 mb-1">Dal 1985</p>
                  <p className="font-heading text-sm font-semibold text-neutral-800">Tradizione Familiare</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes Section */}
      <Suspense fallback={<SectionLoader />}>
        <section className="py-20 bg-white">
          <FeaturedDishes 
            dishes={featuredDishes as any}
            loading={loading}
            error={error}
            showTitle={true}
            maxItems={3}
            showViewAll={true}
          />
        </section>
      </Suspense>

      {/* Services Section */}
      <Suspense fallback={<SectionLoader />}>
        <section className="py-20 bg-gradient-to-br from-secondary-50 to-primary-50">
          <ServicesGrid 
            showTitle={true}
            compact={false}
          />
        </section>
      </Suspense>

      {/* Location and Hours Section */}
      <Suspense fallback={<SectionLoader />}>
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {/* Location Section - Full width */}
              <div>
                <LocationSection 
                  showMap={true}
                  compact={false}
                />
              </div>
              
              {/* Hours Widget - Full width */}
              <div>
                <HoursWidget 
                  showContactInfo={true}
                  collapsible={false}
                  theme="warm"
                  className=""
                />
              </div>
            </div>
          </div>
        </section>
      </Suspense>

      {/* Call-to-Action Footer */}
      <Suspense fallback={<SectionLoader />}>
        <CTAFooter 
          showHours={true}
          compact={false}
          backgroundImage="https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1920&h=600&fit=crop&q=80"
        />
      </Suspense>
    </div>
  )
}