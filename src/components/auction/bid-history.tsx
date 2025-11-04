'use client'

import { useState, useEffect } from 'react'
import { bidsApi } from '@/services/bids.service'
import { Bid } from '@/types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { User, Trophy, TrendingUp, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BidHistoryProps {
  bids: Bid[]
  currentHighestBidId?: string
  auctionId: string
  totalBids: number
}

export function BidHistory({ 
  bids, 
  currentHighestBidId,
  auctionId,
  totalBids
}: BidHistoryProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [allLoadedBids, setAllLoadedBids] = useState<Bid[]>(bids)
  const pageSize = 20

  // Sync with incoming bids (from WebSocket or initial load)
  useEffect(() => {
    setAllLoadedBids(prevBids => {
      // Merge new bids from props with existing loaded bids
      const newBids = bids.filter(
        newBid => !prevBids.some(existingBid => existingBid.id === newBid.id)
      )
      return [...newBids, ...prevBids]
    })
  }, [bids])
  
  if (!allLoadedBids || allLoadedBids.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No bids yet. Be the first to bid!</p>
      </div>
    )
  }

  const sortedBids = [...allLoadedBids].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  
  const hasMore = allLoadedBids.length < totalBids
  const remainingCount = totalBids - allLoadedBids.length

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      const response = await bidsApi.getByAuctionId(auctionId, { 
        page: nextPage, 
        limit: pageSize 
      })
      
      if (response.bids) {
        // Merge new bids, avoid duplicates
        setAllLoadedBids(prev => {
          const newBids = response.bids!.filter(
            newBid => !prev.some(existingBid => existingBid.id === newBid.id)
          )
          return [...prev, ...newBids]
        })
        setCurrentPage(nextPage)
      }
    } catch (error) {
      console.error('Failed to load more bids:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
        <TrendingUp className="w-5 h-5" />
        Bid History ({totalBids})
      </h3>
      
      <div className="space-y-2">
        {sortedBids.map((bid) => {
          const isWinning = bid.id === currentHighestBidId

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
                    {formatDateTime(bid.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Load More Button */}
      {hasMore && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="w-full"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More ({remainingCount} remaining)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
