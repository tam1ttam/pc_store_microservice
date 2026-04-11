package tam.common.exception;

/**
 * Exception thrown when a conflict occurs (409 Conflict).
 * Typically used when attempting to create a resource that already exists.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
