# Retrack 백엔드

## 개발 규칙

### 패키지 구조
- `com.retrack.controller`: @RestController, @RequestMapping("/api/..."), GlobalExceptionHandler
- `com.retrack.service`: 비즈니스 로직, @Service
- `com.retrack.mapper`: MyBatis Mapper 인터페이스, @Mapper
- `com.retrack.vo`: VO/DTO 클래스
- `com.retrack.exception`: 커스텀 예외 클래스 (BadRequestException, UnauthorizedException, NotFoundException)

### 네이밍 규칙
- 클래스명: PascalCase (예: ProjectController)
- 메서드명: camelCase (예: getProjectList)
- 테이블 컬럼명: snake_case (예: project_id)
- API URL: kebab-case (예: /api/projects/{id}/status)

### 응답 형식
- 모든 API 응답은 JSON
- Content-Type: application/json; charset=UTF-8

### 주석 규칙
모든 Java 파일과 MyBatis XML 파일에 반드시 주석을 작성한다.

**Java 클래스/인터페이스**
- 클래스/인터페이스 상단에 Javadoc(`/** */`)으로 역할 설명
- 각 메서드에 한 줄 Javadoc(`/** */`) 또는 여러 줄 Javadoc 작성
- 비즈니스 규칙, 예외 발생 조건, 주의사항은 메서드 주석에 명시
- 신규 파일: `@since YYYY-MM-DD`, 수정 시: `@modified YYYY-MM-DD 변경 내용` 한 줄 추가

**MyBatis XML (mapper)**
- 각 `<select>`, `<insert>`, `<update>`, `<delete>` 쿼리 위에 `<!-- -->` 주석으로 목적 설명
- `<resultMap>` 상단에 컬럼 매핑 전략 등 특이사항 설명

### 주의사항
- Spring Framework 5.3.x 사용 (Spring Boot 아님)
- web.xml, spring-mvc.xml, spring-db.xml XML 설정 방식
- MyBatis mapper XML은 src/main/resources/mapper/ 에 위치
- WAR 패키징 방식으로 빌드 (`mvn package`, 테스트만 실행하면 WAR 미생성)
- mapperLocations 설정은 mapper XML 파일이 없으면 주석 처리 필요
- Windows 환경에서 로컬 PostgreSQL 서비스(postgresql-x64-17)가 실행 중이면 포트 충돌 발생 → 작업 전 중지 필요
- 컨트롤러에 try-catch 작성 금지 — 서비스에서 커스텀 예외를 던지면 GlobalExceptionHandler가 처리

---

## 파일 저장소 아키텍처

### 설계 방향

파일 저장 구현체를 교체 가능하도록 Strategy 패턴으로 추상화합니다.
현재는 Docker 볼륨 로컬 저장을 사용하고, 추후 AWS S3 또는 NFS로 교체할 수 있습니다.

### 인터페이스

```java
// com.retrack.storage.FileStorageStrategy
public interface FileStorageStrategy {
    String store(MultipartFile file, String savedName) throws IOException;
    Resource load(String filePath) throws IOException;
    void delete(String filePath) throws IOException;
}
```

### 구현체 구조

```
com.retrack/
  storage/
    FileStorageStrategy.java        ← 인터페이스
    LocalFileStorageStrategy.java   ← 현재 구현체 (Docker 볼륨)
    // S3FileStorageStrategy.java   ← 추후 추가
    // NfsFileStorageStrategy.java  ← 추후 추가
```

### 구현체 교체 방법

`spring-mvc.xml`의 빈 선언만 변경하면 됩니다. `FileService` 코드는 수정 불필요.

```xml
<!-- 현재: 로컬 저장 -->
<bean id="fileStorageStrategy" class="com.retrack.storage.LocalFileStorageStrategy">
    <constructor-arg value="/app/uploads/"/>
</bean>

<!-- S3 교체 시 -->
<!-- <bean id="fileStorageStrategy" class="com.retrack.storage.S3FileStorageStrategy">
    <constructor-arg value="my-bucket-name"/>
</bean> -->
```

### Docker 볼륨 마운트

파일이 컨테이너 재시작 시 유실되지 않도록 `docker-compose.yml`에 볼륨 마운트 설정.

```yaml
backend:
  volumes:
    - ./uploads:/app/uploads
```

Spring에서 파일 저장 경로: `/app/uploads/` (컨테이너 기준)
DB `file_path` 컬럼에는 컨테이너 기준 경로 저장.

---

## 트랜잭션 처리

### 과제 상태 변경 트랜잭션
과제 상태 변경 시 아래 3가지 작업이 하나의 트랜잭션으로 처리되어야 합니다.
중간에 하나라도 실패하면 전체 롤백됩니다.

1. PROJECTS 테이블 status 업데이트
2. PROJECT_HISTORY 테이블 이력 INSERT
3. NOTIFICATIONS 테이블 알림 기록 INSERT

구현 위치: ProjectService.changeStatus() 메서드
어노테이션: @Transactional (org.springframework.transaction.annotation.Transactional)

주의: Gmail SMTP 이메일 발송은 외부 API라 트랜잭션 안에 포함하지 않습니다.
`@TransactionalEventListener(AFTER_COMMIT)` + `@Async` 패턴으로 커밋 후 별도 스레드에서 발송합니다.

---

## 개발 현황

### 완료된 작업

#### 1단계 — 기반 설정 (2026-04-16)
- [x] DB 스키마 확인 (7개 테이블 모두 정상)
- [x] pom.xml — JWT(jjwt 0.11.5), BCrypt(spring-security-crypto 5.8.13) 의존성 추가
- [x] spring-db.xml — DB host `localhost` → `db` 수정, mapperLocations 활성화
- [x] spring-mvc.xml — CORS 설정 (localhost:3000 허용), mvc:annotation-driven + UTF-8 인코딩 설정
- [x] ApiResponse — 공통 API 응답 포맷 (`success`, `message`, `data`)

#### 2단계 — 인증 API (2026-04-16)
- [x] UserVO, LoginRequestVO, RegisterRequestVO
- [x] JwtUtil — 토큰 생성/검증, 만료 30분, HMAC-SHA256
- [x] AuthMapper + AuthMapper.xml — insertUser, findByEmail, existsByEmail
- [x] AuthService — 회원가입(BCrypt 암호화), 로그인(JWT 발급)
- [x] AuthController — POST /api/auth/register, /login, /logout
- [x] 인증 방식: JWT (React/Spring 분리 구조)

#### 3단계 — JWT 인터셉터 (2026-04-17)
- [x] `@RequiredRole` 커스텀 어노테이션 — 메서드 단위 최소 권한 지정
- [x] `JwtInterceptor` — Authorization 헤더 추출, 토큰 검증, 권한 계층 체크, request attribute 저장
- [x] `spring-mvc.xml` 인터셉터 등록 — `/api/auth/**` 제외, `/api/**` 적용
- [x] 권한 체크 방식: 어노테이션 방식 (`@RequiredRole`) 채택, 계층 구조 VIEWER < RESEARCHER < MANAGER < ADMIN

#### 3.5단계 — 예외 처리 (2026-04-23)
- [x] `BadRequestException` / `UnauthorizedException` / `NotFoundException` — 커스텀 예외 계층 추가
- [x] `GlobalExceptionHandler` (`@RestControllerAdvice`) — 예외 타입별 HTTP 상태 코드 매핑 (400 / 401 / 404 / 500)
- [x] `AuthService` — `IllegalArgumentException` → 커스텀 예외로 교체 (이메일 중복 → 400, 로그인 실패 → 401)
- [x] `AuthController` — try-catch 제거, 핵심 로직만 유지

#### 3.7단계 — HikariCP 커넥션 풀 (2026-04-26)
- [x] `pom.xml` — HikariCP 4.0.3 의존성 추가 (Java 11 호환 버전)
- [x] `spring-db.xml` — `DriverManagerDataSource` → `HikariDataSource` 교체
- [x] 풀 설정: maximumPoolSize=10, minimumIdle=2, connectionTimeout=30s, idleTimeout=10분, maxLifetime=30분
- [x] `destroy-method="close"` 등록 — Tomcat 종료 시 커넥션 정상 반납

#### 4단계 — 사용자 관리 API (2026-04-28)
- [x] `UserMapper` + `UserMapper.xml` — findAll, findById, updateRole, updateVerify, deleteUser
- [x] `UserService` — 사용자 목록/상세/권한변경/인증승인/삭제, 유효 role 검증, 중복 인증 방지
- [x] `UserController` — GET /api/users, /api/users/{id}, PATCH /api/users/{id}/role, PATCH /api/users/{id}/verify, DELETE /api/users/{id}
- [x] 모든 엔드포인트 `@RequiredRole("ADMIN")` 적용
- [x] `pom.xml` — `jackson-datatype-jsr310` 추가 (LocalDateTime 직렬화 지원)
- [x] `UserVO` — LocalDateTime 필드에 `@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")` 추가
- [x] `spring-mvc.xml` — `Jackson2ObjectMapperFactoryBean`으로 JavaTimeModule 등록

#### 5단계 — 과제 관리 API (2026-04-28)
- [x] `ProjectVO`, `ProjectHistoryVO`, `ProjectRequestVO`, `StatusChangeRequestVO` — VO 4종 추가
- [x] `ProjectMapper` + `ProjectMapper.xml` — findAll, findById, insertProject, updateProject, updateStatus, deleteProject, insertHistory, insertNotification, findHistoryByProjectId
- [x] `ProjectService` — 목록/상세/등록/수정/삭제, 상태 전이 유효성 검증, RESEARCHER 본인 과제 수정 권한 체크
- [x] `ProjectService.changeStatus()` — `@Transactional` 적용, 3가지 작업 원자적 처리
- [x] `ProjectController` — 7개 엔드포인트 구현
- [x] `spring-mvc.xml` — `DataSourceTransactionManager` 빈 + `<tx:annotation-driven>` 추가

#### 5.5단계 — 로깅 (2026-04-29)
- [x] `pom.xml` — `log4j-api`, `log4j-core`, `log4j-slf4j-impl` 2.23.1 추가
- [x] `pom.xml` — `<dependencyManagement>`로 `slf4j-api` 1.7.36 고정 (HikariCP slf4j 버전 충돌 방지)
- [x] `log4j2.xml` — 콘솔 출력 설정 (`com.retrack` DEBUG, Spring WARN, HikariCP INFO)
- [x] `GlobalExceptionHandler` — `@Slf4j` + `log.error(...)` 적용, 500 오류 시 스택트레이스 출력
- [x] 로거 API 방침: 전체 코드에서 `@Slf4j` (SLF4J) 사용

#### 6단계 — 연구비 관리 API (2026-04-29)
- [x] `BudgetVO`, `BudgetRequestVO` — VO 2종 추가
- [x] `BudgetMapper` + `BudgetMapper.xml` — findByProjectId, findById, insert, update, delete, summary
- [x] `BudgetService` — 목록/등록/수정/삭제/카테고리별 집계, 카테고리 유효성·금액·사용일시 검증
- [x] `BudgetController` — 5개 엔드포인트 구현
- [x] summary 응답 형태: `{ "PERSONNEL": 1000000, "TRAVEL": 500000, ..., "total": 1500000 }`

#### 6.7단계 — DB 스키마 정비 (2026-05-02)
- [x] `schema.sql` — 전체 FK에 `ON DELETE CASCADE` / `ON DELETE SET NULL` 명시
- [x] `schema.sql` — `FILES.file_type` `VARCHAR(30)` → `VARCHAR(100)` (MIME 타입 오버플로 방지)
- [x] `docker-compose.yml` — schema.sql 마운트 추가 (볼륨 초기화 시 자동 적용)

#### 6.8단계 — 파일 업로드 예외 처리 (2026-05-02)
- [x] `GlobalExceptionHandler` — `MaxUploadSizeExceededException` 핸들러 추가 → 400 응답

#### 6.9단계 — 카카오 알림톡 흔적 제거 (2026-05-09)
- [x] `schema.sql` — `K_NOTIFICATIONS` → `NOTIFICATIONS` 테이블명 변경
- [x] 관련 Mapper XML, Service, VO 전체 주석 정리
- [x] DB 재생성 (볼륨 삭제 후 재시작)

#### 7단계 — 파일 관리 API (2026-05-02)
- [x] `pom.xml` — `commons-fileupload 1.5` 추가
- [x] `FileStorageStrategy` — 파일 저장소 전략 인터페이스
- [x] `LocalFileStorageStrategy` — Docker 볼륨 로컬 저장 구현체
- [x] `FileVO`, `FileMapper` + `FileMapper.xml` — findByProjectId, findById, insert, delete, findAllByProjectId
- [x] `FileService` — 업로드(확장자 화이트리스트 13종, UUID 저장명, DB 실패 시 파일 롤백), 삭제(RESEARCHER 본인만), 다운로드
- [x] `FileController` — 4개 엔드포인트, RFC 5987 한글 파일명 인코딩
- [x] `spring-mvc.xml` — `CommonsMultipartResolver`(maxUploadSize 10MB) + `LocalFileStorageStrategy` 빈 등록
- [x] `docker-compose.yml` — `./uploads:/app/uploads` 볼륨 추가

#### 8단계 — 알림 API (2026-05-11)
- [x] `pom.xml` — `spring-context-support`, `javax.mail` 의존성 추가
- [x] `NotificationVO`, `NotificationRequestVO`
- [x] `NotificationMapper` + `NotificationMapper.xml` — findByUserId, findById, insert, updateStatus
- [x] `EmailSender` — `@Async` 이메일 발송 전담 컴포넌트
- [x] `NotificationService`, `NotificationController` — 내 알림 목록/상세/수동 발송
- [x] `spring-mvc.xml` — JavaMailSender 빈 + `<task:annotation-driven>` 추가
- [x] `.env` — MAIL_USERNAME, MAIL_PASSWORD (Git 제외)
- [x] `src/main/resources/templates/notification.html` — HTML 이메일 템플릿 (String.replace 치환)
- [x] `StatusChangedEvent` + `EmailSender.onStatusChanged()` — `@TransactionalEventListener(AFTER_COMMIT)` + `@Async` 패턴으로 커밋 후 이메일 발송
- [x] `ProjectService` — `ApplicationEventPublisher`로 이벤트 발행 (EmailSender 직접 의존 제거)

#### 9단계 — 활동 로그 API (2026-05-11)
Spring AOP + 커스텀 어노테이션 방식. 각 Service는 @LogActivity만 선언, 실제 삽입은 ActivityLogAspect가 처리

- [x] `ActivityLogVO`, `ActivityLogMapper` + `ActivityLogMapper.xml`
- [x] `ActivityLogService`, `ActivityLogController` — GET /api/logs, GET /api/logs/users/{id} (ADMIN)
- [x] `@LogActivity` — 커스텀 어노테이션 (action/targetType/userIdParam/targetIdParam/descriptionParam)
- [x] `ActivityLogAspect` — `@Aspect @Component @Order(1)`, `@Around` 어드바이스, try-catch로 핵심 로직 보호
- [x] `pom.xml` — `aspectjweaver 1.9.19` 추가
- [x] `spring-mvc.xml` — `<aop:aspectj-autoproxy/>` 추가
- [x] AuthService, ProjectService, BudgetService, FileService, NotificationService, UserService — `@LogActivity` 적용, ActivityLogMapper 직접 의존 제거

#### 보안 패치 및 리팩토링 (2026-05-11)
- [x] `NotificationController.getNotification` — 알림 소유권 검증 추가 (본인 또는 ADMIN만 조회)
- [x] `ActivityLogVO` — Lombok `@Getter @Setter`로 교체 (125줄 → 42줄)
- [x] `FileVO.filePath` — `@JsonIgnore` 추가 (서버 내부 경로 노출 방지)

#### 10단계 — 통계 API (2026-05-12)
- [x] `StatsMapper` + `StatsMapper.xml` — countByStatus, sumByCategory, burnrate, countByMonth
- [x] `StatsService`, `StatsController` — GET /api/stats/projects/status, /budget/category, /budget/burnrate, /notifications/monthly (ADMIN 전용)

#### 10.5단계 — 검색 기능 (2026-05-12)
- [x] `ProjectMapper`, `UserMapper` — `findAll(Map<String, Object> params)` dynamic SQL (ILIKE, status, role 등)
- [x] `ProjectController`, `UserController` — `@RequestParam(required=false)` 검색 파라미터 추가

#### 10.6단계 — 페이지네이션 (2026-05-12)
- [x] `PageResponse.java` — 신규 VO (items, totalCount, page, size, totalPages)
- [x] `ProjectMapper`, `UserMapper` — `countAll()` 추가, `findAll`에 LIMIT/OFFSET 추가
- [x] `ProjectService`, `UserService` — `PageResponse` 반환, size 허용값 검증 (10/20/50)

#### 11단계 — 대시보드 API (2026-05-12)
- [x] `DashboardMapper` + `DashboardMapper.xml` — 8개 집계 쿼리
- [x] `DashboardService` — role 분기 (ADMIN/MANAGER/RESEARCHER/VIEWER)
- [x] `DashboardController` — GET /api/dashboard

#### 11.5단계 — DB 인덱스 추가 (2026-05-12)
- [x] `schema.sql` — 11개 인덱스 추가 (`IF NOT EXISTS` 사용)

#### 11.6단계 — SQL 파일 분리 (2026-05-12)
- [x] `sql/seed.sql` 신규 생성 — 개발용 테스트 데이터
- [x] `docker-compose.yml` — `01_schema.sql` / `02_seed.sql` prefix로 실행 순서 보장

#### 12단계 — JUnit 5 + Mockito 단위 테스트 (2026-05-14)
- 대상: `AuthService`, `FileService`, `ProjectService` (복잡도·중요도 기준 선별 10케이스)
- [x] `pom.xml` — `junit-jupiter 5.10.3`, `mockito-core/junit-jupiter 5.12.0`, `spring-test 5.3.39` (test scope), `maven-surefire-plugin 3.3.1` 추가
- [x] `AuthServiceTest` (3케이스) — 이메일 없음 401, 비밀번호 불일치 401 (실제 BCrypt 해시), 로그인 성공 Map 구조 검증
- [x] `FileServiceTest` (4케이스) — 불허 확장자 보안 검증, DB 실패 시 파일시스템 롤백, RESEARCHER 소유권 검증, ADMIN 역할 분기
- [x] `ProjectServiceTest` (3케이스) — 불허 상태 전이, 허용 전이 3가지 작업 모두 호출 verify, RESEARCHER 타인 과제 수정 권한 검증

---

## 트러블슈팅

| 파일 | 내용 |
|---|---|
| `docs/troubleshooting-초기설정.md` | mvc:annotation-driven 충돌, Jackson 한글 파싱 오류 |
| `docs/troubleshooting-4단계-사용자관리API.md` | 4단계 개발 중 발생한 이슈 |
| `docs/troubleshooting-5단계-과제관리API-테스트.md` | GlobalExceptionHandler 로그 미출력, Git Bash 인코딩 문제, 트랜잭션 확인 |
| `docs/transaction-컨텍스트-분리-이슈.md` | 트랜잭션 매니저 서블릿 컨텍스트 분리 이슈 |
| `docs/troubleshooting-7단계-파일관리API.md` | Maven 커맨드라인 빌드 시 Lombok 미처리, Maven Java 버전 충돌 |
| `docs/troubleshooting-12단계-단위테스트.md` | JUnit 5 미실행 (surefire 3.x 필요), BCryptPasswordEncoder Mock 불가 |
