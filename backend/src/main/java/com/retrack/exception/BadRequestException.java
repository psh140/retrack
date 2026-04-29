package com.retrack.exception;

/**
 * 잘못된 요청 예외 (HTTP 400)
 *
 * @since 2026-04-23
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
