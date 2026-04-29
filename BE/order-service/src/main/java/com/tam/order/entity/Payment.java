package com.devteria.order.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "payments")
public class Payment {
    @Id
    @Field("_id")
    @JsonSerialize(using = ToStringSerializer.class)
    ObjectId id;

    String paymentId;
    String userId;
    String paymentMethod;
    String orderId;
    Double amount;
    String currency;
    String description;
    String status;
}
