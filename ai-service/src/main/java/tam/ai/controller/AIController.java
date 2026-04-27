package tam.ai.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Slf4j
public class AIController {

    @Autowired
    private AIService aiService;

    /**
     * API endpoint để xử lý câu hỏi từ người dùng
     */
    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askQuestion(@RequestBody Map<String, String> request) {
        try {
            // Log authentication info
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info(
                    "AI Ask - User: {}, Authenticated: {}",
                    auth != null ? auth.getName() : "null",
                    auth != null ? auth.isAuthenticated() : false);

            String question = request.get("question");

            if (question == null || question.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Câu hỏi không được để trống"));
            }

            String answer = aiService.processQuery(question);

            Map<String, String> response = new HashMap<>();
            response.put("answer", answer);
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("AI Ask Error: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Có lỗi xảy ra: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * API endpoint để lấy thống kê nhanh
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, String>> getStats() {
        try {
            String stats = aiService.processQuery("Cho tôi biết thống kê tổng quan về hệ thống");
            return ResponseEntity.ok(Map.of("stats", stats, "status", "success"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage(), "status", "error"));
        }
    }
}