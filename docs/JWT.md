# JWT 인증/인가 구조

## 관련 파일

| 파일 | 역할 |
|---|---|
| `util/JwtUtil.java` | 토큰 생성 · 검증 유틸리티 |
| `interceptor/JwtInterceptor.java` | 인증/인가 게이트 (모든 요청 진입점) |
| `annotation/RequiredRole.java` | 컨트롤러 메서드에 붙이는 권한 지정 어노테이션 |
| `webapp/WEB-INF/spring-mvc.xml` | 인터셉터 등록 설정 |

---

## 토큰 구조

HMAC-SHA256 서명, 만료 30분

```
eyJhbGciOiJIUzI1NiJ9   ← Header (알고리즘)
.
eyJzdWIiOiIxIiwi...    ← Payload (사용자 정보)
.
wBnQ_0E0jWRztMW...     ← Signature (서명)
```

**Payload 내용:**

```json
{
  "sub": "1",
  "email": "user@example.com",
  "role": "VIEWER",
  "iat": 1776391150,
  "exp": 1776392950
}
```

---

## 클래스 관계

```
[클라이언트 요청]
      │
      ▼
JwtInterceptor.preHandle()
      │  @Autowired
      ▼
JwtUtil  ─────────────────────────────────────────────────────────────┐
  isValid(token)     → 토큰 유효성 검사                                │
  getUserId(token)   → subject → Long                                 │
  getRole(token)     → claim "role" → String                          │
                                                                      │
AuthService.login()  ─── jwtUtil.generateToken() 호출하여 토큰 발급 ──┘

@RequiredRole  →  JwtInterceptor가 런타임에 읽어서 권한 체크
```

---

## JwtUtil 주요 메서드

### `generateToken(userId, email, role)`
로그인 성공 시 `AuthService`에서 호출. userId를 subject로, email/role을 claim으로 담아 서명된 JWT 문자열 반환.

### `getClaims(token)`
토큰 파싱 후 payload 반환. 서명 불일치·만료·형식 오류 시 `JwtException` 발생.

### `isValid(token)`
`getClaims()` 호출 후 예외 여부로 boolean 반환. 인터셉터에서 유효성 판단에 사용.

### `getUserId(token)` / `getRole(token)`
Claims에서 특정 값만 꺼내는 편의 메서드.

---

## JwtInterceptor 처리 흐름

```
요청 진입
  │
  ├─ HandlerMethod 아님 (정적 리소스 등)? ──────────────────→ 통과
  │
  ├─ Authorization: Bearer {token} 헤더 없음? ──────────────→ 401 로그인이 필요합니다.
  │
  ├─ jwtUtil.isValid(token) == false? ──────────────────────→ 401 유효하지 않거나 만료된 토큰입니다.
  │
  ├─ 메서드에 @RequiredRole 있고 권한 부족? ────────────────→ 403 접근 권한이 없습니다.
  │
  └─ request.setAttribute("userId", userId) 저장 ──────────→ 통과
     request.setAttribute("role", role)
```

---

## 권한 계층 및 체크 방식

```
VIEWER(0) < RESEARCHER(1) < MANAGER(2) < ADMIN(3)
```

`hasPermission()` 은 리스트 인덱스 비교로 처리:
- userRole 인덱스 ≥ requiredRole 인덱스 → 통과
- 미만 → 403

---

## 인터셉터 적용 범위 (spring-mvc.xml)

```xml
<mvc:interceptor>
    <mvc:mapping path="/api/**"/>
    <mvc:exclude-mapping path="/api/auth/**"/>   <!-- 로그인/회원가입 제외 -->
    <ref bean="jwtInterceptor"/>
</mvc:interceptor>
```

| 경로 | 인터셉터 적용 |
|---|---|
| `/api/auth/login` | X (제외) |
| `/api/auth/register` | X (제외) |
| `/api/auth/logout` | O |
| `/api/projects/**` | O |
| `/api/users/**` | O |
| 그 외 `/api/**` | O |

---

## 컨트롤러 사용 방법

### 로그인 필요 (권한 무관)
어노테이션 없이 작성하면 됨. 인터셉터 통과 후 `request attribute`에 사용자 정보 저장됨.

```java
@GetMapping("/api/projects")
public ApiResponse<?> getProjects(HttpServletRequest request) {
    Long userId = (Long) request.getAttribute("userId");
    String role  = (String) request.getAttribute("role");
}
```

### 특정 권한 이상만 허용
```java
@RequiredRole("RESEARCHER")   // RESEARCHER, MANAGER, ADMIN 접근 가능
@PostMapping("/api/projects")
public ApiResponse<?> createProject(...) { ... }

@RequiredRole("MANAGER")      // MANAGER, ADMIN 접근 가능
@PatchMapping("/api/projects/{id}/status")
public ApiResponse<?> changeStatus(...) { ... }

@RequiredRole("ADMIN")        // ADMIN만 접근 가능
@DeleteMapping("/api/projects/{id}")
public ApiResponse<?> deleteProject(...) { ... }
```
