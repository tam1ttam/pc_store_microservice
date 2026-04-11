package tam.common.exception;

/**
 * Exception thrown when user is not authenticated (401 Unauthorized).
 */
public class UnauthenticatedException extends RuntimeException {
    public UnauthenticatedException(String message) {
        super(message);
    }
}
