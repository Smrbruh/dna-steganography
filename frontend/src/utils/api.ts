import axios, { AxiosInstance } from 'axios'
import { EncodeResponse, StatusResponse } from '../types'
const createApiClient = (): AxiosInstance => {
  return axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
const apiClient = createApiClient()
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
export const encodeFile = async (file: File): Promise<EncodeResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<EncodeResponse>('/encode', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
export const getStatus = async (jobId: string): Promise<StatusResponse> => {
  const response = await apiClient.get<StatusResponse>(`/status/${jobId}`)
  return response.data
}
export const downloadReport = async (jobId: string): Promise<Blob> => {
  const response = await apiClient.get(`/report/${jobId}`, {
    responseType: 'blob',
  })
  return response.data
}
export const decodeSequence = async (sequence: string): Promise<Blob> => {
  const response = await apiClient.post(
    '/decode',
    { sequence },
    { responseType: 'blob' }
  )
  return response.data
}
export default apiClient