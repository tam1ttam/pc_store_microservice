import axios from '@/config/axios.config'

export interface AIChatResponse {
    answer?: string
    stats?: string
    status: string
    error?: string
}

export const aiApi = {
    askQuestion: async (question: string, mode: string = "chat", role: string = "MANAGER"): Promise<AIChatResponse> => {
        const response = await axios.post<{ code: number; result: AIChatResponse }>(
            '/api-gateway/chat-service/ai/ask',
            {
                message: question,
                mode,
                role
            }
        )
        return response.data.result
    },

    getStats: async (): Promise<AIChatResponse> => {
        const response = await axios.get<{ code: number; result: AIChatResponse }>(
            '/api-gateway/chat-service/ai/stats'
        )
        return response.data.result
    }
}
