package com.retrack.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * JWT 토큰 생성 및 검증 유틸리티
 *
 * 토큰 구조:
 * - subject: userId
 * - claim "email": 이메일
 * - claim "role": 권한 (VIEWER / RESEARCHER / MANAGER / ADMIN)
 * - 만료: 발급 후 30분
 *
 * 사용처:
 * - 로그인 성공 시 토큰 발급 (AuthService)
 * - 요청마다 토큰 검증 (JwtInterceptor - 추후 구현)
 *
 * @since 2026-04-16
 */
@Component
public class JwtUtil {

    // 토큰 만료 시간: 30분
    private static final long EXPIRATION_MS = 1000L * 60 * 30;

    private final Key key;

    public JwtUtil() {
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("환경변수 JWT_SECRET이 설정되지 않았거나 32자 미만입니다.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * JWT 토큰 생성
     * @param userId 사용자 ID (subject)
     * @param email  이메일
     * @param role   권한
     * @return 서명된 JWT 문자열
     */
    public String generateToken(Long userId, String email, String role) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 토큰에서 Claims(페이로드) 추출
     * 토큰이 유효하지 않으면 JwtException 발생
     */
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 토큰 유효성 검사
     * @return 유효하면 true, 만료/변조/형식오류면 false
     */
    public boolean isValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /** 토큰에서 userId 추출 */
    public Long getUserId(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }

    /** 토큰에서 role 추출 */
    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }
}
