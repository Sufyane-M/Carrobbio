import React from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-100 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Restaurant Info */}
          <div>
            <h3 className="text-2xl font-bold text-primary-600 mb-4 font-display">Il Carrobbio</h3>
            <p className="text-gray-800 mb-4 leading-relaxed font-medium">
              Il piacere della cucina italiana e del forno a legna nel cuore di Casina.
            </p>
            <p className="text-sm text-gray-600 font-medium">
              © 2024 Il Carrobbio. Tutti i diritti riservati.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 font-heading">Contatti</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 text-sm font-medium">
                    Santuario della Beata Vergine del Carrobbio
                  </p>
                  <p className="text-gray-700 text-sm font-medium">Casina (RE)</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <div className="text-gray-700 text-sm font-medium">
                  <p>+39 335 6656335</p>
                  <p>0522 206510</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <p className="text-gray-700 text-sm font-medium">pizzeriacarrobbio@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 font-heading">Orari di Apertura</h4>
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <div className="text-gray-700 text-sm space-y-1 font-medium">
                <p>Lunedì - Mercoledì: 19:00 - 23:00</p>
                <p className="text-accent-600 font-medium">Giovedì: Chiuso</p>
                <p>Venerdì - Domenica: 19:00 - 23:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-neutral-300 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a 
                href="/admin" 
                className="text-gray-600 hover:text-primary-700 text-sm transition-colors duration-200 font-semibold"
              >
                Area Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}