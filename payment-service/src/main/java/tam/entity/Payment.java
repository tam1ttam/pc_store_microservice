package tam.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

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
    private String userId;
    private String paymentMethod;
    private String orderId;
    private Double amount;
    private String currency;
    private String description;
    private String status;
}
