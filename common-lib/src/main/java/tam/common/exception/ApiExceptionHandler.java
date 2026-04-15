package tam.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.Date;
import java.util.List;

/**
 * Global exception handler for all REST endpoints.
 * Handles both custom exceptions and Spring framework exceptions.
 * Uses unified ApiErrorResponse model for all error responses.
 */
@RestControllerAdvice
@Slf4j
public class ApiExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFoundException(
            NotFoundException ex,
            HttpServletRequest request) {
        log.error("NotFoundException: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleBadRequestException(
            BadRequestException ex,
            HttpServletRequest request) {
        log.error("BadRequestException: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleConflictException(
            ConflictException ex,
            HttpServletRequest request) {
        log.error("ConflictException: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidParamException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidParamException(
            InvalidParamException ex,
            HttpServletRequest request) {
        log.error("InvalidParamException: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidFileTypeException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidFileTypeException(
            InvalidFileTypeException ex,
            HttpServletRequest request) {
        log.error("InvalidFileTypeException: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(UnauthenticatedException.class)
    public ResponseEntity<ApiErrorResponse> handleUnauthenticatedException(
            UnauthenticatedException ex,
            HttpServletRequest request) {
        log.error("UnauthenticatedException: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    @ExceptionHandler(CustomAccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleCustomAccessDeniedException(
            CustomAccessDeniedException ex,
            HttpServletRequest request) {
        log.error("CustomAccessDeniedException: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex,
            HttpServletRequest request) {
        log.error("AccessDeniedException: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request);
    }

    @ExceptionHandler(DuplicatedException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicatedException(
            DuplicatedException ex,
            HttpServletRequest request) {
        log.error("DuplicatedException: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(InternalServerErrorException.class)
    public ResponseEntity<ApiErrorResponse> handleInternalServerErrorException(
            InternalServerErrorException ex,
            HttpServletRequest request) {
        log.error("InternalServerErrorException: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();
        log.error("MethodArgumentNotValidException: {} | Root cause: {}", errors, getRootCause(ex));

        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(new Date())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Request validation failed")
                .fieldErrors(errors)
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleHandlerMethodValidationException(
            HandlerMethodValidationException ex,
            HttpServletRequest request) {
        List<String> errors = ex.getAllErrors().stream()
                .map(error -> {
                    if (error instanceof FieldError fieldError) {
                        return fieldError.getField() + ": " + fieldError.getDefaultMessage();
                    }
                    return error.getDefaultMessage();
                }).toList();
        log.error("HandlerMethodValidationException: {} | Root cause: {}", errors, getRootCause(ex));

        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(new Date())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Request validation failed")
                .fieldErrors(errors)
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request) {
        List<String> errors = ex.getConstraintViolations().stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .toList();
        log.error("ConstraintViolationException: {} | Root cause: {}", errors, getRootCause(ex));

        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(new Date())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Constraint violation")
                .fieldErrors(errors)
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {
        log.error("DataIntegrityViolationException: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Data integrity violation", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneralException(
            Exception ex,
            HttpServletRequest request) {
        log.error("Unhandled exception: {} | Root cause: {}", ex.getMessage(), getRootCause(ex));
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", request);
    }

    private ResponseEntity<ApiErrorResponse> buildErrorResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(new Date())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(request != null ? request.getRequestURI() : null)
                .build();

        return ResponseEntity.status(status).body(response);
    }

    private String getRootCause(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        return cause.getClass().getSimpleName() + ": " + cause.getMessage();
    }
}
