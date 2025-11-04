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
      
      // Transform bid data to match expected format
      const transformedBid = {
        id: data.bid.id,
        auctionId: data.auctionId,
        bidderId: data.bid.bidderId,
        amount: data.bid.amount,
        isAuto: data.bid.isAuto,
        createdAt: data.bid.createdAt,
        bidder: {
          id: data.bid.bidderId,
          name: data.bid.bidderName,
          email: '', // Not provided by WebSocket
        }
      }
      
      // Optimistically update bids list in cache (now using pagination structure)
      queryClient.setQueryData(['bids', auctionId, 1, 20], (oldData: any) => {
        if (!oldData) {
          return {
            bids: [transformedBid],
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1
          }
        }
        
        // Check if bid already exists (prevent duplicate)
        const bidExists = oldData.bids?.some((bid: any) => bid.id === transformedBid.id)
        if (bidExists) {
          console.log('Bid already exists in cache, skipping')
          return oldData
        }
        
        // Add new bid to the top of the list and increment total
        return {
          ...oldData,
          bids: [transformedBid, ...(oldData.bids || [])],
          total: oldData.total + 1
        }
      })

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
      
      // No need to refetch, we already have the latest data from WebSocket
    })

    // Listen for status changes
    const unsubscribeStatus = onStatusChange((data: StatusChangePayload) => {
      console.log('🔄 Status changed:', data)
      
      // Convert status to lowercase for frontend consistency
      setStatus(data.status.toLowerCase())
      
      // Only mark as stale, don't refetch
      queryClient.invalidateQueries({ 
        queryKey: ['auction', auctionId],
        refetchType: 'none'
      })

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
