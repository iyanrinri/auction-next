'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Auction } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuctionTimer } from './auction-timer'
import { formatCurrency } from '@/lib/utils'
import { Hammer, TrendingUp, User, Zap } from 'lucide-react'

interface LiveAuctionCardProps {
  auction: Auction
  realTimePrice?: number
  realTimeBidCount?: number
  isLive?: boolean
}

export function LiveAuctionCard({ 
  auction, 
  realTimePrice,
  realTimeBidCount,
  isLive = false 
}: LiveAuctionCardProps) {
  const [isPriceUpdating, setIsPriceUpdating] = useState(false)
  const currentPrice = realTimePrice || auction.currentBid?.amount || auction.startingPrice
  const bidCount = realTimeBidCount ?? auction.bidsCount ?? 0
  const status = (auction.status || '').toLowerCase()
  const isRunning = status === 'running'
  const isPending = status === 'pending'
  const isEnded = status === 'ended'

  // Animate price changes
  useEffect(() => {
    if (realTimePrice && realTimePrice !== (auction.currentBid?.amount || auction.startingPrice)) {
      setIsPriceUpdating(true)
      const timer = setTimeout(() => setIsPriceUpdating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [realTimePrice, auction.currentBid?.amount, auction.startingPrice])

  return (
    <Card className={`hover:shadow-lg transition-all border-gray-200 ${
      isPriceUpdating ? 'ring-2 ring-green-500 animate-pulse' : ''
    }`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl line-clamp-2 text-gray-900">
            {auction.item?.title || 'Untitled Item'}
          </CardTitle>
          <div className="flex flex-col items-end gap-1">
            {/* Live Indicator */}
            {isLive && isRunning && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </div>
            )}
            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isRunning ? 'bg-green-100 text-green-800 border border-green-200' :
              isPending ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              isEnded ? 'bg-gray-200 text-gray-800 border border-gray-300' :
              'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {auction.status}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mt-2">
          {auction.item?.description || 'No description'}
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Current Price */}
          <div className={`bg-blue-50 p-4 rounded-lg border border-blue-100 transition-all ${
            isPriceUpdating ? 'bg-green-50 border-green-200' : ''
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Current Price</span>
              {isPriceUpdating ? (
                <Zap className="w-4 h-4 text-green-600 animate-bounce" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-600" />
              )}
            </div>
            <div className={`text-2xl font-bold text-gray-900 mt-1 transition-all ${
              isPriceUpdating ? 'scale-110 text-green-600' : ''
            }`}>
              {formatCurrency(currentPrice)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
            </div>
          </div>

          {/* Timer */}
          {isRunning && (
            <AuctionTimer endTime={auction.endAt} className="justify-center" />
          )}

          {isPending && (
            <div className="text-center text-sm text-gray-600 font-medium">
              Starts: {new Date(auction.startAt).toLocaleDateString()}
            </div>
          )}

          {/* Seller Info */}
          {auction.item?.seller && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              <span>by {auction.item.seller.name}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/auctions/${auction.id}`} className="w-full">
          <Button 
            className={`w-full ${
              isRunning 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`} 
            variant={isRunning ? 'default' : 'outline'}
          >
            <Hammer className="w-4 h-4 mr-2" />
            {isRunning ? 'Place Bid' : 'View Details'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
