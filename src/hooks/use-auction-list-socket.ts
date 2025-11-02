import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import {
  connectSocket,
  onNewBid,
  onPriceUpdate,
  onStatusChange,
  type NewBidPayload,
  type PriceUpdatePayload,
  type StatusChangePayload,
} from '@/lib/socket'

interface AuctionUpdate {
  auctionId: string
  currentPrice?: number
  bidCount?: number
  status?: string
}

export const useAuctionListSocket = () => {
  const queryClient = useQueryClient()
  const { token } = useAuthStore()
  const [auctionUpdates, setAuctionUpdates] = useState<Map<string, AuctionUpdate>>(new Map())

  useEffect(() => {
    // Connect socket
    const socket = connectSocket(token || undefined)

    // Listen for new bids (global)
    const unsubscribeBid = onNewBid((data: NewBidPayload) => {
      console.log('💰 Global new bid received:', data)
      
      setAuctionUpdates((prev) => {
        const next = new Map(prev)
        const existing = next.get(data.auctionId) || { auctionId: data.auctionId }
        next.set(data.auctionId, {
          ...existing,
          currentPrice: data.bid.amount,
        })
        return next
      })

      // Invalidate auctions list query
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
    })

    // Listen for price updates (global)
    const unsubscribePrice = onPriceUpdate((data: PriceUpdatePayload) => {
      console.log('📈 Global price updated:', data)
      
      setAuctionUpdates((prev) => {
        const next = new Map(prev)
        const existing = next.get(data.auctionId) || { auctionId: data.auctionId }
        next.set(data.auctionId, {
          ...existing,
          currentPrice: data.currentPrice,
          bidCount: data.bidCount,
        })
        return next
      })
    })

    // Listen for status changes (global)
    const unsubscribeStatus = onStatusChange((data: StatusChangePayload) => {
      console.log('🔄 Global status changed:', data)
      
      setAuctionUpdates((prev) => {
        const next = new Map(prev)
        const existing = next.get(data.auctionId) || { auctionId: data.auctionId }
        next.set(data.auctionId, {
          ...existing,
          status: data.status,
        })
        return next
      })

      // Invalidate auctions list query
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
    })

    // Cleanup
    return () => {
      unsubscribeBid()
      unsubscribePrice()
      unsubscribeStatus()
    }
  }, [token, queryClient])

  const getAuctionUpdate = (auctionId: string): AuctionUpdate | undefined => {
    return auctionUpdates.get(auctionId)
  }

  return {
    auctionUpdates,
    getAuctionUpdate,
  }
}
