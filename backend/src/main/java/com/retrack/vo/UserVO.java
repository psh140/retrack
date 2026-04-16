package com.retrack.vo;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * users 테이블 매핑 VO
 * 권한(role): VIEWER / RESEARCHER / MANAGER / ADMIN
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
    private LocalDateTime verifiedAt;   // 연구자 인증 승인 일시
    private LocalDateTime createdAt;    // 계정 생성 일시
    private LocalDateTime updatedAt;    // 계정 수정 일시
}
