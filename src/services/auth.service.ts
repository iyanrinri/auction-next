import { apiClient } from '@/lib/api-client'
import { AuthResponse, User } from '@/types'

export const authApi = {
  register: async (data: {
    email: string
    password: string
    name: string
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  login: async (data: {
    email: string
    password: string
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/profile')
    return response.data
  },
}
