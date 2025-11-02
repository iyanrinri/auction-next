export type UserRole = 'USER' | 'SELLER' | 'ADMIN'
// Backend returns UPPERCASE status, but frontend normalizes to lowercase
export type AuctionStatus = 'PENDING' | 'RUNNING' | 'ENDED' | 'CANCELLED'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  modifiedAt?: string
}

export interface AuthResponse {
  user: User
  access_token: string
}

export interface Item {
  id: string
  title: string
  description: string
  metadata?: Record<string, any>
  sellerId: string
  seller?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  modifiedAt?: string
}

export interface Bid {
  id: string
  auctionId: string
  bidderId: string
  amount: number
  isAuto: boolean
  createdAt: string
  bidder?: {
    id: string
    name: string
    email: string
  }
  auction?: Auction
}

export interface Auction {
  id: string
  itemId: string
  startingPrice: number
  reservePrice?: number
  buyNowPrice?: number
  minIncrement: number
  startAt: string
  endAt: string
  status: AuctionStatus
  autoExtendSeconds?: number
  createdAt: string
  modifiedAt?: string
  item?: Item
  currentBid?: Bid
  currentHighestBid?: Bid  // Backend uses this field name
  bids?: Bid[]
  bidsCount?: number
  bidCount?: number  // Backend might use this field name
  winnerId?: string
  winningBidId?: string
}

export interface PaginatedResponse<T> {
  items?: T[]
  auctions?: T[]
  bids?: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  statusCode: number
  message: string
  error: string
  details?: Array<{
    field: string
    message: string
  }>
}
