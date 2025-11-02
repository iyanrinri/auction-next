import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import {
  connectSocket,
  disconnectSocket,
  joinAuction,
  leaveAuction,
  onNewBid,
  onPriceUpdate,
  onStatusChange,
  onEndingSoon,
  onViewerCount,
  isSocketConnected,
  type NewBidPayload,
  type PriceUpdatePayload,
  type StatusChangePayload,
  type EndingSoonPayload,
  type ViewerCountPayload,
} from '@/lib/socket'
import { useToast } from './use-toast'

export const useAuctionSocket = (auctionId?: string) => {
  const queryClient = useQueryClient()
  const { token } = useAuthStore()
  const { toast } = useToast()
  
  const [isConnected, setIsConnected] = useState(false)
  const [currentBid, setCurrentBid] = useState<number>(0)
  const [bidCount, setBidCount] = useState<number>(0)
  const [viewers, setViewers] = useState<number>(0)
  const [status, setStatus] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!auctionId) return

    // Connect socket
    const socket = connectSocket(token || undefined)
    setIsConnected(isSocketConnected())

    // Join auction room
    joinAuction(auctionId)

    // Listen for new bids
    const unsubscribeBid = onNewBid((data: NewBidPayload) => {
      console.log('💰 New bid received:', data)
      
      setCurrentBid(data.bid.amount)
      
      // Invalidate queries to refetch latest data
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] })
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
      queryClient.invalidateQueries({ queryKey: ['bids', auctionId] })

      toast({
        title: '💰 New Bid Placed!',
        description: `${data.bid.bidderName} bid $${data.bid.amount}`,
      })
    })

    // Listen for price updates
    const unsubscribePrice = onPriceUpdate((data: PriceUpdatePayload) => {
      console.log('📈 Price updated:', data)
      
      setCurrentBid(data.currentPrice)
      setBidCount(data.bidCount)
      
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] })
    })

    // Listen for status changes
    const unsubscribeStatus = onStatusChange((data: StatusChangePayload) => {
      console.log('🔄 Status changed:', data)
      
      // Convert status to lowercase for frontend consistency
      setStatus(data.status.toLowerCase())
      
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] })
      queryClient.invalidateQueries({ queryKey: ['auctions'] })

      let title = 'Auction Status Updated'
      let description = `Auction is now ${data.status}`

      const statusLower = data.status.toLowerCase()
      switch (statusLower) {
        case 'running':
          title = '🚀 Auction Started!'
          description = 'The auction is now live and accepting bids'
          break
        case 'ended':
          title = '🏁 Auction Ended!'
          description = 'This auction has ended'
          break
        case 'cancelled':
          title = '❌ Auction Cancelled'
          description = 'This auction has been cancelled'
          break
      }

      toast({ title, description })
    })

    // Listen for ending soon notifications
    const unsubscribeEndingSoon = onEndingSoon((data: EndingSoonPayload) => {
      console.log('⏰ Auction ending soon:', data)
      
      setTimeRemaining(data.timeRemainingSeconds)
      
      const minutes = Math.floor(data.timeRemainingSeconds / 60)
      const seconds = data.timeRemainingSeconds % 60

      toast({
        title: '⏰ Auction Ending Soon!',
        description: `Only ${minutes}:${seconds.toString().padStart(2, '0')} remaining!`,
        variant: 'destructive',
      })
    })

    // Listen for viewer count updates
    const unsubscribeViewers = onViewerCount((data: ViewerCountPayload) => {
      console.log('👥 Viewers updated:', data)
      setViewers(data.count)
    })

    // Cleanup
    return () => {
      leaveAuction(auctionId)
      unsubscribeBid()
      unsubscribePrice()
      unsubscribeStatus()
      unsubscribeEndingSoon()
      unsubscribeViewers()
    }
  }, [auctionId, token, queryClient, toast])

  return {
    isConnected,
    currentBid,
    bidCount,
    viewers,
    status,
    timeRemaining,
  }
}

export const useGlobalSocket = () => {
  const { token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token) {
      connectSocket(token)
    }

    return () => {
      if (isAuthenticated) {
        disconnectSocket()
      }
    }
  }, [isAuthenticated, token])
}
