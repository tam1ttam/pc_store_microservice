package tam.common.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * @deprecated Use {@link tam.common.base.ApiResponse} instead.
 *             This class has been replaced with a unified response model.
 */
@Deprecated(since = "1.0.0", forRemoval = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseMessage {
    private int code;
    private String message;
    private HttpStatus status;
    private Object data;
}
