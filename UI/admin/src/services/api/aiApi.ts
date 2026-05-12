import axios from '@/config/axios.config'

export interface AIChatResponse {
    answer?: string
    stats?: string
    status: string
    error?: string
}

export const aiApi = {
    /**
     * Gửi câu hỏi đến AI Assistant
     */
    askQuestion: async (question: string): Promise<AIChatResponse> => {
        const response = await axios.post<AIChatResponse>('/api/ai/ask', { question })
        return response.data
    },

    /**
     * Lấy thống kê nhanh từ hệ thống
     */
    getStats: async (): Promise<AIChatResponse> => {
        const response = await axios.get<AIChatResponse>('/api/ai/stats')
        return response.data
    }
}
