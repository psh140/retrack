---
name: java-layer
description: >
  Retrack 백엔드의 Java 레이어(Controller, Service, Mapper 인터페이스, VO) 구현 스킬.
  java-implementer 에이전트가 이 스킬을 사용하여 Spring Framework 5.3.x 기반의 Java 파일을 작성한다.
  직접 호출보다 retrack-backend 오케스트레이터를 통해 호출되는 것이 일반적.
---

# Java 레이어 구현 가이드

## 1. Controller 구현 패턴

```java
/**
 * {도메인} 관련 REST API 엔드포인트를 제공하는 컨트롤러.
 */
@RestController
@RequestMapping("/api/{도메인}")
@Slf4j
public class {도메인}Controller {

    private final {도메인}Service {도메인소문자}Service;

    public {도메인}Controller({도메인}Service {도메인소문자}Service) {
        this.{도메인소문자}Service = {도메인소문자}Service;
    }

    /**
     * {도메인} 목록을 조회한다.
     */
    @GetMapping
    @RequiredRole("VIEWER")
    public ResponseEntity<ApiResponse<List<{도메인}VO>>> getList(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String userRole = (String) request.getAttribute("userRole");
        return ResponseEntity.ok(ApiResponse.success({도메인소문자}Service.getList(userId, userRole)));
    }
}
```

**핵심 규칙:**
- `(Long) request.getAttribute("userId")` — JwtInterceptor가 설정한 userId
- `(String) request.getAttribute("userRole")` — JwtInterceptor가 설정한 userRole
- try-catch 없음
- `ApiResponse.success(data)` 또는 `ApiResponse.success("메시지")` 반환

## 2. Service 구현 패턴

```java
/**
 * {도메인} 비즈니스 로직을 처리하는 서비스.
 */
@Service
@Slf4j
public class {도메인}Service {

    private final {도메인}Mapper {도메인소문자}Mapper;

    public {도메인}Service({도메인}Mapper {도메인소문자}Mapper) {
        this.{도메인소문자}Mapper = {도메인소문자}Mapper;
    }

    /**
     * {도메인} 목록을 조회한다.
     * ADMIN/MANAGER는 전체 조회, RESEARCHER/VIEWER는 본인 관련만 조회한다.
     */
    public List<{도메인}VO> getList(Long userId, String userRole) {
        log.debug("getList called: userId={}, userRole={}", userId, userRole);
        // ...
    }
}
```

**핵심 규칙:**
- `throw new BadRequestException("메시지")` — 잘못된 요청
- `throw new NotFoundException("메시지")` — 리소스 없음
- `throw new UnauthorizedException("메시지")` — 권한 없음
- `@Transactional` — 여러 Mapper 호출을 원자적으로 처리할 때

## 3. Mapper 인터페이스 패턴

```java
/**
 * {도메인} 테이블에 대한 MyBatis Mapper 인터페이스.
 */
@Mapper
public interface {도메인}Mapper {

    /** {도메인} 목록을 조회한다. */
    List<{도메인}VO> findAll();

    /** ID로 {도메인}을 조회한다. */
    {도메인}VO findById(Long id);

    /** {도메인}을 등록한다. */
    int insert({도메인}VO vo);
}
```

## 4. VO 구현 패턴

```java
/**
 * {테이블명} 테이블과 매핑되는 VO 클래스.
 */
@Getter
@Setter
public class {도메인}VO {

    private Long {도메인소문자}Id;
    private String title;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
```

## 5. 권한 체계

```
VIEWER(1) < RESEARCHER(2) < MANAGER(3) < ADMIN(4)
```

`@RequiredRole("MANAGER")` — MANAGER 이상 허용

## 6. 공통 응답 형식

```java
// 데이터 반환
ApiResponse.success(data)

// 메시지만 반환
ApiResponse.success("작업이 완료됐습니다")

// 에러 (GlobalExceptionHandler에서 자동 처리)
throw new BadRequestException("유효하지 않은 요청입니다");
```

## 7. Spring 설정 변경이 필요한 경우

| 상황 | 변경 파일 | 변경 내용 |
|------|----------|---------|
| 새 의존성 추가 | pom.xml | `<dependency>` 추가 |
| 새 빈 등록 | spring-mvc.xml | `<bean>` 추가 |
| 트랜잭션 추가 | spring-mvc.xml | `<tx:annotation-driven>` (이미 있음) |
| AOP 추가 | spring-mvc.xml | `<aop:aspectj-autoproxy/>` + pom.xml AspectJ 의존성 |
| 이메일 발송 | spring-mvc.xml | JavaMailSender 빈 (이미 있음) |
