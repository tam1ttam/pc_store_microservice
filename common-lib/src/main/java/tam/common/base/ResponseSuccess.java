package tam.common.base;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * @deprecated Use {@link ApiResponse} instead.
 *             This class has been replaced with a unified response model.
 */
@Deprecated(since = "1.0.0", forRemoval = true)
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseSuccess<T> {
    private final int status;
    private final String message;
    private final T data;

    public ResponseSuccess(HttpStatus httpStatus, String message, T data) {
        this.status = httpStatus.value();
        this.message = message;
        this.data = data;
    }

    public ResponseSuccess(HttpStatus httpStatus, String message) {
        this.status = httpStatus.value();
        this.message = message;
        this.data = null;
    }
}
