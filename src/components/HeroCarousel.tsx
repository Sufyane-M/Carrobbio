import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from './Button'
import { Link } from 'react-router-dom'

interface HeroSlide {
  id: number
  image: string
  title: string
  subtitle: string
  description: string
  primaryCTA: {
    text: string
    href: string
  }
  secondaryCTA: {
    text: string
    href: string
  }
}

interface HeroCarouselProps {
  slides?: HeroSlide[]
  autoplay?: boolean
  autoplayDelay?: number
  showControls?: boolean
  showIndicators?: boolean
  className?: string
}

const defaultSlides: HeroSlide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop&q=80',
    title: 'Mangia. Bevi. Rilassati.',
    subtitle: 'Autentica Cucina Italiana',
    description: 'Il piacere della cucina italiana e del forno a legna nel cuore di Casina',
    primaryCTA: { text: 'Prenota un Tavolo', href: '/prenotazioni' },
    secondaryCTA: { text: 'Scopri il Menu', href: '/menu' }
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop&q=80',
    title: 'Pizza dal Forno a Legna',
    subtitle: 'Tradizione e Sapore',
    description: 'Le nostre pizze cotte nel tradizionale forno a legna per un sapore unico e autentico',
    primaryCTA: { text: 'Ordina Ora', href: '/prenotazioni' },
    secondaryCTA: { text: 'Vedi Pizze', href: '/menu' }
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1920&h=1080&fit=crop&q=80',
    title: 'Sapori della Tradizione',
    subtitle: 'Ingredienti Freschi e Locali',
    description: 'Ogni piatto racconta una storia di passione, tradizione e amore per la buona cucina italiana',
    primaryCTA: { text: 'Esplora Menu', href: '/menu' },
    secondaryCTA: { text: 'La Nostra Storia', href: '/storia' }
  }
]

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides = defaultSlides,
  autoplay = true,
  autoplayDelay = 5000,
  showControls = true,
  showIndicators = true,
  className = ''
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [isLoaded, setIsLoaded] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  const togglePlayback = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(nextSlide, autoplayDelay)
    return () => clearInterval(interval)
  }, [isPlaying, nextSlide, autoplayDelay])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') prevSlide()
      if (event.key === 'ArrowRight') nextSlide()
      if (event.key === ' ') {
        event.preventDefault()
        togglePlayback()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [prevSlide, nextSlide, togglePlayback])

  // Loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const current = slides[currentSlide]

  return (
    <section 
      className={`relative h-screen overflow-hidden ${className}`}
      role="banner"
      aria-label="Homepage Hero Carousel"
    >
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Subtle animated overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
          </div>
        ))}
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="container mx-auto px-4 text-center text-white">
          <div className={`transform transition-all duration-700 ease-out ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Subtitle */}
            <p className="font-accent text-xl md:text-2xl lg:text-3xl text-primary-300 mb-2 animate-fade-in">
              {current.subtitle}
            </p>

            {/* Main Title */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight tracking-tight">
              <span className="inline-block animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                {current.title}
              </span>
            </h1>

            {/* Description */}
            <p className="font-body text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto mb-8 leading-relaxed text-neutral-100 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {current.description}
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Link to={current.primaryCTA.href}>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-accent-500 hover:bg-accent-600 text-white font-heading font-semibold px-8 py-4 text-lg rounded-xl shadow-glow-accent hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  {current.primaryCTA.text}
                </Button>
              </Link>
              
              <Link to={current.secondaryCTA.href}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 font-heading font-semibold px-8 py-4 text-lg rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  {current.secondaryCTA.text}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && (
        <>
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayback}
            className="absolute bottom-6 right-6 z-20 p-3 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {showIndicators && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                index === currentSlide
                  ? 'bg-accent-500 shadow-glow scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-20">
          <div 
            className="h-full bg-accent-500 transition-all duration-75 ease-linear"
            style={{
              width: `${((Date.now() % autoplayDelay) / autoplayDelay) * 100}%`
            }}
          />
        </div>
      )}
    </section>
  )
}