package tam.common.constants.dto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IntrospectRequest {
    private String token;
}