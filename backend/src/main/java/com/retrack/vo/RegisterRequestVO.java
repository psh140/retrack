package com.retrack.vo;

import lombok.Getter;
import lombok.Setter;

/**
 * 회원가입 요청 바디 VO
 * POST /api/auth/register
 */
@Getter
@Setter
public class RegisterRequestVO {

    private String username;    // 사용자 이름
    private String password;    // 비밀번호 (평문, 서버에서 BCrypt 암호화 후 저장)
    private String email;       // 이메일 (중복 불가)
    private String phone;       // 연락처 (선택)
}
