package tam.common.exception;

/**
 * Exception thrown when an invalid file type is provided (400 Bad Request).
 */
public class InvalidFileTypeException extends RuntimeException {
    public InvalidFileTypeException(String message) {
        super(message);
    }
}
