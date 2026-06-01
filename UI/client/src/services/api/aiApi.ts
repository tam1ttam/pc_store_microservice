import axios from '@/config/axios.config'
import ENDPOINT from '@/constants/endpoint'

export interface AIChatResponse {
  success: boolean
  response: string
  model: string
  usage?: any
  error?: string
}

export const aiApi = {
  askQuestion: async (question: string, userId?: string): Promise<AIChatResponse> => {
    const response = await axios.post<AIChatResponse>(
      ENDPOINT.AI.CHAT,
      { message: question, ...(userId ? { userId } : {}) },
    )
    return response.data
  },

  getHistory: async (userId?: string): Promise<any[]> => {
    const url = userId
      ? `${ENDPOINT.AI.HISTORY}?userId=${encodeURIComponent(userId)}`
      : ENDPOINT.AI.HISTORY
    const response = await axios.get<any[]>(url)
    return response.data
  },
}