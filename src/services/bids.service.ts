import { apiClient } from '@/lib/api-client'
import { Bid, PaginatedResponse } from '@/types'

export const bidsApi = {
  // Public endpoint - no auth required
  getAll: async (params?: {
    page?: number
    limit?: number
    auctionId?: string
    bidderId?: string
    sortBy?: 'createdAt' | 'amount'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<PaginatedResponse<Bid>> => {
    // Filter out undefined values
    const cleanParams: Record<string, string | number> = {}
    
    if (params?.page !== undefined) cleanParams.page = params.page
    if (params?.limit !== undefined) cleanParams.limit = params.limit
    if (params?.auctionId) cleanParams.auctionId = params.auctionId
    if (params?.bidderId) cleanParams.bidderId = params.bidderId
    if (params?.sortBy) cleanParams.sortBy = params.sortBy
    if (params?.sortOrder) cleanParams.sortOrder = params.sortOrder
    
    const response = await apiClient.get('/bids', { params: cleanParams })
    return response.data
  },

  // Public endpoint - no auth required
  getByAuctionId: async (
    auctionId: string, 
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<PaginatedResponse<Bid>> => {
    const cleanParams: Record<string, string | number> = {}
    
    if (params?.page !== undefined) cleanParams.page = params.page
    if (params?.limit !== undefined) cleanParams.limit = params.limit
    
    const response = await apiClient.get(`/bids/auction/${auctionId}`, {
      params: cleanParams
    })
    return response.data
  },

  // Public endpoint - no auth required
  getHighestBid: async (auctionId: string): Promise<Bid> => {
    const response = await apiClient.get(`/bids/auction/${auctionId}/highest`)
    return response.data
  },

  // Public endpoint - no auth required
  getById: async (id: string): Promise<Bid> => {
    const response = await apiClient.get(`/bids/${id}`)
    return response.data
  },

  // Authenticated endpoint - requires auth
  create: async (data: {
    auctionId: string
    amount: number
    isAuto?: boolean
  }): Promise<Bid> => {
    const response = await apiClient.post('/bids', data)
    return response.data
  },

  // Authenticated endpoint - requires auth
  getMyBids: async (): Promise<PaginatedResponse<Bid>> => {
    const response = await apiClient.get('/bids/my-bids')
    return response.data
  },
}
