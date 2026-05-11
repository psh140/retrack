# Retrack — 연구과제 관리 시스템

## 하네스: Retrack 백엔드

**목표:** Controller-Service-Mapper-VO-XML 5종 세트 반복 구현을 에이전트 팀으로 자동화

**트리거:**
- 백엔드 (Java/MyBatis/Spring) 작업 → `retrack-backend` 스킬
- 프론트엔드 (React/axios/컴포넌트) 작업 → `retrack-frontend` 스킬
- 단순 질문이나 파일 조회는 직접 응답 가능

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-10 | 초기 구성 (백엔드 팀) | backend-leader, java-implementer, mybatis-specialist, quality-guardian | 반복 구현 패턴 자동화 |
| 2026-05-10 | 프론트엔드 팀 추가 | frontend-leader, ui-builder, api-connector | 페이지 단위 React 구현 자동화 |

---

## 프로젝트 개요

연구과제의 등록, 상태 관리, 연구비 집계, 파일 첨부, 이메일 알림 발송 기능을 제공하는 웹 기반 연구과제 관리 시스템입니다.

- 개발 목적: 포트폴리오 (공공기관 / SI 취업 타겟)
- 개발 배경: 식약처 디스패치 근무 당시 연구과제 관리 시스템 실무 경험을 바탕으로 기획
- 권한 구조: VIEWER / RESEARCHER / MANAGER / ADMIN 4단계

---

## 기술 스택

| 구분 | 기술 | 버전 |
|---|---|---|
| Language | Java | 11 |
| Backend Framework | Spring Framework | 5.3.x |
| WAS | Apache Tomcat | 9.x |
| ORM | MyBatis | 3.5.x |
| Database | PostgreSQL | 14.x |
| Frontend | React | 18.x |
| Build Tool | Maven | 3.x |
| Container | Docker / Docker Compose | - |
| Deploy | AWS EC2 | - |
| VCS | Git / GitHub | - |
| External API | Gmail SMTP (Spring JavaMailSender) | - |

---

## 프로젝트 구조

```
retrack/
  backend/
    src/
      main/
        java/com/retrack/
          controller/       # REST API 엔드포인트
          service/          # 비즈니스 로직
          mapper/           # MyBatis DB 쿼리 인터페이스
          vo/               # 데이터 객체
        resources/
          mapper/           # MyBatis XML 쿼리 파일
        webapp/
          WEB-INF/
            web.xml         # Tomcat 설정 진입점
            spring-mvc.xml  # Spring MVC 설정
            spring-db.xml   # DB 연결 설정
    pom.xml
  frontend/
    src/
    public/
    Dockerfile
  docker-compose.yml
  CLAUDE.md
```

---

## 실행 방법

### 개발 환경 시작

```bash
# DB 컨테이너만 먼저 실행
docker-compose up -d db

# 전체 컨테이너 실행
docker-compose up -d db backend frontend

# 컨테이너 재시작
docker-compose restart backend

# 로그 확인
docker logs retrack-backend
```

### 백엔드 빌드 및 배포

```bash
# IntelliJ Maven package 빌드 후 WAR 파일 생성
# WAR 파일 위치: backend/target/retrack-backend-1.0-SNAPSHOT.war
# docker-compose.yml의 volumes에서 자동 마운트됨
```

### 접속 정보

- 프론트엔드: http://localhost:3000
- 백엔드: http://localhost:8080
- PostgreSQL: localhost:5432

### DB 접속 정보

```
Host: localhost
Port: 5432
Database: retrack
Username: retrack
Password: retrack1234
```

---

## ERD 요약

→ [`docs/erd.md`](docs/erd.md) 참고

---

## API 목록

→ [`docs/api-spec.md`](docs/api-spec.md) 참고

---

## 협업 규칙

### 커밋 / 푸시
파일 생성, 수정, 제거, 이동 등 모든 작업 후 커밋 및 푸시는 반드시 사용자 허락을 받은 후 진행한다. 작업 완료 후 자동으로 커밋/푸시하지 않는다.

---

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

**MyBatis XML (mapper)**
- 각 `<select>`, `<insert>`, `<update>`, `<delete>` 쿼리 위에 `<!-- -->` 주석으로 목적 설명
- `<resultMap>` 상단에 컬럼 매핑 전략 등 특이사항 설명

### 주의사항
- Spring Framework 5.3.x 사용 (Spring Boot 아님)
- web.xml, spring-mvc.xml, spring-db.xml XML 설정 방식
- MyBatis mapper XML은 src/main/resources/mapper/ 에 위치
- WAR 패키징 방식으로 빌드
- mapperLocations 설정은 mapper XML 파일이 없으면 주석 처리 필요
- Windows 환경에서 로컬 PostgreSQL 서비스(postgresql-x64-17)가 실행 중이면 포트 충돌 발생 → 작업 전 중지 필요

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
3. NOTIFICATIONS 테이블 알림 기록 INSERT (테이블명은 유지, 용도는 SMS 발송 이력으로 변경)

구현 위치: ProjectService.changeStatus() 메서드
어노테이션: @Transactional (org.springframework.transaction.annotation.Transactional)

예시:
```java
@Transactional
public void changeStatus(Long projectId, String newStatus, Long changedBy, String comment) {
    // 1. 과제 상태 변경
    // 2. 이력 저장
    // 3. 알림 기록 저장
    // 4. Gmail SMTP 이메일 발송 (트랜잭션 외부에서 처리 권장)
}
```

주의: Gmail SMTP 이메일 발송은 외부 API라 트랜잭션 안에 포함하지 않습니다.
DB 작업이 모두 성공한 후 API 호출하는 방식으로 구현하세요.

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
- [x] 이후 모든 컨트롤러는 try-catch 없이 작성, 서비스에서 커스텀 예외를 던지면 GlobalExceptionHandler가 처리

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
- [x] `ProjectService.changeStatus()` — `@Transactional` 적용, 3가지 작업 원자적 처리 (status 업데이트 + 이력 INSERT + 알림 기록 INSERT)
- [x] `ProjectController` — 7개 엔드포인트 구현
- [x] `spring-mvc.xml` — `DataSourceTransactionManager` 빈 + `<tx:annotation-driven>` 추가 (Service 빈이 서블릿 컨텍스트에 있으므로 여기서 선언, `dataSource`는 루트 컨텍스트에서 참조)

#### 5.5단계 — 로깅 (2026-04-29)
- [x] `pom.xml` — `log4j-api`, `log4j-core`, `log4j-slf4j-impl` 2.23.1 추가
- [x] `pom.xml` — `<dependencyManagement>`로 `slf4j-api` 1.7.36 고정 (HikariCP 4.0.3이 끌어오는 `slf4j-api:2.0.0-alpha1`과 `log4j-slf4j-impl` 간 버전 충돌 방지)
- [x] `log4j2.xml` — 콘솔 출력 설정 (`com.retrack` DEBUG, `com.retrack.mapper` DEBUG, Spring WARN, HikariCP INFO)
- [x] `GlobalExceptionHandler` — `@Slf4j` + `log.error("Unhandled exception occurred", e)` 적용, 500 오류 시 스택트레이스 출력
- [x] 로거 API 방침: 애플리케이션 코드 전체에서 `@Slf4j` (SLF4J) 사용 — 구현체(Log4j2) 교체 시 코드 변경 불필요

#### 6단계 — 연구비 관리 API (2026-04-29)
- [x] `BudgetVO`, `BudgetRequestVO` — VO 2종 추가
- [x] `BudgetMapper` + `BudgetMapper.xml` — findByProjectId, findById, insert, update, delete, summary
- [x] `BudgetService` — 목록/등록/수정/삭제/카테고리별 집계, 카테고리 유효성·금액·사용일시 검증
- [x] `BudgetController` — 5개 엔드포인트 구현 (GET/POST /api/projects/{id}/budget, PUT/DELETE /api/projects/{id}/budget/{bid}, GET /api/projects/{id}/budget/summary)
- [x] summary 응답 형태: `{ "PERSONNEL": 1000000, "TRAVEL": 500000, ..., "total": 1500000 }`

#### 7단계 — 파일 관리 API (2026-05-02)
- [x] `pom.xml` — `commons-fileupload 1.5` 추가 (CommonsMultipartResolver 의존성)
- [x] `FileStorageStrategy` — 파일 저장소 전략 인터페이스 (`store`, `load`, `delete`)
- [x] `LocalFileStorageStrategy` — Docker 볼륨 로컬 저장 구현체, 생성자에서 디렉토리 자동 생성
- [x] `FileVO` — files 테이블 매핑 VO
- [x] `FileMapper` + `FileMapper.xml` — findByProjectId, findById, insert, delete, findAllByProjectId
- [x] `FileService` — 목록/업로드/삭제/다운로드/과제별 전체 삭제
  - 업로드: 원본 파일명 경로 구분자 제거, 확장자 화이트리스트(13종) 검증, UUID 저장명, DB INSERT 실패 시 파일 롤백
  - 삭제: DB DELETE 먼저 → 파일시스템 삭제 순서, RESEARCHER는 본인 업로드만 가능
  - 다운로드: `getFile()`로 메타데이터, `loadResource()`로 Resource 분리
- [x] `FileController` — 4개 엔드포인트, 다운로드 시 RFC 5987 한글 파일명 인코딩
- [x] `spring-mvc.xml` — `CommonsMultipartResolver`(maxUploadSize 10MB) + `LocalFileStorageStrategy` 빈 등록
- [x] `docker-compose.yml` — backend volumes에 `./uploads:/app/uploads` 추가
- [x] `ProjectService.deleteProject()` — 과제 삭제 전 파일시스템 파일 정리 (`deleteAllFilesByProject`) 추가

#### 6.8단계 — 파일 업로드 예외 처리 (2026-05-02)
- [x] `GlobalExceptionHandler` — `MaxUploadSizeExceededException` 핸들러 추가 → 400 응답 (기존 500으로 처리되던 버그 수정)

#### 6.9단계 — 카카오 알림톡 흔적 제거 (2026-05-09)
- [x] `schema.sql` — `K_NOTIFICATIONS` → `NOTIFICATIONS` 테이블명 변경 (K_ prefix가 Kakao에서 유래)
- [x] `NotificationMapper.xml`, `ProjectMapper.xml` — `k_notifications` → `notifications` 테이블명 변경
- [x] `ProjectService.java`, `ProjectMapper.java`, `NotificationVO.java` — 카카오 알림톡 관련 주석 제거
- [x] `UserVO.java` — phone 필드 카카오 알림톡 관련 주석 제거
- [x] CLAUDE.md — 전체 카카오/솔라피 관련 내용 이메일 알림으로 변경
- [x] DB 재생성 (볼륨 삭제 후 재시작)

#### 6.7단계 — DB 스키마 정비 (2026-05-02)
- [x] `schema.sql` — 전체 FK에 `ON DELETE CASCADE` / `ON DELETE SET NULL` 명시 (기존 기본값 RESTRICT에서 변경)
  - PROJECTS 삭제 시: PROJECT_HISTORY, BUDGET, FILES → CASCADE / NOTIFICATIONS.project_id → SET NULL
  - USERS 삭제 시: PROJECTS(user_id), PROJECT_HISTORY, BUDGET, FILES, ACTIVITY_LOGS, NOTIFICATIONS → CASCADE / PROJECTS(manager_id) → SET NULL
- [x] `schema.sql` — `FILES.file_type` `VARCHAR(30)` → `VARCHAR(100)` (MIME 타입 저장 시 오버플로 방지, pptx/docx MIME이 최대 73자)
- [x] `docker-compose.yml` — db 서비스에 `./sql/schema.sql:/docker-entrypoint-initdb.d/schema.sql` 마운트 추가 (볼륨 초기화 시 스키마 자동 적용)

### 다음 작업

#### 중간 리팩토링
- [x] `GlobalExceptionHandler` — `IOException` 핸들러 추가 (파일 처리 오류 시 적절한 500 응답)
- [x] `JwtUtil.getUserId()` — `NumberFormatException` 처리를 `JwtInterceptor`에서 처리 (토큰 변조 방어, JwtUtil은 순수 유틸 유지)
- [-] `BudgetService`, `FileService` — `checkProjectExists()` 교체 검토 → `FileService` 순환 의존성 문제로 스킵 (일관성 유지를 위해 둘 다 현행 유지)
- [-] `ProjectService`, `BudgetService`, `FileService` — 소유권 검증 패턴 중복 제거 검토 → 서비스마다 검증 조건이 달라 공통화 불가, 스킵

#### 8단계 — 알림 API

**사전 세팅 (완료)**
- [x] Gmail 계정 앱 비밀번호 발급 (Google 계정 → 보안 → 앱 비밀번호)

**이메일 발송 트리거**

| 트리거 | 수신자 | notifications 기록 | 이메일 발송 |
|---|---|---|---|
| 회원가입 | 가입자 본인 | X | O |
| 과제 상태 변경 | 과제 신청자 | O | O |
| MANAGER/ADMIN 수동 발송 | 지정 사용자 | O | O |

**이메일 템플릿**
- 템플릿 엔진: Freemarker (Spring Framework 5.x 호환, 공공기관/SI 환경 표준)
- 템플릿 파일 위치: `src/main/resources/templates/`
- 템플릿 종류 (3가지):
  - `welcome-email.ftl` — 회원가입 환영
  - `status-change-email.ftl` — 과제 상태 변경 알림
  - `manual-email.ftl` — 수동 발송
- 이메일 제목:
  - 회원가입: `[Retrack] 가입을 환영합니다`
  - 상태 변경: `[Retrack] 연구과제 상태가 변경됐습니다`
  - 수동 발송: `[Retrack] 연구과제 알림`

**완료된 구현**
- [x] `pom.xml` — `spring-context-support`, `javax.mail` 의존성 추가
- [x] `NotificationVO` — notifications 테이블 매핑 VO
- [x] `NotificationRequestVO` — 수동 발송 요청 바디 VO
- [x] `NotificationMapper` + `NotificationMapper.xml` — findByUserId, findById, insert, updateStatus
- [x] `EmailSender` — @Async 이메일 발송 전담 컴포넌트 (self-invocation 방지용 분리)
- [x] `NotificationService` — 내 알림 목록/상세 조회, 수동 발송
- [x] `NotificationController` — GET /api/notifications, POST /api/notifications/send, GET /api/notifications/{id}
- [x] `spring-mvc.xml` — JavaMailSender 빈 설정 + `<task:annotation-driven>` 추가
- [x] `docker-compose.yml` — MAIL_USERNAME, MAIL_PASSWORD 환경변수 추가
- [x] `.env` — MAIL_USERNAME, MAIL_PASSWORD 실제 값 저장 (docker-compose가 자동 로드, Git 제외 대상)
- [x] `EmailSender` — 발신자 표시 이름 "Retrack 알림" 설정 (`helper.setFrom()`)
- [x] `NotificationMapper.xml` — `<resultMap>` 추가 (snake_case → camelCase 매핑 누락으로 ID 필드 null 반환되던 버그 수정)

**완료된 구현 (2026-05-11 추가)**
- [x] `src/main/resources/templates/notification.html` — 단일 HTML 템플릿 (과제 상태 변경 알림용, 플레이스홀더 String.replace() 치환 방식)
- [x] `EmailSender.sendStatusChangeEmail()` — 템플릿 로드 + 플레이스홀더 치환 후 HTML 이메일 발송 (상태별 한글 텍스트 분기 포함)
- [x] `ProjectService.changeStatus()` — 트랜잭션 완료 후 신청자에게 자동 이메일 발송 연결 (`NotificationMapper`, `UserMapper` 의존성 추가)
- [x] `StatusChangedEvent` (`com.retrack.event`) — 상태 변경 도메인 이벤트 객체 (불변 클래스)
- [x] `EmailSender.onStatusChanged()` — `@TransactionalEventListener(AFTER_COMMIT)` + `@Async` 리스너. 트랜잭션 커밋 확인 후 별도 스레드에서 SMTP 발송. `ProjectService`에서 `EmailSender` 직접 의존 제거
- [x] `ProjectService` — `EmailSender` 의존성 제거, `ApplicationEventPublisher` 주입으로 교체

**보류**
- 회원가입 환영 이메일 — 핵심 기능 완성 후 추가 예정

#### 9단계 — 활동 로그 API (2026-05-11)
Spring AOP + 커스텀 어노테이션 방식으로 구현. 각 Service는 @LogActivity만 선언, 실제 삽입은 ActivityLogAspect가 처리

- [x] `ActivityLogVO` — activity_logs 테이블 매핑 VO
- [x] `ActivityLogMapper` + `ActivityLogMapper.xml` — insert, findAll, findByUserId
- [x] `ActivityLogService` — 전체 로그 조회, 특정 사용자 로그 조회 (존재하지 않는 userId → NotFoundException)
- [x] `ActivityLogController` — GET /api/logs, GET /api/logs/users/{id} (ADMIN 전용)
- [x] `@LogActivity` — 커스텀 어노테이션 (`com.retrack.annotation`), action/targetType/userIdParam/targetIdParam/descriptionParam 속성 보유
- [x] `ActivityLogAspect` — `@Aspect @Component @Order(1)`, `@Around("@annotation(logActivity)")` 어드바이스. `@Order(1)`로 `@Transactional` 프록시 바깥에서 실행 → 트랜잭션 커밋 후 로그 삽입
- [x] `pom.xml` — `aspectjweaver 1.9.19` 의존성 추가
- [x] `spring-mvc.xml` — `aop` 네임스페이스 + `<aop:aspectj-autoproxy/>` 추가
- [x] `AuthService` — `@LogActivity(action="LOGIN", userIdFromReturn=true)` / `@LogActivity(action="LOGOUT", userIdParam=0)`, ActivityLogMapper 의존성 제거
- [x] `AuthController` — 로그아웃 시 userId 추출 후 authService.logout() 호출 (기존 유지)
- [x] `ProjectService` — createProject/updateProject/deleteProject/changeStatus에 @LogActivity 추가, ActivityLogMapper 의존성 제거
- [x] `BudgetService` — createBudget/updateBudget/deleteBudget에 @LogActivity 추가, ActivityLogMapper 의존성 제거
- [x] `FileService` — uploadFile/deleteFile에 @LogActivity 추가, ActivityLogMapper 의존성 제거
- [x] `NotificationService` — sendNotification에 @LogActivity 추가, ActivityLogMapper 의존성 제거
- [x] `UserService` — updateRole/verifyUser/deleteUser에 @LogActivity 추가, ActivityLogMapper 의존성 제거
- [x] 로그 삽입은 Aspect 내 try-catch로 감싸 실패해도 핵심 비즈니스 로직에 영향 없음

#### 보안 패치 및 리팩토링 (2026-05-11)
- [x] `NotificationController.getNotification` — 알림 소유권 검증 추가. 기존에는 알림 ID만 알면 타인 알림 조회 가능했던 보안 버그 수정. 본인 알림 또는 ADMIN만 조회 가능 (UnauthorizedException 401)
- [x] `ActivityLogVO` — 수동 getter/setter 제거, Lombok `@Getter @Setter`로 교체 (125줄 → 42줄, 다른 VO와 일관성 통일)
- [x] `FileVO.filePath` — `@JsonIgnore` 주석 추가 (서버 내부 경로 노출 방지 및 저장소 교체 결합도 설명)

#### 10단계 — 통계 API
- [ ] `StatsMapper` + `StatsMapper.xml` — 과제 상태별 현황, 연구비 카테고리별 집계, 연구비 소진율, 월별 알림 발송 건수
- [ ] `StatsService` — 통계 데이터 가공
- [ ] `StatsController` — GET /api/stats/projects/status, /api/stats/budget/category, /api/stats/budget/burnrate, /api/stats/notifications/monthly

#### 11단계 — 대시보드 API
- [ ] `DashboardService` — 역할별 요약 데이터 집계 (진행 중 과제 수, 총 연구비, 최근 알림 등)
- [ ] `DashboardController` — GET /api/dashboard

#### 11.5단계 — DB 인덱스 추가
전체 기능 구현 완료 후 실제 쿼리 패턴을 기반으로 필요한 컬럼에 인덱스 추가
- `schema.sql` 업데이트
- 대상 컬럼은 11단계 완료 시점에 결정

---

## 프론트엔드 작업 시작 전 필수 결정 사항

**백엔드 작업 완료 후, 프론트엔드 작업 들어가기 전에 아래 항목을 모두 확정해야 한다.**

| 항목 | 후보 | 비고 |
|---|---|---|
| 언어 | JavaScript / TypeScript | 백엔드 포트폴리오 타겟이면 JS 추천 |
| 빌드 도구 | Vite | Create React App은 구식 |
| 상태관리 | Zustand / Redux | 공공/SI 타겟이면 둘 다 무난, Zustand가 코드 간결 |
| HTTP 클라이언트 | axios | 실무 표준, JWT 헤더 자동 추가 편리 |
| 라우팅 | React Router v6 | 표준 |
| UI 라이브러리 | Ant Design / MUI | Ant Design이 공공/SI에서 자주 쓰임 |
| 날짜 처리 | dayjs | LocalDateTime 응답 파싱용 |
| CSS 방식 | CSS Modules / Ant Design 내장 | Ant Design 쓰면 별도 CSS 거의 불필요 |
| 환경변수 | .env | API base URL 분리 (VITE_API_URL) |

확정 후 CLAUDE.md 프론트엔드 기술 스택 섹션에 선택 결과를 기록하고 작업을 시작한다.

---

## 트러블슈팅

트러블슈팅 내용은 `docs/` 폴더에서 관리합니다.

| 파일 | 내용 |
|---|---|
| `docs/troubleshooting-초기설정.md` | mvc:annotation-driven 충돌, Jackson 한글 파싱 오류 |
| `docs/troubleshooting-4단계-사용자관리API.md` | 4단계 개발 중 발생한 이슈 |
| `docs/troubleshooting-5단계-과제관리API-테스트.md` | GlobalExceptionHandler 로그 미출력, Git Bash 인코딩 문제, 트랜잭션 확인 |
| `docs/transaction-컨텍스트-분리-이슈.md` | 트랜잭션 매니저 서블릿 컨텍스트 분리 이슈 |
| `docs/troubleshooting-7단계-파일관리API.md` | Maven 커맨드라인 빌드 시 Lombok 미처리, Maven Java 버전 충돌 |

