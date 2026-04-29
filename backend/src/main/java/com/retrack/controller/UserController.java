package com.retrack.controller;

import com.retrack.annotation.RequiredRole;
import com.retrack.service.UserService;
import com.retrack.vo.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 사용자 관리 API
 * 모든 엔드포인트는 ADMIN 권한 필요
 * 예외 처리는 GlobalExceptionHandler에 위임 (try-catch 없음)
 *
 * @since 2026-04-28
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
     * 전체 사용자 목록 조회
     */
    @RequiredRole("ADMIN")
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getUserList() {
        return ResponseEntity.ok(ApiResponse.ok("사용자 목록 조회 성공", userService.getUserList()));
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
     */
    @RequiredRole("ADMIN")
    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<?>> updateRole(@PathVariable Long id,
                                                     @RequestBody Map<String, String> body) {
        userService.updateRole(id, body.get("role"));
        return ResponseEntity.ok(ApiResponse.ok("권한이 변경되었습니다."));
    }

    /**
     * PATCH /api/users/{id}/verify
     * 연구자 인증 승인 (is_verified = TRUE)
     */
    @RequiredRole("ADMIN")
    @PatchMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<?>> verifyUser(@PathVariable Long id) {
        userService.verifyUser(id);
        return ResponseEntity.ok(ApiResponse.ok("연구자 인증이 승인되었습니다."));
    }

    /**
     * DELETE /api/users/{id}
     * 사용자 삭제
     */
    @RequiredRole("ADMIN")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("사용자가 삭제되었습니다."));
    }
}
