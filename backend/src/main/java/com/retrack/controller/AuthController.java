package com.retrack.controller;

import com.retrack.service.AuthService;
import com.retrack.vo.ApiResponse;
import com.retrack.vo.LoginRequestVO;
import com.retrack.vo.RegisterRequestVO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 API 컨트롤러
 *
 * POST /api/auth/register  회원가입 (권한 없음)
 * POST /api/auth/login     로그인 → JWT 발급 (권한 없음)
 * POST /api/auth/logout    로그아웃 (클라이언트에서 토큰 삭제)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 회원가입
     * 성공 시 201 대신 200 반환 (단순화)
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@RequestBody RegisterRequestVO request) {
        try {
            authService.register(request);
            return ResponseEntity.ok(ApiResponse.ok("회원가입이 완료되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    /**
     * 로그인
     * 성공 시 data에 token, userId, username, role 반환
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@RequestBody LoginRequestVO request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("로그인 성공", authService.login(request)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    /**
     * 로그아웃
     * JWT는 서버에 상태를 저장하지 않으므로 클라이언트에서 토큰을 삭제하는 방식으로 처리
     * 서버는 로그아웃 성공 응답만 반환
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("로그아웃 되었습니다."));
    }
}
