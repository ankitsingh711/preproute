import { apiClient, request } from '@/api/client'
import type { CreateTestPayload, Test, UpdateTestPayload } from '@/types/api'

export function getTests() {
  return request<Test[]>(apiClient.get('/tests'))
}

export function getTest(id: string) {
  return request<Test>(apiClient.get(`/tests/${id}`))
}

export function createTest(payload: CreateTestPayload) {
  return request<Test>(apiClient.post('/tests', payload))
}

export function updateTest(id: string, payload: UpdateTestPayload) {
  return request<Test>(apiClient.put(`/tests/${id}`, payload))
}

export function deleteTest(id: string) {
  return request<Test>(apiClient.delete(`/tests/${id}`))
}
