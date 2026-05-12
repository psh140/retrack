package com.retrack.controller;

import com.retrack.annotation.RequiredRole;
import com.retrack.service.UserService;
import com.retrack.vo.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * 사용자 관리 API
 * 목록 조회: MANAGER 이상 / 상세 조회·권한변경·인증승인·삭제: ADMIN
 * 예외 처리는 GlobalExceptionHandler에 위임 (try-catch 없음)
 *
 * @since 2026-04-28
 * @modified 2026-05-11 권한변경/인증승인/삭제에 adminUserId 전달 (활동 로그용)
 * @modified 2026-05-12 getUserList MANAGER 이상으로 권한 완화, 검색 파라미터 추가
 * @modified 2026-05-12 페이지네이션 파라미터 추가
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users
     * 사용자 목록 조회 (MANAGER 이상) — 모든 파라미터 선택 사항
     *
     * @param keyword    사용자명 또는 이메일 부분 일치
     * @param role       권한 필터 (VIEWER/RESEARCHER/MANAGER/ADMIN)
     * @param isVerified 연구자 인증 승인 여부
     * @param page       페이지 번호 (기본값 1)
     * @param size       페이지당 항목 수 (기본값 10, 허용값: 10/20/50)
     */
    @RequiredRole("MANAGER")
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getUserList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isVerified,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        Map<String, Object> params = new HashMap<>();
        if (keyword != null && !keyword.isEmpty()) params.put("keyword", keyword);
        if (role != null && !role.isEmpty()) params.put("role", role);
        if (isVerified != null) params.put("isVerified", isVerified);

        return ResponseEntity.ok(ApiResponse.ok("사용자 목록 조회 성공", userService.getUserList(params, page, size)));
    }

    /**
     * GET /api/users/{id}
     * 특정 사용자 상세 조회
     */
    @RequiredRole("ADMIN")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("사용자 상세 조회 성공", userService.getUser(id)));
    }

    /**
     * PATCH /api/users/{id}/role
     * 사용자 권한 변경
     * Body: { "role": "RESEARCHER" }
     * adminUserId를 추출하여 활동 로그 기록에 사용
     */
    @RequiredRole("ADMIN")
    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<?>> updateRole(@PathVariable Long id,
                                                     @RequestBody Map<String, String> body,
                                                     HttpServletRequest request) {
        Long adminUserId = (Long) request.getAttribute("userId");
        userService.updateRole(id, body.get("role"), adminUserId);
        return ResponseEntity.ok(ApiResponse.ok("권한이 변경되었습니다."));
    }

    /**
     * PATCH /api/users/{id}/verify
     * 연구자 인증 승인 (is_verified = TRUE)
     * adminUserId를 추출하여 활동 로그 기록에 사용
     */
    @RequiredRole("ADMIN")
    @PatchMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<?>> verifyUser(@PathVariable Long id,
                                                     HttpServletRequest request) {
        Long adminUserId = (Long) request.getAttribute("userId");
        userService.verifyUser(id, adminUserId);
        return ResponseEntity.ok(ApiResponse.ok("연구자 인증이 승인되었습니다."));
    }

    /**
     * DELETE /api/users/{id}
     * 사용자 삭제
     * adminUserId를 추출하여 활동 로그 기록에 사용
     */
    @RequiredRole("ADMIN")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Long id,
                                                     HttpServletRequest request) {
        Long adminUserId = (Long) request.getAttribute("userId");
        userService.deleteUser(id, adminUserId);
        return ResponseEntity.ok(ApiResponse.ok("사용자가 삭제되었습니다."));
    }
}
