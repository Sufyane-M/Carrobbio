import React, { useState, useEffect } from 'react'
import { Clock, Phone, MapPin } from 'lucide-react'

interface OpeningHours {
  day: string
  hours: string
  isOpen: boolean
  isToday: boolean
}

interface HoursWidgetProps {
  className?: string
  showContactInfo?: boolean
}

// Orari del ristorante
const getOpeningHours = (): OpeningHours[] => {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Domenica, 1 = Lunedì, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  const scheduleData = [
    { day: 'Lunedì', hours: 'Chiuso', openRanges: [] },
    { day: 'Martedì', hours: '18:00 - 23:00', openRanges: [[18*60, 23*60]] },
    { day: 'Mercoledì', hours: '18:00 - 23:00', openRanges: [[18*60, 23*60]] },
    { day: 'Giovedì', hours: '18:00 - 23:00', openRanges: [[18*60, 23*60]] },
    { day: 'Venerdì', hours: '18:00 - 23:30', openRanges: [[18*60, 23*60+30]] },
    { day: 'Sabato', hours: '18:00 - 23:30', openRanges: [[18*60, 23*60+30]] },
    { day: 'Domenica', hours: '12:00 - 15:00, 18:00 - 23:00', openRanges: [[12*60, 15*60], [18*60, 23*60]] },
  ]

  return scheduleData.map((schedule, index) => {
    const dayIndex = index === 6 ? 0 : index + 1 // Aggiusta per inizio lunedì
    const isToday = dayIndex === currentDay
    
    let isOpen = false
    if (isToday && schedule.openRanges.length > 0) {
      isOpen = schedule.openRanges.some(([start, end]) => 
        currentTime >= start && currentTime <= end
      )
    }

    return {
      day: schedule.day,
      hours: schedule.hours,
      isToday,
      isOpen
    }
  })
}

export const HoursWidget: React.FC<HoursWidgetProps> = ({
  className = '',
  showContactInfo = true
}) => {
  const [hours] = useState<OpeningHours[]>(getOpeningHours())
  const [currentStatus, setCurrentStatus] = useState<'open' | 'closed'>('closed')

  useEffect(() => {
    const updateStatus = () => {
      const todayHours = hours.find(h => h.isToday)
      setCurrentStatus(todayHours?.isOpen ? 'open' : 'closed')
    }

    updateStatus()
    const interval = setInterval(updateStatus, 60000)
    return () => clearInterval(interval)
  }, [hours])

  const getStatusText = () => {
    return currentStatus === 'open' ? 'Aperto ora' : 'Chiuso ora'
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Orari di Apertura</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                currentStatus === 'open' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                currentStatus === 'open' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Orari */}
      <div className="space-y-3 mb-6">
        {hours.map((schedule) => (
          <div 
            key={schedule.day}
            className={`flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
              schedule.isToday 
                ? 'bg-blue-50 border-l-3 border-blue-500' 
                : 'hover:bg-gray-50'
            }`}
          >
            <span className={`font-medium ${
              schedule.isToday ? 'text-blue-900' : 'text-gray-700'
            }`}>
              {schedule.day}
            </span>
            <span className={`text-sm ${
              schedule.isToday ? 'text-blue-700 font-medium' : 'text-gray-600'
            }`}>
              {schedule.hours}
            </span>
          </div>
        ))}
      </div>

      {/* Informazioni di contatto */}
      {showContactInfo && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <a 
              href="tel:+390522618XXX"
              className="hover:text-blue-600 transition-colors"
            >
              +39 0522 618 XXX
            </a>
          </div>
          
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">
              Santuario della Beata Vergine del Carrobbio, Casina (RE)
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-amber-700">
              💡 Prenotazione consigliata nei weekend
            </p>
          </div>
        </div>
      )}
    </div>
  )
}