package tam.common.exception;

/**
 * Custom exception for access denied scenarios.
 * Renamed from AccessDeniedException to avoid conflict with Spring Security's
 * AccessDeniedException.
 */
public class CustomAccessDeniedException extends RuntimeException {
    public CustomAccessDeniedException(String message) {
        super(message);
    }
}
