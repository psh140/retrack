package com.retrack.exception;

/**
 * 리소스 미존재 예외 (HTTP 404)
 *
 * @since 2026-04-23
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
