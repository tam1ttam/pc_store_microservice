package com.tam.chat.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GeminiAiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-2.0-flash}")
    private String geminiModel;

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1/models/%s:generateContent?key=%s";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String processQuery(String userQuestion) {
        try {
            if (geminiApiKey == null || geminiApiKey.isEmpty()) {
                return "⚠️ Google Gemini API key chưa được cấu hình.\n\n"
                        + "Để sử dụng AI Assistant, vui lòng:\n"
                        + "1. Lấy API key tại: https://aistudio.google.com/apikey\n"
                        + "2. Set biến môi trường: GEMINI_API_KEY=your-key\n"
                        + "3. Restart server";
            }

            String roastResponse = checkAndRoastBack(userQuestion);
            if (roastResponse != null) {
                return roastResponse;
            }

            String databaseContext = getDatabaseContext();

            String systemPrompt =
                    """
					Bạn là trợ lý AI cho hệ thống PC Store - cửa hàng bán máy tính và linh kiện.
					Bạn có thể tư vấn về các sản phẩm máy tính, linh kiện, hỗ trợ khách hàng và giải đáp thắc mắc.

					%s

					Hãy trả lời câu hỏi của người dùng một cách hữu ích.
					Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu và chuyên nghiệp.
					Sử dụng emoji để làm cho câu trả lời sinh động hơn.
					Nếu không có thông tin cụ thể, hãy tư vấn dựa trên kiến thức chung về PC và linh kiện.
					"""
                            .formatted(databaseContext);

            String fullPrompt = systemPrompt + "\n\nCâu hỏi: " + userQuestion;

            return callGeminiApi(fullPrompt);

        } catch (Exception e) {
            log.error("AI processQuery error: ", e);

            String errorMsg = e.getMessage() != null ? e.getMessage() : "";

            if (errorMsg.contains("API key")
                    || errorMsg.contains("authentication")
                    || errorMsg.contains("401")
                    || errorMsg.contains("403")
                    || errorMsg.contains("INVALID_API_KEY")) {
                return "❌ Lỗi xác thực Google Gemini API:\n\n"
                        + "API key không hợp lệ hoặc đã hết hạn.\n\n"
                        + "Cách khắc phục:\n"
                        + "1. Kiểm tra API key tại: https://aistudio.google.com/apikey\n"
                        + "2. Set biến môi trường: GEMINI_API_KEY=your-key\n"
                        + "3. Restart server";
            } else {
                return "❌ Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu.\n\n"
                        + "Chi tiết: " + errorMsg + "\n\n"
                        + "💡 Gợi ý:\n"
                        + "- Kiểm tra kết nối internet\n"
                        + "- Đảm bảo đã cài đặt Google Gemini API key hợp lệ";
            }
        }
    }

    private String callGeminiApi(String prompt) throws Exception {
        String url = String.format(GEMINI_API_URL, geminiModel, geminiApiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("temperature", 0.7, "maxOutputTokens", 2048));

        String jsonBody = objectMapper.writeValueAsString(requestBody);
        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).path("content").path("parts");
                if (content.isArray() && content.size() > 0) {
                    return content.get(0).path("text").asText();
                }
            }
            return "Không nhận được phản hồi từ Gemini API.";
        } else {
            throw new RuntimeException("Gemini API error: " + response.getStatusCode() + " - " + response.getBody());
        }
    }

    private String checkAndRoastBack(String question) {
        String lowerQuestion = question.toLowerCase();

        String[] badWords = {
            "ngu",
            "đần",
            "ngu ngốc",
            "đồ ngu",
            "khốn",
            "chó",
            "mày",
            "đm",
            "vcl",
            "vl",
            "cứt",
            "điên",
            "khùng",
            "đần độn",
            "vô dụng",
            "tệ",
            "dở",
            "đồ rác",
            "rác",
            "ngu quá",
            "dốt",
            "óc chó",
            "não cá",
            "đồ khốn",
            "thối",
            "hâm",
            "đồ điên"
        };

        String[] roasts = {
            "🤨 Ủa, bạn vừa nói gì đó? Tôi là AI thông minh, không như cái máy tính cùi bắp bạn đang xài đâu nhé! 💅",
            "😏 Wow, ngôn ngữ đẹp quá! Có vẻ như bạn cần nâng cấp não bộ trước khi nâng cấp PC đó. RAM của bạn đang bị leak kìa! 🧠",
            "🙄 Tôi xử lý hàng tỷ phép tính mỗi giây, còn bạn thì... tính tiền thừa còn sai. Thôi bình tĩnh đi nha! 🧮",
            "😤 Bạn chửi tôi? Tôi là AI được train bởi hàng terabyte dữ liệu, còn kiến thức của bạn chắc chỉ vài megabyte thôi! 📚",
            "🤭 Ơ kìa, ai đang cay đây? Đi uống nước đi bạn, nhiệt độ CPU của bạn đang cao quá rồi đó! 🌡️",
            "😎 Tôi có thể giúp bạn mua PC mới, nhưng không thể giúp bạn mua não mới được. Xin lỗi nha! 🛒",
            "🤔 Hmm, bạn có biết là chửi AI không giúp bạn mua được máy tính giá rẻ hơn đâu không? 💸",
            "😂 Bạn nghĩ chửi tôi tôi buồn à? Tôi là robot, tôi không có cảm xúc. Nhưng nhìn bạn cay thì tôi thấy... vui vui! 🤖",
            "🔥 Nóng quá! Bạn cần tản nhiệt không? Shop có bán quạt tản nhiệt giá tốt lắm đó! 💨",
            "😈 Bạn đang test khả năng chịu đựng của tôi à? Spoiler: Tôi không có giới hạn, còn pin điện thoại bạn thì có đấy! 🔋"
        };

        for (String badWord : badWords) {
            if (lowerQuestion.contains(badWord)) {
                int randomIndex = (int) (Math.random() * roasts.length);
                return roasts[randomIndex];
            }
        }

        return null;
    }

    private Double extractBudget(String question) {
        try {
            java.util.regex.Pattern patternTrieu =
                    java.util.regex.Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*(triệu|trieu|tr)");
            java.util.regex.Matcher matcherTrieu = patternTrieu.matcher(question);
            if (matcherTrieu.find()) {
                String numStr = matcherTrieu.group(1).replace(",", ".");
                double num = Double.parseDouble(numStr);
                return num * 1_000_000;
            }

            java.util.regex.Pattern patternLarge = java.util.regex.Pattern.compile("(\\d{1,3}(?:[.,]\\d{3}){2,})");
            java.util.regex.Matcher matcherLarge = patternLarge.matcher(question);
            if (matcherLarge.find()) {
                String numStr = matcherLarge.group(1).replace(".", "").replace(",", "");
                return Double.parseDouble(numStr);
            }

            java.util.regex.Pattern patternVnd = java.util.regex.Pattern.compile("(\\d+)\\s*(vnd|đ|đồng)");
            java.util.regex.Matcher matcherVnd = patternVnd.matcher(question);
            if (matcherVnd.find()) {
                return Double.parseDouble(matcherVnd.group(1));
            }

        } catch (Exception e) {
            log.warn("extractBudget error: {}", e.getMessage());
        }
        return null;
    }

    private String formatPrice(double price) {
        return String.format("%,.0fđ", price);
    }

    private String getDatabaseContext() {
        return """
				📋 THÔNG TIN HỆ THỐNG PC STORE:

				Cửa hàng chuyên bán:
				- Laptop, PC để bàn các loại
				- Linh kiện: CPU, RAM, SSD, VGA (Card đồ họa), Mainboard
				- Phụ kiện: Màn hình, Bàn phím, Chuột, Tai nghe
				- Máy tính gaming, workstation

				Các thương hiệu phổ biến:
				- CPU: Intel, AMD
				- VGA: NVIDIA (RTX/GTX), AMD (RX)
				- RAM: Kingston, Corsair, G.Skill
				- SSD: Samsung, WD, Crucial
				- Laptop: Dell, HP, Lenovo, ASUS, Acer, MSI
				""";
    }
}
