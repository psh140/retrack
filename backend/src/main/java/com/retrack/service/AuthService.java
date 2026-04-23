package com.retrack.service;

import com.retrack.exception.BadRequestException;
import com.retrack.exception.UnauthorizedException;
import com.retrack.mapper.AuthMapper;
import com.retrack.util.JwtUtil;
import com.retrack.vo.LoginRequestVO;
import com.retrack.vo.RegisterRequestVO;
import com.retrack.vo.UserVO;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 인증 비즈니스 로직
 * - 회원가입: 이메일 중복 확인 → 비밀번호 BCrypt 암호화 → DB 저장
 * - 로그인: 이메일 조회 → 비밀번호 검증 → JWT 발급
 */
@Service
public class AuthService {

    private final AuthMapper authMapper;
    private final JwtUtil jwtUtil;

    // BCryptPasswordEncoder는 상태가 없으므로 직접 생성
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(AuthMapper authMapper, JwtUtil jwtUtil) {
        this.authMapper = authMapper;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 회원가입
     * 기본 권한은 VIEWER로 설정됨 (DB 컬럼 기본값)
     */
    public void register(RegisterRequestVO request) {
        // 이메일 중복 확인
        if (authMapper.existsByEmail(request.getEmail())) {
            throw new BadRequestException("이미 사용 중인 이메일입니다.");
        }

        UserVO user = new UserVO();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // 비밀번호 암호화
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        authMapper.insertUser(user);
    }

    /**
     * 로그인
     * @return token, userId, username, role 포함한 Map
     */
    public Map<String, Object> login(LoginRequestVO request) {
        UserVO user = authMapper.findByEmail(request.getEmail());

        // 이메일 미존재 or 비밀번호 불일치 → 동일한 메시지로 처리 (보안상 구분 X)
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        // JWT 발급
        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getUserId());
        result.put("username", user.getUsername());
        result.put("role", user.getRole());

        return result;
    }
}
