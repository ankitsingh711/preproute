import axios, { type AxiosError } from 'axios'
import type { ApiErrorPayload } from '@/types/api'
import { useAuthStore } from '@/store/authStore'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Normalized error shape every UI layer can render without knowing the API's quirks. */
export class ApiError extends Error {
  fieldErrors: Record<string, string>

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.fieldErrors = fieldErrors
  }
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorPayload>
    if (axiosError.response?.status === 401) {
      useAuthStore.getState().logout()
    }

    const payload = axiosError.response?.data
    if (!payload) {
      return new ApiError(axiosError.message || 'Network error. Please try again.')
    }

    const fieldErrors: Record<string, string> = {}
    if (Array.isArray(payload.errors)) {
      for (const e of payload.errors) {
        if (!fieldErrors[e.path]) fieldErrors[e.path] = e.msg
      }
      const message = payload.errors[0]?.msg ?? payload.message
      return new ApiError(message, fieldErrors)
    }

    if (payload.errors && typeof payload.errors === 'object') {
      const message = payload.errors.message ?? payload.message
      return new ApiError(message)
    }

    return new ApiError(payload.message ?? 'Something went wrong.')
  }
  return new ApiError('Something went wrong.')
}

/** Unwraps the {status,message,data} envelope and normalizes errors. */
export async function request<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  try {
    const response = await promise
    return response.data.data
  } catch (error) {
    throw toApiError(error)
  }
}
