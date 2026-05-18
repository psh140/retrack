package com.retrack.controller;

import com.retrack.annotation.RequiredRole;
import com.retrack.service.ProjectService;
import com.retrack.vo.ApiResponse;
import com.retrack.vo.ProjectRequestVO;
import com.retrack.vo.StatusChangeRequestVO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * 과제 관리 API
 * - 목록/상세 조회: 로그인 사용자 전체 허용
 * - 등록/수정: RESEARCHER 이상
 * - 상태 변경: MANAGER 이상
 * - 삭제: ADMIN만
 * 예외 처리는 GlobalExceptionHandler에 위임 (try-catch 없음)
 *
 * @since 2026-04-28
 * @modified 2026-05-11 deleteProject에 userId 파라미터 추가 (활동 로그용)
 * @modified 2026-05-12 과제 검색 파라미터 추가
 * @modified 2026-05-12 페이지네이션 파라미터 추가
 */
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    /**
     * GET /api/projects
     * 과제 목록 조회 — 모든 파라미터 선택 사항, 미입력 시 전체 목록 반환
     *
     * @param keyword       과제명 부분 일치 (ILIKE)
     * @param status        승인 상태 (DRAFT/SUBMITTED/REVIEWING/APPROVED/REJECTED/IN_PROGRESS/COMPLETED)
     * @param userId        과제 신청자 ID
     * @param managerId     과제 담당자 ID
     * @param startDateFrom 시작일 범위 시작 (yyyy-MM-dd)
     * @param startDateTo   시작일 범위 끝 (yyyy-MM-dd)
     * @param endDateFrom   종료일 범위 시작 (yyyy-MM-dd)
     * @param endDateTo     종료일 범위 끝 (yyyy-MM-dd)
     * @param page          페이지 번호 (기본값 1)
     * @param size          페이지당 항목 수 (기본값 10, 허용값: 10/20/50)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getProjectList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long managerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDateTo,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        Map<String, Object> params = new HashMap<>();
        if (keyword != null && !keyword.isEmpty()) params.put("keyword", keyword);
        if (status != null && !status.isEmpty()) params.put("status", status);
        if (userId != null) params.put("userId", userId);
        if (managerId != null) params.put("managerId", managerId);
        if (startDateFrom != null) params.put("startDateFrom", startDateFrom);
        if (startDateTo != null) params.put("startDateTo", startDateTo);
        if (endDateFrom != null) params.put("endDateFrom", endDateFrom);
        if (endDateTo != null) params.put("endDateTo", endDateTo);

        return ResponseEntity.ok(ApiResponse.ok("과제 목록 조회 성공", projectService.getProjectList(params, page, size)));
    }

    /**
     * GET /api/projects/{id}
     * 과제 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("과제 상세 조회 성공", projectService.getProject(id)));
    }

    /**
     * POST /api/projects
     * 과제 등록 (RESEARCHER 이상)
     * 등록자 ID는 JWT에서 추출한 request attribute 사용
     */
    @RequiredRole("RESEARCHER")
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createProject(@RequestBody ProjectRequestVO req,
                                                        HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long projectId = projectService.createProject(req, userId);
        return ResponseEntity.ok(ApiResponse.ok("과제가 등록되었습니다.", projectId));
    }

    /**
     * PUT /api/projects/{id}
     * 과제 수정 (RESEARCHER 이상)
     * RESEARCHER는 본인 과제만 수정 가능, MANAGER/ADMIN은 모든 과제 수정 가능
     */
    @RequiredRole("RESEARCHER")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateProject(@PathVariable Long id,
                                                        @RequestBody ProjectRequestVO req,
                                                        HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        projectService.updateProject(id, req, userId, role);
        return ResponseEntity.ok(ApiResponse.ok("과제가 수정되었습니다."));
    }

    /**
     * PATCH /api/projects/{id}/status
     * 과제 상태 변경 (MANAGER 이상)
     * Body: { "status": "REVIEWING", "comment": "검토 시작" }
     * 상태 변경 + 이력 저장 + 알림 기록이 하나의 트랜잭션으로 처리됨
     */
    @RequiredRole("MANAGER")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<?>> changeStatus(@PathVariable Long id,
                                                       @RequestBody StatusChangeRequestVO req,
                                                       HttpServletRequest request) {
        Long changedBy = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        projectService.changeStatus(id, req.getStatus(), req.getComment(), changedBy, role);
        return ResponseEntity.ok(ApiResponse.ok("과제 상태가 변경되었습니다."));
    }

    /**
     * DELETE /api/projects/{id}
     * 과제 삭제 (ADMIN만)
     * userId를 추출하여 활동 로그 기록에 사용
     */
    @RequiredRole("ADMIN")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteProject(@PathVariable Long id,
                                                        HttpServletRequest request) throws IOException {
        Long userId = (Long) request.getAttribute("userId");
        projectService.deleteProject(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("과제가 삭제되었습니다."));
    }

    /**
     * GET /api/projects/{id}/history
     * 과제 상태 변경 이력 조회
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<?>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("이력 조회 성공", projectService.getHistory(id)));
    }
}
