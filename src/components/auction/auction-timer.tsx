'use client'

import { useState, useEffect } from 'react'
import { getTimeRemaining } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface AuctionTimerProps {
  endTime: string | Date
  onExpire?: () => void
  className?: string
}

export function AuctionTimer({ endTime, onExpire, className }: AuctionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(endTime))

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(endTime)
      setTimeRemaining(remaining)

      if (remaining.total <= 0 && onExpire) {
        onExpire()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, onExpire])

  if (timeRemaining.total <= 0) {
    return (
      <div className={`flex items-center gap-2 text-red-600 font-semibold ${className}`}>
        <Clock className="w-5 h-5" />
        <span>Auction Ended</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="w-5 h-5 text-gray-700" />
      <div className="flex gap-1">
        {timeRemaining.days > 0 && (
          <div className="bg-gray-900 text-white px-2 py-1 rounded shadow-sm">
            <span className="text-lg font-bold">{timeRemaining.days}</span>
            <span className="text-xs ml-1">d</span>
          </div>
        )}
        <div className="bg-gray-900 text-white px-2 py-1 rounded shadow-sm">
          <span className="text-lg font-bold">{String(timeRemaining.hours).padStart(2, '0')}</span>
          <span className="text-xs ml-1">h</span>
        </div>
        <div className="bg-gray-900 text-white px-2 py-1 rounded shadow-sm">
          <span className="text-lg font-bold">{String(timeRemaining.minutes).padStart(2, '0')}</span>
          <span className="text-xs ml-1">m</span>
        </div>
        <div className="bg-gray-900 text-white px-2 py-1 rounded shadow-sm">
          <span className="text-lg font-bold">{String(timeRemaining.seconds).padStart(2, '0')}</span>
          <span className="text-xs ml-1">s</span>
        </div>
      </div>
    </div>
  )
}
