import { io, Socket } from 'socket.io-client'

// WebSocket event payloads based on API documentation
export interface NewBidPayload {
  auctionId: string
  bid: {
    id: string
    amount: number
    bidderId: string
    bidderName: string
    isAuto: boolean
    createdAt: string
  }
  timestamp: string
}

export interface PriceUpdatePayload {
  auctionId: string
  currentPrice: number
  bidCount: number
  timestamp: string
}

export interface StatusChangePayload {
  auctionId: string
  status: 'PENDING' | 'RUNNING' | 'ENDED' | 'CANCELLED' // Backend sends UPPERCASE
  data?: {
    startedAt?: string
    endedAt?: string
  }
  timestamp: string
}

export interface EndingSoonPayload {
  auctionId: string
  timeRemainingSeconds: number
  timestamp: string
}

export interface ViewerCountPayload {
  auctionId: string
  count: number
}

// Auto-detect WebSocket URL from browser location
const getWebSocketURL = (): string => {
  // Only run on client side
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname
  const port = window.location.port
  
  // If port exists and it's not standard ports (80/443), include it
  if (port && port !== '80' && port !== '443') {
    // For development (e.g., localhost:3001), connect to backend port (3000)
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:3000`
    }
    return `${protocol}//${host}:${port}`
  }
  
  // For production (e.g., auction.co.id)
  return `${protocol}//${host}`
}

const WS_URL = getWebSocketURL()
const AUCTION_NAMESPACE = '/auctions'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    const wsUrl = `${WS_URL}${AUCTION_NAMESPACE}`
    console.log(`🔌 Initializing WebSocket connection to: ${wsUrl}`)
    
    socket = io(wsUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log(`✅ WebSocket connected to: ${wsUrl}`)
    })

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected from auction server')
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })

    socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  return socket
}

export const connectSocket = (token?: string) => {
  const socket = getSocket()
  
  if (token) {
    socket.auth = { token }
  }

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}

export const disconnectSocket = () => {
  const socket = getSocket()
  if (socket.connected) {
    socket.disconnect()
  }
}

// Auction room events
export const joinAuction = (auctionId: string) => {
  const socket = getSocket()
  socket.emit('joinAuction', auctionId)
  console.log(`📍 Joined auction: ${auctionId}`)
}

export const leaveAuction = (auctionId: string) => {
  const socket = getSocket()
  socket.emit('leaveAuction', auctionId)
  console.log(`👋 Left auction: ${auctionId}`)
}

// Event listeners
export const onNewBid = (callback: (data: NewBidPayload) => void) => {
  const socket = getSocket()
  socket.on('newBid', callback)
  return () => socket.off('newBid', callback)
}

export const onPriceUpdate = (callback: (data: PriceUpdatePayload) => void) => {
  const socket = getSocket()
  socket.on('priceUpdate', callback)
  return () => socket.off('priceUpdate', callback)
}

export const onStatusChange = (callback: (data: StatusChangePayload) => void) => {
  const socket = getSocket()
  socket.on('statusChange', callback)
  return () => socket.off('statusChange', callback)
}

export const onEndingSoon = (callback: (data: EndingSoonPayload) => void) => {
  const socket = getSocket()
  socket.on('endingSoon', callback)
  return () => socket.off('endingSoon', callback)
}

export const onViewerCount = (callback: (data: ViewerCountPayload) => void) => {
  const socket = getSocket()
  socket.on('viewerCount', callback)
  return () => socket.off('viewerCount', callback)
}

// Check connection status
export const isSocketConnected = (): boolean => {
  return socket?.connected || false
}
