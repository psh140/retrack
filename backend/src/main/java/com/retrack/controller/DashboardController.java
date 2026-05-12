package com.retrack.controller;

import com.retrack.service.DashboardService;
import com.retrack.vo.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

/**
 * 대시보드 API
 * 로그인한 모든 사용자가 호출 가능 (@RequiredRole 없음)
 * JwtInterceptor가 /api/** 인증을 강제하므로 비로그인은 차단됨
 * role에 따라 역할별 요약 데이터를 반환한다
 * 예외 처리는 GlobalExceptionHandler에 위임 (try-catch 없음)
 *
 * @since 2026-05-12
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/dashboard
     * JWT에서 추출한 role과 userId를 기반으로 역할별 대시보드 데이터 반환
     */
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getDashboard(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(ApiResponse.ok("대시보드 조회 성공", dashboardService.getDashboard(role, userId)));
    }
}
