package com.retrack.controller;

import com.retrack.annotation.RequiredRole;
import com.retrack.service.ActivityLogService;
import com.retrack.vo.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 활동 로그 API
 * - 전체 로그 조회: ADMIN만
 * - 특정 사용자 로그 조회: ADMIN만
 * 예외 처리는 GlobalExceptionHandler에 위임 (try-catch 없음)
 *
 * @since 2026-05-11
 */
@RestController
@RequestMapping("/api/logs")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    /**
     * GET /api/logs
     * 전체 활동 로그 목록 조회 (ADMIN만)
     */
    @RequiredRole("ADMIN")
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllLogs() {
        return ResponseEntity.ok(ApiResponse.ok("활동 로그 목록 조회 성공", activityLogService.getAll()));
    }

    /**
     * GET /api/logs/users/{id}
     * 특정 사용자의 활동 로그 목록 조회 (ADMIN만)
     * 존재하지 않는 사용자 ID 요청 시 404 응답
     */
    @RequiredRole("ADMIN")
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<?>> getUserLogs(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("사용자 활동 로그 조회 성공", activityLogService.getByUserId(id)));
    }
}
