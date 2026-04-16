package com.retrack.vo;

import lombok.Getter;

/**
 * 공통 API 응답 래퍼 클래스
 * 모든 REST API 응답은 이 형식으로 반환됩니다.
 *
 * 응답 예시 (성공):
 * { "success": true, "message": "과제 등록 완료", "data": { ... } }
 *
 * 응답 예시 (실패):
 * { "success": false, "message": "권한이 없습니다.", "data": null }
 */
@Getter
public class ApiResponse<T> {

    private final boolean success;  // 요청 성공 여부
    private final String message;   // 응답 메시지
    private final T data;           // 응답 데이터 (없으면 null)

    private ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    /** 성공 응답 - 데이터 포함 */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /** 성공 응답 - 데이터 없음 (등록/수정/삭제 등) */
    public static <T> ApiResponse<T> ok(String message) {
        return new ApiResponse<>(true, message, null);
    }

    /** 실패 응답 */
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
