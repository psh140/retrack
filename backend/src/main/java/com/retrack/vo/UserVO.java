package com.retrack.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * users 테이블 매핑 VO
 * 권한(role): VIEWER / RESEARCHER / MANAGER / ADMIN
 *
 * @since 2026-04-16
 */
@Getter
@Setter
public class UserVO {

    private Long userId;            // PK
    private String username;        // 사용자 이름
    private String password;        // BCrypt 암호화된 비밀번호
    private String email;           // 로그인 ID로 사용 (UNIQUE)
    private String phone;           // 연락처 (카카오 알림톡 발송용)
    private String role;            // 권한 (기본값: VIEWER)
    private boolean isVerified;     // 연구자 인증 여부
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime verifiedAt;   // 연구자 인증 승인 일시

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;    // 계정 생성 일시

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;    // 계정 수정 일시
}
