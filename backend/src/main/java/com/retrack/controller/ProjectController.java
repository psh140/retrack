package com.retrack.controller;

import com.retrack.annotation.RequiredRole;
import com.retrack.service.ProjectService;
import com.retrack.vo.ApiResponse;
import com.retrack.vo.ProjectRequestVO;
import com.retrack.vo.StatusChangeRequestVO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * 과제 관리 API
 * - 목록/상세 조회: 로그인 사용자 전체 허용
 * - 등록/수정: RESEARCHER 이상
 * - 상태 변경: MANAGER 이상
 * - 삭제: ADMIN만
 * 예외 처리는 GlobalExceptionHandler에 위임 (try-catch 없음)
 *
 * @since 2026-04-28
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
     * 전체 과제 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getProjectList() {
        return ResponseEntity.ok(ApiResponse.ok("과제 목록 조회 성공", projectService.getProjectList()));
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
        projectService.changeStatus(id, req.getStatus(), req.getComment(), changedBy);
        return ResponseEntity.ok(ApiResponse.ok("과제 상태가 변경되었습니다."));
    }

    /**
     * DELETE /api/projects/{id}
     * 과제 삭제 (ADMIN만)
     */
    @RequiredRole("ADMIN")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteProject(@PathVariable Long id) throws IOException {
        projectService.deleteProject(id);
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
