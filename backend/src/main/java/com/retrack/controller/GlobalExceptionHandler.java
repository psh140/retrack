package com.retrack.controller;

import com.retrack.exception.BadRequestException;
import com.retrack.exception.NotFoundException;
import com.retrack.exception.UnauthorizedException;
import com.retrack.vo.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.IOException;

/**
 * 전역 예외 처리 핸들러
 * 커스텀 예외 → HTTP 상태 코드 매핑 (400 / 401 / 404 / 500)
 *
 * @since 2026-04-23
 * @modified 2026-05-09 IOException 핸들러 추가, 기존 핸들러 Javadoc 추가
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 잘못된 요청 파라미터 또는 비즈니스 규칙 위반 → 400 */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<?>> handleBadRequest(BadRequestException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(e.getMessage()));
    }

    /** 인증 실패 또는 권한 부족 → 401 */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<?>> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail(e.getMessage()));
    }

    /** 요청한 리소스를 찾을 수 없음 → 404 */
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail(e.getMessage()));
    }

    /** 업로드 파일 크기 초과 → 400 */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<?>> handleMaxUploadSize(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail("파일 크기가 허용 용량을 초과했습니다."));
    }

    /** 파일 저장·로드·삭제 중 I/O 오류 → 500 */
    @ExceptionHandler(IOException.class)
    public ResponseEntity<ApiResponse<?>> handleIOException(IOException e) {
        log.error("File I/O error occurred", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail("파일 처리 중 오류가 발생했습니다."));
    }

    /** 예상치 못한 모든 예외 → 500 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
        log.error("Unhandled exception occurred", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail("서버 오류가 발생했습니다."));
    }
}
