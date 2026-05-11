package com.retrack.service;

import com.retrack.annotation.LogActivity;
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
 * - 로그인: 이메일 조회 → 비밀번호 검증 → JWT 발급 (활동 로그는 ActivityLogAspect가 처리)
 * - 로그아웃: 활동 로그 기록 (ActivityLogAspect가 처리)
 *
 * @since 2026-04-16
 * @modified 2026-05-11 로그인/로그아웃 활동 로그 @LogActivity AOP로 전환
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
        if (authMapper.existsByEmail(request.getEmail())) {
            throw new BadRequestException("이미 사용 중인 이메일입니다.");
        }

        UserVO user = new UserVO();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        authMapper.insertUser(user);
    }

    /**
     * 로그인
     * 성공 시 ActivityLogAspect가 반환값 Map의 "userId"를 추출하여 LOGIN 로그를 기록한다.
     *
     * @return token, userId, username, role 포함한 Map
     */
    @LogActivity(action = "LOGIN", userIdFromReturn = true)
    public Map<String, Object> login(LoginRequestVO request) {
        UserVO user = authMapper.findByEmail(request.getEmail());

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getUserId());
        result.put("username", user.getUsername());
        result.put("role", user.getRole());

        return result;
    }

    /**
     * 로그아웃
     * ActivityLogAspect가 userId 파라미터(index=0)를 사용하여 LOGOUT 로그를 기록한다.
     *
     * @param userId 로그아웃하는 사용자 ID
     */
    @LogActivity(action = "LOGOUT", userIdParam = 0)
    public void logout(Long userId) {
        // 로그 기록은 ActivityLogAspect에서 처리
    }
}
