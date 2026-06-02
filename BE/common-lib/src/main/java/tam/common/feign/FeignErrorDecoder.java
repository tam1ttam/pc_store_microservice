package tam.common.feign;

import com.fasterxml.jackson.databind.ObjectMapper;
import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tam.common.exception.AppException;
import tam.common.exception.ErrorCode;

import java.io.InputStream;

/**
 * Custom Feign error decoder for handling errors from inter-service calls.
 * Converts HTTP error responses to AppException.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class FeignErrorDecoder implements ErrorDecoder {

    private final ObjectMapper objectMapper;

    @Override
    public Exception decode(String methodKey, Response response) {
        log.error("Feign client error - Method: {}, Status: {}", methodKey, response.status());

        try {
            if (response.body() != null) {
                InputStream body = response.body().asInputStream();
                ErrorResponse errorResponse = objectMapper.readValue(body, ErrorResponse.class);

                // Try to map to ErrorCode if available
                try {
                    ErrorCode errorCode = ErrorCode.valueOf(errorResponse.getMessage());
                    return new AppException(errorCode);
                } catch (IllegalArgumentException e) {
                    // If error message doesn't match any ErrorCode, use UNCATEGORIZED_EXCEPTION
                    return new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
                }
            }
        } catch (Exception e) {
            log.error("Error decoding Feign error response", e);
        }

        return new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
    }

    /**
     * Error response structure from other services
     */
    static class ErrorResponse {
        private int code;
        private String message;
        private Object result;

        public int getCode() {
            return code;
        }

        public void setCode(int code) {
            this.code = code;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Object getResult() {
            return result;
        }

        public void setResult(Object result) {
            this.result = result;
        }
    }
}
