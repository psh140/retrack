package com.retrack.service;

import com.retrack.exception.UnauthorizedException;
import com.retrack.mapper.AuthMapper;
import com.retrack.util.JwtUtil;
import com.retrack.vo.LoginRequestVO;
import com.retrack.vo.UserVO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * AuthService 단위 테스트
 * BCryptPasswordEncoder는 AuthService 내부에서 직접 생성되므로 실제 인스턴스가 동작한다.
 * 따라서 로그인 비밀번호 검증은 실제 BCrypt 해시를 UserVO에 세팅하여 테스트한다.
 *
 * @since 2026-05-14
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthMapper authMapper;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    /** 존재하지 않는 이메일 입력 시 UnauthorizedException 발생 (user == null 분기) */
    @Test
    void login_이메일없음_UnauthorizedException() {
        LoginRequestVO request = new LoginRequestVO();
        request.setEmail("nobody@test.com");
        request.setPassword("any");

        when(authMapper.findByEmail("nobody@test.com")).thenReturn(null);

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    /** 틀린 비밀번호 입력 시 UnauthorizedException 발생 */
    @Test
    void login_비밀번호불일치_UnauthorizedException() {
        String encoded = new BCryptPasswordEncoder().encode("correct");

        UserVO user = new UserVO();
        user.setUserId(1L);
        user.setEmail("user@test.com");
        user.setPassword(encoded);
        user.setRole("RESEARCHER");

        LoginRequestVO request = new LoginRequestVO();
        request.setEmail("user@test.com");
        request.setPassword("wrong");

        when(authMapper.findByEmail("user@test.com")).thenReturn(user);

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    /** 올바른 자격증명 입력 시 token·userId·role 포함 Map 반환 */
    @Test
    void login_성공_토큰포함Map반환() {
        String encoded = new BCryptPasswordEncoder().encode("correct");

        UserVO user = new UserVO();
        user.setUserId(1L);
        user.setEmail("user@test.com");
        user.setPassword(encoded);
        user.setRole("RESEARCHER");

        LoginRequestVO request = new LoginRequestVO();
        request.setEmail("user@test.com");
        request.setPassword("correct");

        when(authMapper.findByEmail("user@test.com")).thenReturn(user);
        when(jwtUtil.generateToken(1L, "user@test.com", "RESEARCHER")).thenReturn("mock-token");

        Map<String, Object> result = authService.login(request);

        assertNotNull(result);
        assertEquals("mock-token", result.get("token"));
        assertEquals(1L, result.get("userId"));
        assertEquals("RESEARCHER", result.get("role"));
    }
}
