package tam.common.utils;

import tam.common.exception.InvalidParamException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Utility class for date and time formatting operations.
 * Provides methods to format and parse LocalDate and LocalDateTime objects.
 */
public class DateUtils {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");
    private static final String DEFAULT_TIMESTAMP_PATTERN = "dd-MM-yyyy_HH-mm-ss";

    private DateUtils() {
        // Utility class - no instantiation
    }

    // ===== LocalDate Methods =====

    /**
     * Formats a LocalDate to string with pattern "dd/MM/yyyy".
     */
    public static String formatDate(LocalDate date) {
        if (date == null) {
            return "";
        }
        return date.format(DATE_FORMATTER);
    }

    /**
     * Parses a string to LocalDate with pattern "dd/MM/yyyy".
     */
    public static LocalDate convertStringToLocalDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            throw new InvalidParamException("Date string cannot be null or blank");
        }
        try {
            return LocalDate.parse(dateStr, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new InvalidParamException("Invalid date format. Expected format: dd/MM/yyyy");
        }
    }

    // ===== LocalDateTime Methods =====

    /**
     * Formats a LocalDateTime to string with pattern "HH:mm dd/MM/yyyy".
     */
    public static String formatLocalDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }
        return dateTime.format(DATE_TIME_FORMATTER);
    }

    /**
     * Parses a string to LocalDateTime with pattern "HH:mm dd/MM/yyyy".
     */
    public static LocalDateTime convertStringToLocalDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isBlank()) {
            throw new InvalidParamException("DateTime string cannot be null or blank");
        }
        try {
            return LocalDateTime.parse(dateTimeStr, DATE_TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new InvalidParamException("Invalid date time format. Expected format: HH:mm dd/MM/yyyy");
        }
    }

    /**
     * Formats a LocalDateTime to timestamp string with pattern
     * "dd-MM-yyyy_HH-mm-ss".
     */
    public static String formatTimestamp(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }
        return formatWithPattern(dateTime, DEFAULT_TIMESTAMP_PATTERN);
    }

    /**
     * Formats a LocalDateTime with a custom pattern.
     */
    public static String formatWithPattern(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) {
            return "";
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return dateTime.format(formatter);
    }
}
