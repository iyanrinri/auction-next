'use client'

import Link from 'next/link'
import { Auction } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuctionTimer } from './auction-timer'
import { formatCurrency } from '@/lib/utils'
import { Hammer, TrendingUp, User } from 'lucide-react'

interface AuctionCardProps {
  auction: Auction
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const currentPrice = auction.currentBid?.amount || auction.startingPrice
  const status = (auction.status || '').toLowerCase()
  const isRunning = status === 'running'
  const isPending = status === 'pending'
  const isEnded = status === 'ended'

  return (
    <Card className="hover:shadow-lg transition-shadow border-gray-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl line-clamp-2 text-gray-900">
            {auction.item?.title || 'Untitled Item'}
          </CardTitle>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isRunning ? 'bg-green-100 text-green-800 border border-green-200' :
            isPending ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            isEnded ? 'bg-gray-200 text-gray-800 border border-gray-300' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {auction.status}
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mt-2">
          {auction.item?.description || 'No description'}
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Current Price */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Current Price</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(currentPrice)}
            </div>
            {auction.bidsCount !== undefined && (
              <div className="text-xs text-gray-600 mt-1">
                {auction.bidsCount} {auction.bidsCount === 1 ? 'bid' : 'bids'}
              </div>
            )}
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
          <Button className={`w-full ${isRunning ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`} variant={isRunning ? 'default' : 'outline'}>
            <Hammer className="w-4 h-4 mr-2" />
            {isRunning ? 'Place Bid' : 'View Details'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
