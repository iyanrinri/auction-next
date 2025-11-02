import { apiClient } from '@/lib/api-client'
import { Auction, PaginatedResponse } from '@/types'

export const auctionsApi = {
  // Public endpoint - no auth required
  getAll: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
    sellerId?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: 'createdAt' | 'startAt' | 'endAt' | 'startingPrice'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<PaginatedResponse<Auction>> => {
    // Filter out undefined values and ensure lowercase status
    const cleanParams: Record<string, string | number> = {}
    
    if (params?.page !== undefined) cleanParams.page = params.page
    if (params?.limit !== undefined) cleanParams.limit = params.limit
    if (params?.status) cleanParams.status = params.status.toLowerCase() // Backend expects lowercase
    if (params?.search) cleanParams.q = params.search // Backend uses 'q' for search
    if (params?.sellerId) cleanParams.sellerId = params.sellerId
    if (params?.minPrice !== undefined) cleanParams.minPrice = params.minPrice
    if (params?.maxPrice !== undefined) cleanParams.maxPrice = params.maxPrice
    if (params?.sortBy) cleanParams.sortBy = params.sortBy
    if (params?.sortOrder) cleanParams.sortOrder = params.sortOrder
    
    const response = await apiClient.get('/auctions', { 
      params: cleanParams 
    })
    return response.data
  },

  // Public endpoint - no auth required
  getById: async (id: string): Promise<Auction> => {
    const response = await apiClient.get(`/auctions/${id}`)
    return response.data
  },

  // Authenticated endpoint - requires seller role
  create: async (data: {
    itemId: string
    startingPrice: number
    reservePrice?: number
    buyNowPrice?: number
    minIncrement: number
    startAt: string
    endAt: string
    autoExtendSeconds?: number
  }): Promise<Auction> => {
    const response = await apiClient.post('/auctions', data)
    return response.data
  },

  // Authenticated endpoint - requires seller role
  update: async (id: string, data: Partial<Auction>): Promise<Auction> => {
    const response = await apiClient.patch(`/auctions/${id}`, data)
    return response.data
  },

  // Authenticated endpoint - requires seller role
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/auctions/${id}`)
  },
}
