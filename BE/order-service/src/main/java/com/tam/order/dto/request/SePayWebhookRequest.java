package com.tam.order.dto.request;

import lombok.Data;

@Data
public class SePayWebhookRequest {
    private String transferType; // "in" or "out"
    private String content; // "PCSTORE123"
    private double transferAmount;
    private String transactionId;
    private String bankCode;
}
