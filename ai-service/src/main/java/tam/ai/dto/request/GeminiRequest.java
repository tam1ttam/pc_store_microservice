package tam.ai.dto.request;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GeminiRequest {
    private List<Content> contents;

    @Data
    @Builder
    public static class Content {
        private List<Part> parts;
    }

    @Data
    @Builder
    public static class Part {
        private String text;
        private InlineData inlineData;
    }

    @Data
    @Builder
    public static class InlineData {
        private String mimeType;
        private String data;
    }
}
