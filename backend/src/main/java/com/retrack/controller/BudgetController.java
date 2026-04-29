package com.retrack.controller;

import com.retrack.annotation.RequiredRole;
import com.retrack.service.BudgetService;
import com.retrack.vo.ApiResponse;
import com.retrack.vo.BudgetRequestVO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

/**
 * 연구비 관리 API
 * - 목록/집계 조회: 로그인 사용자 전체 허용
 * - 등록/수정: RESEARCHER 이상
 * - 삭제: ADMIN만
 * 예외 처리는 GlobalExceptionHandler에 위임 (try-catch 없음)
 *
 * @since 2026-04-29
 */
@RestController
@RequestMapping("/api/projects/{id}/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    /**
     * GET /api/projects/{id}/budget
     * 연구비 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getBudgetList(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("연구비 목록 조회 성공", budgetService.getBudgetList(id)));
    }

    /**
     * POST /api/projects/{id}/budget
     * 연구비 등록 (RESEARCHER 이상)
     * used_by는 JWT에서 추출한 로그인 사용자 ID로 자동 설정
     */
    @RequiredRole("RESEARCHER")
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createBudget(@PathVariable Long id,
                                                       @RequestBody BudgetRequestVO req,
                                                       HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long budgetId = budgetService.createBudget(id, req, userId);
        return ResponseEntity.ok(ApiResponse.ok("연구비가 등록되었습니다.", budgetId));
    }

    /**
     * PUT /api/projects/{id}/budget/{bid}
     * 연구비 수정 — ADMIN 또는 과제 신청자(RESEARCHER)만 가능
     */
    @RequiredRole("RESEARCHER")
    @PutMapping("/{bid}")
    public ResponseEntity<ApiResponse<?>> updateBudget(@PathVariable Long id,
                                                       @PathVariable Long bid,
                                                       @RequestBody BudgetRequestVO req,
                                                       HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        budgetService.updateBudget(id, bid, req, userId, role);
        return ResponseEntity.ok(ApiResponse.ok("연구비가 수정되었습니다."));
    }

    /**
     * DELETE /api/projects/{id}/budget/{bid}
     * 연구비 삭제 (ADMIN만)
     */
    @RequiredRole("ADMIN")
    @DeleteMapping("/{bid}")
    public ResponseEntity<ApiResponse<?>> deleteBudget(@PathVariable Long id,
                                                       @PathVariable Long bid) {
        budgetService.deleteBudget(id, bid);
        return ResponseEntity.ok(ApiResponse.ok("연구비가 삭제되었습니다."));
    }

    /**
     * GET /api/projects/{id}/budget/summary
     * 카테고리별 연구비 집계 조회
     * 응답 예시: { "PERSONNEL": 1000000, "TRAVEL": 500000, "total": 1500000 }
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<?>> getBudgetSummary(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("연구비 집계 조회 성공", budgetService.getBudgetSummary(id)));
    }
}
