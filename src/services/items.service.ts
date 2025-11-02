import { apiClient } from '@/lib/api-client'
import { Item, PaginatedResponse } from '@/types'

export const itemsApi = {
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
  }): Promise<PaginatedResponse<Item>> => {
    const response = await apiClient.get('/items', { params })
    return response.data
  },

  getById: async (id: string): Promise<Item> => {
    const response = await apiClient.get(`/items/${id}`)
    return response.data
  },

  create: async (data: {
    title: string
    description: string
    metadata?: Record<string, any>
  }): Promise<Item> => {
    const response = await apiClient.post('/items', data)
    return response.data
  },

  update: async (id: string, data: Partial<Item>): Promise<Item> => {
    const response = await apiClient.patch(`/items/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/items/${id}`)
  },
}
