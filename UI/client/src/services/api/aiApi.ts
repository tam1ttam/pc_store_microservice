import axios from '@/config/axios.config'
import ENDPOINT from '@/constants/endpoint'

const CHAT_SVC = `${import.meta.env.VITE_API_URL}/api-gateway/chat-service`

export interface AIChatResponse {
  success: boolean
  response: string
  model: string
  usage?: any
  error?: string
}

export interface ChatMessageApi {
  id: string
  createdDate: string
  message: string
  messageType: string
  me: boolean
  sender?: { userId: string; username: string; avatar?: string }
  attachments?: any[]
}

export const aiApi = {
  askQuestion: async (question: string, userId?: string): Promise<AIChatResponse> => {
    const response = await axios.post<AIChatResponse>(
      ENDPOINT.AI.CHAT,
      { message: question, ...(userId ? { userId } : {}) },
    )
    return response.data
  },

  getHistory: async (): Promise<ChatMessageApi[]> => {
    const response = await axios.get<{ success: boolean; result: ChatMessageApi[] }>(
      `${CHAT_SVC}/ai/history`,
    )
    return response.data.result ?? []
  },
}
