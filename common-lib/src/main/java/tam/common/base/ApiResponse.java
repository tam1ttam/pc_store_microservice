package tam.common.base;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * Unified API success response model.
 * Replaces ResponseSuccess, ResponseMessage, and other success response models.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private Integer status;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(HttpStatus httpStatus, String message, T data) {
        return ApiResponse.<T>builder()
                .status(httpStatus.value())
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(HttpStatus httpStatus, String message) {
        return ApiResponse.<T>builder()
                .status(httpStatus.value())
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(data)
                .build();
    }
}
