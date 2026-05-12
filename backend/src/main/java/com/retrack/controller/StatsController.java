package com.retrack.controller;

import com.retrack.annotation.RequiredRole;
import com.retrack.service.StatsService;
import com.retrack.vo.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 통계 API
 * 모든 엔드포인트는 ADMIN 전용이며 집계 데이터를 읽기 전용으로 제공한다.
 * 예외 처리는 GlobalExceptionHandler에 위임 (try-catch 없음)
 *
 * @since 2026-05-12
 */
@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    /**
     * GET /api/stats/projects/status
     * 과제 상태별 건수 조회 (ADMIN 전용)
     * 응답 예시: { "PENDING": 3, "IN_PROGRESS": 5, "COMPLETED": 2 }
     */
    @RequiredRole("ADMIN")
    @GetMapping("/projects/status")
    public ResponseEntity<ApiResponse<?>> getProjectStatusStats() {
        return ResponseEntity.ok(
                ApiResponse.ok("과제 상태별 통계 조회 성공", statsService.getProjectStatusStats())
        );
    }

    /**
     * GET /api/stats/budget/category
     * 연구비 카테고리별 합계 조회 (ADMIN 전용)
     * 응답 예시: { "PERSONNEL": 1000000, "TRAVEL": 500000, "total": 1500000 }
     */
    @RequiredRole("ADMIN")
    @GetMapping("/budget/category")
    public ResponseEntity<ApiResponse<?>> getBudgetCategoryStats() {
        return ResponseEntity.ok(
                ApiResponse.ok("연구비 카테고리별 통계 조회 성공", statsService.getBudgetCategoryStats())
        );
    }

    /**
     * GET /api/stats/budget/burnrate
     * 과제별 연구비 소진 현황 조회 (ADMIN 전용)
     * 응답 예시: [{ "projectId": 1, "title": "과제명", "budgetTotal": 5000000,
     *              "budgetUsed": 1500000, "burnRate": 30.0 }, ...]
     */
    @RequiredRole("ADMIN")
    @GetMapping("/budget/burnrate")
    public ResponseEntity<ApiResponse<?>> getBudgetBurnrate() {
        return ResponseEntity.ok(
                ApiResponse.ok("연구비 소진 현황 조회 성공", statsService.getBudgetBurnrate())
        );
    }

    /**
     * GET /api/stats/notifications/monthly
     * 월별 알림 발송 건수 조회 (ADMIN 전용)
     * 응답 예시: [{ "month": "2026-04", "count": 12 }, { "month": "2026-05", "count": 7 }]
     */
    @RequiredRole("ADMIN")
    @GetMapping("/notifications/monthly")
    public ResponseEntity<ApiResponse<?>> getNotificationsMonthly() {
        return ResponseEntity.ok(
                ApiResponse.ok("월별 알림 발송 통계 조회 성공", statsService.getNotificationsMonthly())
        );
    }
}
