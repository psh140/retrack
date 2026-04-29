package com.retrack.exception;

/**
 * 인증/인가 실패 예외 (HTTP 401)
 *
 * @since 2026-04-23
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
