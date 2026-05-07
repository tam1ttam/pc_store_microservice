package com.tam.file.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.tam.file.service.ImageValidationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageValidationServiceImpl implements ImageValidationService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    private final RestTemplate restTemplate;

    @Override
    public boolean isImageSafe(String base64Image) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key not configured — skipping image validation, treating as safe");
            return true;
        }
        try {
            log.info("Validating image with Gemini API");

            String cleanBase64 = base64Image;
            String mimeType = "image/jpeg";

            if (base64Image.contains("data:image/")) {
                String header = base64Image.split(";")[0];
                mimeType = header.split(":")[1];
                cleanBase64 = base64Image.split(",")[1];
            }

            String url = "https://generativelanguage.googleapis.com/v1/models/" + model
                    + ":generateContent?key=" + apiKey;

            String prompt = "Analyze this image strictly. Does it contain weapons, guns, tobacco, or explicit content? "
                    + "Answer ONLY one word: 'SAFE' if none are present, 'UNSAFE' if any are present.";

            GeminiRequest request = GeminiRequest.builder()
                    .contents(List.of(GeminiRequest.Content.builder()
                            .parts(List.of(
                                    GeminiRequest.Part.builder().text(prompt).build(),
                                    GeminiRequest.Part.builder()
                                            .inlineData(GeminiRequest.InlineData.builder()
                                                    .mimeType(mimeType)
                                                    .data(cleanBase64)
                                                    .build())
                                            .build()))
                            .build()))
                    .build();

            GeminiResponse response = restTemplate.postForObject(url, request, GeminiResponse.class);

            if (response != null && !response.getCandidates().isEmpty()) {
                String resultText = response.getCandidates()
                        .get(0)
                        .getContent()
                        .getParts()
                        .get(0)
                        .getText();

                log.info("Gemini Response: '{}'", resultText);

                if (resultText != null) {
                    String upperRes = resultText.trim().toUpperCase();
                    return upperRes.contains("SAFE") && !upperRes.contains("UNSAFE");
                }
            } else {
                log.warn("Gemini returned no candidates. Check Safety Settings filter.");
            }
        } catch (Exception e) {
            log.error("Gemini API Error: ", e);
            return false;
        }
        return false;
    }
}
