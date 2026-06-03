package com.tam.chat.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "product_query_logs")
public class ProductQueryLog {
    @Id
    private String id;

    private String productId;
    private String userId;
    private java.time.Instant createdAt;
}
