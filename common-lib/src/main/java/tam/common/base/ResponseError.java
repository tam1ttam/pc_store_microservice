package tam.common.base;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.util.Date;

/**
 * @deprecated Use {@link tam.common.exception.ApiErrorResponse} instead.
 *             This class has been replaced with a unified error response model.
 */
@Deprecated(since = "1.0.0", forRemoval = true)
@Getter
@Builder
public class ResponseError {
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date timestamp;
    private Integer status;
    private String error;
    private String message;
    private String path;
}
