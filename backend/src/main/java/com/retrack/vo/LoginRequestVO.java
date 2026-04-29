package com.retrack.vo;

import lombok.Getter;
import lombok.Setter;

/**
 * 로그인 요청 바디 VO
 * POST /api/auth/login
 *
 * @since 2026-04-16
 */
@Getter
@Setter
public class LoginRequestVO {

    private String email;       // 이메일 (로그인 ID)
    private String password;    // 비밀번호 (평문, 서버에서 BCrypt 검증)
}
