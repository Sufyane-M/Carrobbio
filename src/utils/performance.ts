import { useEffect, useRef, useState } from 'react'

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      const isElementIntersecting = entry.isIntersecting
      setIsIntersecting(isElementIntersecting)
      
      if (isElementIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [hasIntersected, options])

  return { ref, isIntersecting, hasIntersected }
}

// Lazy image loading hook
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const { ref, hasIntersected } = useIntersectionObserver()

  useEffect(() => {
    if (!hasIntersected) return

    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
    }
    img.onerror = () => {
      setError(true)
      setIsLoaded(false)
    }
    img.src = src
  }, [hasIntersected, src])

  return { ref, imageSrc, isLoaded, error }
}

// Performance metrics utility
export const trackPerformance = () => {
  if (typeof window === 'undefined') return

  // Core Web Vitals tracking
  const trackCLS = () => {
    let clsValue = 0
    let clsEntries: PerformanceEntry[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value
          clsEntries.push(entry)
        }
      }
    })

    try {
      observer.observe({ type: 'layout-shift', buffered: true })
    } catch (e) {
      // Layout shift not supported
    }

    return () => {
      observer.disconnect()
      return { clsValue, clsEntries }
    }
  }

  const trackLCP = () => {
    let lcpValue = 0

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      lcpValue = lastEntry.startTime
    })

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch (e) {
      // LCP not supported
    }

    return () => {
      observer.disconnect()
      return lcpValue
    }
  }

  const trackFID = () => {
    let fidValue = 0

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        fidValue = (entry as any).processingStart - entry.startTime
      }
    })

    try {
      observer.observe({ type: 'first-input', buffered: true })
    } catch (e) {
      // FID not supported
    }

    return () => {
      observer.disconnect()
      return fidValue
    }
  }

  return {
    trackCLS,
    trackLCP,
    trackFID
  }
}

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// Preload critical resources
export const preloadResource = (href: string, as: string, type?: string) => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  document.head.appendChild(link)
}

// Preload images
export const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    const img = new Image()
    img.src = url
  })
}

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    }
  }
  return null
}

// FPS monitoring
export const createFPSMonitor = (callback: (fps: number) => void) => {
  let frames = 0
  let lastTime = performance.now()
  let running = true

  const countFrames = () => {
    if (!running) return

    frames++
    const currentTime = performance.now()

    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (currentTime - lastTime))
      callback(fps)
      frames = 0
      lastTime = currentTime
    }

    requestAnimationFrame(countFrames)
  }

  requestAnimationFrame(countFrames)

  return () => {
    running = false
  }
}

// Critical resource loading priorities
export const loadCriticalResources = () => {
  // Preload hero images
  preloadImages([
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1920&h=1080&fit=crop&q=80'
  ])

  // Preload critical fonts (if not already loaded via Google Fonts)
  preloadResource('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap', 'style')
}

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered: ', registration)
      return registration
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError)
    }
  }
}

// Image optimization utilities
export const getOptimizedImageUrl = (
  baseUrl: string,
  width: number,
  height?: number,
  quality: number = 80,
  format: 'webp' | 'jpg' | 'png' = 'webp'
) => {
  // For Unsplash images
  if (baseUrl.includes('unsplash.com')) {
    const params = new URLSearchParams()
    params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    params.set('fit', 'crop')
    params.set('q', quality.toString())
    if (format === 'webp') params.set('fm', 'webp')
    
    return `${baseUrl}&${params.toString()}`
  }
  
  // For other image services, return original URL
  return baseUrl
}

// Responsive image sizes
export const getResponsiveImageSizes = () => ({
  hero: {
    mobile: { width: 640, height: 640 },
    tablet: { width: 1024, height: 576 },
    desktop: { width: 1920, height: 1080 }
  },
  card: {
    mobile: { width: 320, height: 240 },
    tablet: { width: 400, height: 300 },
    desktop: { width: 600, height: 400 }
  },
  thumbnail: {
    mobile: { width: 150, height: 150 },
    tablet: { width: 200, height: 200 },
    desktop: { width: 300, height: 300 }
  }
})