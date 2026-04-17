package com.retrack.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retrack.annotation.RequiredRole;
import com.retrack.util.JwtUtil;
import com.retrack.vo.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * JWT 인증/인가 인터셉터
 *
 * 처리 흐름:
 * 1. Authorization 헤더에서 Bearer 토큰 추출
 * 2. 토큰 없음 또는 유효하지 않음 → 401 반환
 * 3. 핸들러 메서드의 @RequiredRole 어노테이션 확인
 * 4. 권한 부족 → 403 반환
 * 5. 통과 시 request attribute에 userId, role 저장
 *
 * 적용 범위: /api/** (단, /api/auth/** 제외 — spring-mvc.xml에서 설정)
 */
@Component
public class JwtInterceptor implements HandlerInterceptor {

    // 권한 계층 (낮은 순 → 높은 순)
    private static final List<String> ROLE_HIERARCHY = Arrays.asList(
            "VIEWER", "RESEARCHER", "MANAGER", "ADMIN"
    );

    @Autowired
    private JwtUtil jwtUtil;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        // 핸들러 메서드가 아닌 경우(정적 리소스 등) 통과
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        // 1. Authorization 헤더 추출
        String token = extractToken(request);
        if (token == null) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "로그인이 필요합니다.");
            return false;
        }

        // 2. 토큰 유효성 검사
        if (!jwtUtil.isValid(token)) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "유효하지 않거나 만료된 토큰입니다.");
            return false;
        }

        // 3. 토큰에서 사용자 정보 추출
        Long userId = jwtUtil.getUserId(token);
        String role = jwtUtil.getRole(token);

        // 4. @RequiredRole 어노테이션으로 권한 체크
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequiredRole requiredRole = handlerMethod.getMethodAnnotation(RequiredRole.class);

        if (requiredRole != null && !hasPermission(role, requiredRole.value())) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "접근 권한이 없습니다.");
            return false;
        }

        // 5. 컨트롤러에서 사용할 수 있도록 request attribute에 저장
        request.setAttribute("userId", userId);
        request.setAttribute("role", role);

        return true;
    }

    /**
     * Authorization: Bearer {token} 헤더에서 토큰 추출
     * 헤더가 없거나 형식이 맞지 않으면 null 반환
     */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    /**
     * 사용자 권한이 요구 권한 이상인지 확인
     * 권한 계층: VIEWER < RESEARCHER < MANAGER < ADMIN
     */
    private boolean hasPermission(String userRole, String requiredRole) {
        int userLevel = ROLE_HIERARCHY.indexOf(userRole);
        int requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
        if (userLevel == -1 || requiredLevel == -1) {
            return false;
        }
        return userLevel >= requiredLevel;
    }

    /**
     * JSON 에러 응답 전송
     */
    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
                objectMapper.writeValueAsString(ApiResponse.fail(message))
        );
    }
}
