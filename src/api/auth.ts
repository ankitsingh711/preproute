import { apiClient, request } from '@/api/client'
import type { LoginResponseData } from '@/types/api'

export function login(userId: string, password: string) {
  return request<LoginResponseData>(
    apiClient.post('/auth/login', { userId, password }),
  )
}
