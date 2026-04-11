package tam.common.exception;

/**
 * Exception thrown when invalid parameters are provided (400 Bad Request).
 */
public class InvalidParamException extends RuntimeException {
    public InvalidParamException(String message) {
        super(message);
    }
}
