package com.retrack.controller;

import com.retrack.service.AuthService;
import com.retrack.vo.ApiResponse;
import com.retrack.vo.LoginRequestVO;
import com.retrack.vo.RegisterRequestVO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

/**
 * 인증 API (회원가입 / 로그인 / 로그아웃)
 *
 * @since 2026-04-16
 * @modified 2026-05-11 로그아웃 시 userId 추출 후 활동 로그 기록
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** 회원가입 */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@RequestBody RegisterRequestVO request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("회원가입이 완료되었습니다."));
    }

    /** 로그인 — 성공 시 JWT 토큰 반환 */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@RequestBody LoginRequestVO request) {
        return ResponseEntity.ok(ApiResponse.ok("로그인 성공", authService.login(request)));
    }

    /**
     * 로그아웃
     * JwtInterceptor가 토큰을 검증하고 userId를 request attribute에 저장함
     * userId를 추출하여 LOGOUT 활동 로그 기록
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId != null) {
            authService.logout(userId);
        }
        return ResponseEntity.ok(ApiResponse.ok("로그아웃 되었습니다."));
    }
}
