package tam.ai.service.impl;

import com.pc.store.server.dto.request.GeminiRequest;
import com.pc.store.server.dto.response.GeminiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isImageSafe(String base64Image) {
        try {
            log.info(base64Image);
            String cleanBase64 = base64Image;
            String mimeType = "image/jpeg"; // Mặc định

            // 1. Tự động phát hiện MimeType chuẩn từ chuỗi Base64
            if (base64Image.contains("data:image/")) {
                String header = base64Image.split(";")[0];
                mimeType = header.split(":")[1]; // Lấy "image/png", "image/webp", v.v.
                cleanBase64 = base64Image.split(",")[1];
            }

            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key="
                    + apiKey;

            // 2. Prompt rõ ràng hơn để tránh AI nói lan man
            String prompt = "Analyze this image strictly. Does it contain weapons, guns, or tobacco? "
                    + "Answer ONLY one word: 'SAFE' if none are present, 'UNSAFE' if any are present.";

            // Lưu ý: Đảm bảo class GeminiRequest của bạn hỗ trợ cấu trúc này
            GeminiRequest request = GeminiRequest.builder()
                    .contents(List.of(GeminiRequest.Content.builder()
                            .parts(List.of(
                                    GeminiRequest.Part.builder().text(prompt).build(),
                                    GeminiRequest.Part.builder()
                                            .inlineData(GeminiRequest.InlineData.builder()
                                                    .mimeType(mimeType) // Sử dụng mimeType động
                                                    .data(cleanBase64)
                                                    .build())
                                            .build()))
                            .build()))
                    .build();

            GeminiResponse response = restTemplate.postForObject(url, request, GeminiResponse.class);

            if (response != null && !response.getCandidates().isEmpty()) {
                // Lấy text trả về
                String resultText = response.getCandidates()
                        .get(0)
                        .getContent()
                        .getParts()
                        .get(0)
                        .getText();

                log.info("Gemini Raw Response: '{}'", resultText); // Log để debug xem AI thực sự nói gì

                // 3. Logic kiểm tra linh hoạt hơn (chứa SAFE và không chứa UNSAFE)
                if (resultText != null) {
                    String upperRes = resultText.trim().toUpperCase();
                    return upperRes.contains("SAFE") && !upperRes.contains("UNSAFE");
                }
            } else {
                log.warn("Gemini returned no candidates. Check default Safety Settings filter.");
            }
        } catch (Exception e) {
            log.error("Gemini API Error detected: ", e);
            // Fallback: Trong môi trường dev/test, có thể tạm return true để không block công việc nếu API lỗi
            // return true;
            return false;
        }
        return false;
    }
}
