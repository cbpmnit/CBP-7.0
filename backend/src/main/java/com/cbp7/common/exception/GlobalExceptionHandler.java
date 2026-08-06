package com.cbp7.common.exception;

import com.cbp7.common.response.ErrorResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.NOT_FOUND.value(), "Not Found", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFoundException(EntityNotFoundException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.NOT_FOUND.value(), "Not Found", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(DuplicateResourceException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "Bad Request", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ProfileIncompleteException.class)
    public ResponseEntity<ErrorResponse> handleProfileIncompleteException(ProfileIncompleteException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "Bad Request", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(RegistrationAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleRegistrationAlreadyExistsException(RegistrationAlreadyExistsException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.CONFLICT.value(), "Conflict", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(CbpRegistrationRequiredException.class)
    public ResponseEntity<ErrorResponse> handleCbpRegistrationRequiredException(CbpRegistrationRequiredException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "Bad Request", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(PaymentAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handlePaymentAlreadyExistsException(PaymentAlreadyExistsException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.CONFLICT.value(), "Conflict", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(BadGatewayException.class)
    public ResponseEntity<ErrorResponse> handleBadGatewayException(BadGatewayException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.BAD_GATEWAY.value(), "Bad Gateway", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
    }

    @ExceptionHandler(PhonePeBadRequestException.class)
    public ResponseEntity<ErrorResponse> handlePhonePeBadRequestException(PhonePeBadRequestException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "Bad Request", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler({
            PhonePeAuthenticationException.class,
            PhonePeResourceNotFoundException.class,
            PhonePeConnectionException.class,
            PhonePeGatewayException.class
    })
    public ResponseEntity<ErrorResponse> handlePhonePeGatewayExceptions(PhonePeException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.BAD_GATEWAY.value(), "Bad Gateway", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
    }

    @ExceptionHandler(PhonePeTimeoutException.class)
    public ResponseEntity<ErrorResponse> handlePhonePeTimeoutException(PhonePeTimeoutException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.GATEWAY_TIMEOUT.value(), "Gateway Timeout", "Payment initiation timed out", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT).body(response);
    }

    @ExceptionHandler({InvalidCredentialsException.class, BadCredentialsException.class, UsernameNotFoundException.class})
    public ResponseEntity<ErrorResponse> handleInvalidCredentialsException(Exception ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "Unauthorized", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler({UnauthorizedException.class, TokenExpiredException.class, InvalidTokenException.class, AuthenticationException.class})
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(Exception ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "Unauthorized", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler({ForbiddenException.class, AccessDeniedException.class})
    public ResponseEntity<ErrorResponse> handleForbiddenException(Exception ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.FORBIDDEN.value(), "Forbidden", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ErrorResponse response = ErrorResponse.validationError("Validation failed", errors, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation ->
                errors.put(violation.getPropertyPath().toString(), violation.getMessage())
        );
        ErrorResponse response = ErrorResponse.validationError("Validation failed", errors, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class, HttpMessageNotReadableException.class, MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleBadRequestException(Exception ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "Bad Request", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "Data Integrity Violation", "Database constraint violation occurred", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(ex.getStatusCode().value(), ex.getStatusCode().toString(), ex.getReason() != null ? ex.getReason() : ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(ex.getStatusCode()).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}", request.getRequestURI(), ex);
        ErrorResponse response = ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", "An unexpected error occurred", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
