package com.tam.file.service.impl;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GeminiResponse {
    List<Candidate> candidates;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Candidate {
        Content content;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Content {
        List<Part> parts;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Part {
        String text;
    }
}
