import React, { useState } from 'react'
import { Star, Clock, Flame, Leaf, Heart, Eye, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from './Card'
import { Button } from './Button'
import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/utils'
import { MenuItem } from '../lib/supabase'

interface FeaturedDishesProps {
  dishes?: EnhancedMenuItem[]
  loading?: boolean
  error?: string | null
  className?: string
  showTitle?: boolean
  maxItems?: number
  showViewAll?: boolean
}

// Enhanced MenuItem type for display purposes
interface EnhancedMenuItem extends Omit<MenuItem, 'category'> {
  category?: string
  cooking_time?: number
  is_vegetarian?: boolean
  is_vegan?: boolean
  is_spicy?: boolean
  is_popular?: boolean
  rating?: number
}

const defaultDishes: EnhancedMenuItem[] = [
  {
    id: '1',
    name: 'Pizza Margherita DOP',
    description: 'La nostra pizza più amata, con mozzarella di bufala DOP, pomodoro San Marzano e basilico fresco, cotta nel nostro forno a legna',
    price: 12.50,
    image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&h=400&fit=crop&q=80',
    category: 'Pizze',
    cooking_time: 5,
    is_vegetarian: true,
    is_popular: true,
    rating: 4.9,
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Tagliatelle al Tartufo',
    description: 'Pasta fresca all\'uovo con tartufo nero pregiato dell\'Appennino, parmigiano reggiano 24 mesi e burro di alta qualità',
    price: 18.00,
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600&h=400&fit=crop&q=80',
    category: 'Primi Piatti',
    cooking_time: 15,
    is_popular: true,
    rating: 4.8,
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Bistecca alla Griglia',
    description: 'Tenera bistecca di manzo locale cotta alla griglia, servita con verdure di stagione e patate arrosto alle erbe',
    price: 24.00,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop&q=80',
    category: 'Secondi Piatti',
    cooking_time: 20,
    rating: 4.7,
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const getSpecialtyBadges = (dish: EnhancedMenuItem) => {
  const badges = []
  
  if (dish.is_popular) badges.push({ text: 'Popolare', color: 'bg-accent-100 text-accent-700', icon: <Star size={12} /> })
  if (dish.is_vegetarian) badges.push({ text: 'Vegetariano', color: 'bg-secondary-100 text-secondary-700', icon: <Leaf size={12} /> })
  if (dish.is_vegan) badges.push({ text: 'Vegano', color: 'bg-secondary-100 text-secondary-700', icon: <Leaf size={12} /> })
  if (dish.is_spicy) badges.push({ text: 'Piccante', color: 'bg-accent-100 text-accent-700', icon: <Flame size={12} /> })
  
  return badges
}

const DishCard: React.FC<{ dish: EnhancedMenuItem; index: number }> = ({ dish, index }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const specialtyBadges = getSpecialtyBadges(dish)

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-500 ease-out transform hover:shadow-strong hover:-translate-y-2 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={dish.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop&q=80'}
          alt={dish.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Loading placeholder */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 animate-pulse" />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Price tag */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-medium">
          <span className="font-heading font-bold text-accent-600 text-lg">
            {formatPrice(dish.price)}
          </span>
        </div>
        
        {/* Favorite button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-medium hover:bg-white transition-all duration-300 group-hover:scale-110"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            size={16} 
            className={`transition-colors duration-300 ${
              isFavorite ? 'text-accent-500 fill-current' : 'text-neutral-600'
            }`} 
          />
        </button>
        
        {/* Badges */}
        {specialtyBadges.length > 0 && (
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
            {specialtyBadges.slice(0, 2).map((badge, badgeIndex) => (
              <span
                key={badgeIndex}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.color} backdrop-blur-sm`}
              >
                {badge.icon}
                {badge.text}
              </span>
            ))}
          </div>
        )}
        
        {/* Quick view button - appears on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <Button
            size="sm"
            className="bg-white text-neutral-800 hover:bg-primary-500 hover:text-white font-heading font-semibold shadow-lg"
          >
            <Eye size={14} className="mr-1" />
            Dettagli
          </Button>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-heading text-xl font-bold text-neutral-800 group-hover:text-primary-700 transition-colors leading-tight">
              {dish.name}
            </h3>
            {dish.rating && (
              <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                <Star size={14} className="text-primary-500 fill-current" />
                <span className="font-medium text-sm text-neutral-600">{dish.rating}</span>
              </div>
            )}
          </div>
          
          {dish.category && (
            <p className="font-accent text-lg text-primary-600">
              {dish.category}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="font-body text-neutral-600 leading-relaxed line-clamp-3">
          {dish.description}
        </p>

        {/* Meta information */}
        <div className="flex items-center justify-between text-sm text-neutral-700">
          {dish.cooking_time && (
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{dish.cooking_time} min</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {dish.allergens && dish.allergens.length > 0 && (
              <span className="text-xs bg-neutral-100 px-2 py-1 rounded">
                Allergeni
              </span>
            )}
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <Link to="/prenotazioni" className="block">
            <Button
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-heading font-semibold transition-all duration-300 hover:shadow-lg group/btn"
              size="lg"
            >
              <span className="mr-2">Ordina Ora</span>
              <ArrowRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardContent>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  )
}

export const FeaturedDishes: React.FC<FeaturedDishesProps> = ({
  dishes = defaultDishes,
  loading = false,
  error = null,
  className = '',
  showTitle = true,
  maxItems = 3,
  showViewAll = true
}) => {
  const displayedDishes = dishes.filter(dish => dish.available).slice(0, maxItems)

  if (loading) {
    return (
      <section className={`py-16 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showTitle && (
            <div className="text-center mb-12">
              <div className="h-8 bg-neutral-200 rounded-lg w-96 mx-auto mb-4 animate-pulse" />
              <div className="h-6 bg-neutral-100 rounded-lg w-128 mx-auto animate-pulse" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: maxItems }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-56 bg-neutral-200 animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-4 bg-neutral-100 rounded w-1/2 animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-100 rounded animate-pulse" />
                    <div className="h-4 bg-neutral-100 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-neutral-100 rounded w-4/6 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={`py-16 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-8">
            <p className="text-accent-700 mb-4 font-medium">{error}</p>
            <Button variant="outline" className="border-accent-500 text-accent-700 hover:bg-accent-500 hover:text-white">
              Riprova
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-16 ${className}`} aria-labelledby="featured-dishes-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 
              id="featured-dishes-heading"
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-neutral-800"
            >
              I Nostri{' '}
              <span className="text-primary-600 font-accent text-4xl md:text-5xl lg:text-6xl">
                Piatti
              </span>
            </h2>
            <p className="font-body text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Scopri alcuni dei nostri piatti più amati, preparati con ingredienti 
              freschi e ricette tradizionali della cucina italiana
            </p>
          </div>
        )}
        
        {displayedDishes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedDishes.map((dish, index) => (
                <DishCard key={dish.id} dish={dish} index={index} />
              ))}
            </div>

            {showViewAll && (
              <div className="text-center mt-12">
                <Link to="/menu">
                  <Button 
                    size="lg" 
                    className="bg-primary-500 hover:bg-primary-600 text-white font-heading font-semibold px-8 py-4 text-lg rounded-xl shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Vedi Menu Completo
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-8">
              <p className="text-neutral-600 mb-4 font-medium">
                Nessun piatto disponibile al momento.
              </p>
              <Link to="/menu">
                <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                  Vedi Menu Completo
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}