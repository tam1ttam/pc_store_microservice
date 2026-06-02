export const runtime = 'edge';

export async function POST(request) {
  try {
    const { message, mode = 'chat' } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({
        error: 'Message is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = mode === 'agent'
      ? `Bạn là agent bán hàng thông minh. Nhiệm vụ:
1. Trả lời câu hỏi về sản phẩm, giá, chất lượng
2. Hỗ trợ tìm size/màu/số lượng
3. Đề xuất sản phẩm liên quan
4. Hướng dẫn đặt hàng

Quy tắc:
- Luôn thân thiện, chuyên nghiệp
- Nếu không biết, nói "Tôi cần kiểm tra lại" không tự ý bịa
- Câu trả lời ngắn gọn, dễ hiểu`
      : `Bạn là trợ lý dịch vụ khách hàng. Trả lời:
- Ngắn gọn, thân thiện
- Hữu ích, chính xác
- Tự nhiên như người thật`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'E-commerce Chatbot'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenRouter API Error:', data.error);
      return new Response(JSON.stringify({
        error: 'AI service temporarily unavailable',
        details: data.error.message
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
      return new Response(JSON.stringify({
        error: 'Invalid response from AI'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      response: data.choices[0].message.content,
      model: data.model,
      usage: data.usage || {}
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
