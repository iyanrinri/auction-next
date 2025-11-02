'use client'

import { Bid } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { User, Trophy, TrendingUp } from 'lucide-react'

interface BidHistoryProps {
  bids: Bid[]
  currentHighestBidId?: string
}

export function BidHistory({ bids, currentHighestBidId }: BidHistoryProps) {
  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No bids yet. Be the first to bid!</p>
      </div>
    )
  }

  const sortedBids = [...bids].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
        <TrendingUp className="w-5 h-5" />
        Bid History ({bids.length})
      </h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedBids.map((bid, index) => {
          const isWinning = bid.id === currentHighestBidId
          const isFirst = index === 0

          return (
            <div
              key={bid.id}
              className={`p-4 rounded-lg border ${
                isWinning
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isWinning && (
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  )}
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {bid.bidder?.name || 'Anonymous'}
                    </span>
                  </div>
                  {bid.isAuto && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                      Auto
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className={`font-bold ${isWinning ? 'text-green-700 text-xl' : 'text-gray-900 text-lg'}`}>
                    {formatCurrency(bid.amount)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatDate(bid.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
