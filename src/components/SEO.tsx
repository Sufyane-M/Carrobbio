import React from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'restaurant'
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Il Carrobbio - Ristorante Pizzeria',
  description = 'Il Carrobbio è un ristorante pizzeria situato nel cuore di Casina (RE). Scopri la nostra cucina italiana autentica, le nostre pizze cotte nel forno a legna e prenota il tuo tavolo online.',
  keywords = 'ristorante, pizzeria, Casina, Reggio Emilia, cucina italiana, forno a legna, prenotazioni online, Il Carrobbio',
  image = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80',
  url = 'https://ilcarrobbio.com',
  type = 'restaurant'
}) => {
  const fullTitle = title.includes('Il Carrobbio') ? title : `${title} | Il Carrobbio`
  const canonicalUrl = `${url}${window.location.pathname}`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Il Carrobbio" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Il Carrobbio" />
      <meta property="og:locale" content="it_IT" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Restaurant Specific Meta Tags */}
      {type === 'restaurant' && (
        <>
          <meta property="restaurant:contact_info:street_address" content="Santuario della Beata Vergine del Carrobbio" />
          <meta property="restaurant:contact_info:locality" content="Casina" />
          <meta property="restaurant:contact_info:region" content="Reggio Emilia" />
          <meta property="restaurant:contact_info:postal_code" content="42034" />
          <meta property="restaurant:contact_info:country_name" content="Italia" />
          <meta property="restaurant:contact_info:phone_number" content="+39 335 6656335" />
          <meta property="restaurant:contact_info:email" content="pizzeriacarrobbio@gmail.com" />
        </>
      )}

      {/* Structured Data for Restaurant */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "name": "Il Carrobbio",
          "description": description,
          "image": image,
          "url": canonicalUrl,
          "telephone": "+39 335 6656335",
          "email": "pizzeriacarrobbio@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Santuario della Beata Vergine del Carrobbio",
            "addressLocality": "Casina",
            "addressRegion": "RE",
            "postalCode": "42034",
            "addressCountry": "IT"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "44.4056",
            "longitude": "10.4119"
          },
          "openingHours": [
            "Mo 19:00-23:00",
            "Tu 19:00-23:00",
            "We 19:00-23:00",
            "Fr 19:00-23:00",
            "Sa 19:00-23:00",
            "Su 19:00-23:00"
          ],
          "servesCuisine": "Italian",
          "priceRange": "€€",
          "acceptsReservations": true,
          "hasMenu": `${url}/menu`,
          "sameAs": [
            "https://www.facebook.com/ilcarrobbio",
            "https://www.instagram.com/ilcarrobbio"
          ]
        })}
      </script>
    </Helmet>
  )
}

// Predefined SEO configurations for different pages
export const pageSEO = {
  home: {
    title: 'Il Carrobbio - Ristorante Pizzeria a Casina (RE)',
    description: 'Benvenuti al Carrobbio! Ristorante pizzeria nel cuore di Casina (RE). Cucina italiana autentica, pizze cotte nel forno a legna. Prenota online il tuo tavolo.',
    keywords: 'ristorante Casina, pizzeria Reggio Emilia, forno a legna, cucina italiana, prenotazioni online'
  },
  menu: {
    title: 'Menu - Il Carrobbio',
    description: 'Scopri il nostro menu: antipasti, pizze cotte nel forno a legna, pasta fresca, piatti di pesce e dolci della casa. Ingredienti freschi e ricette tradizionali.',
    keywords: 'menu ristorante, pizza forno a legna, pasta fresca, antipasti, dolci, cucina italiana'
  },
  storia: {
    title: 'La Nostra Storia - Il Carrobbio',
    description: 'Scopri la storia del Carrobbio: dalle origini come osteria di paese alla moderna pizzeria. Una tradizione familiare che continua da generazioni.',
    keywords: 'storia ristorante, tradizione familiare, osteria, Casina storia, famiglia'
  },
  contatti: {
    title: 'Contatti - Il Carrobbio',
    description: 'Contatta Il Carrobbio: telefono +39 335 6656335, email pizzeriacarrobbio@gmail.com. Siamo in Santuario della Beata Vergine del Carrobbio, Casina (RE).',
    keywords: 'contatti ristorante, telefono pizzeria, indirizzo Casina, come raggiungerci'
  },
  prenotazioni: {
    title: 'Prenotazioni Online - Il Carrobbio',
    description: 'Prenota online il tuo tavolo al Carrobbio. Sistema di prenotazione semplice e veloce. Aperto tutti i giorni 19:00-23:00 tranne il giovedì.',
    keywords: 'prenotazioni online, prenota tavolo, ristorante Casina, prenotazione veloce'
  },
  admin: {
    title: 'Area Admin - Il Carrobbio',
    description: 'Area riservata per la gestione del ristorante Il Carrobbio.',
    keywords: 'admin, gestione ristorante, pannello controllo'
  }
}