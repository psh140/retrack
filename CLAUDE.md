# Retrack — 연구과제 관리 시스템

## 프로젝트 개요

연구과제의 등록, 상태 관리, 연구비 집계, 파일 첨부, 카카오 알림톡 발송 기능을 제공하는 웹 기반 연구과제 관리 시스템입니다.

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
| External API | Kakao 알림톡 API | - |

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

### 테이블 목록

| 테이블명 | 설명 |
|---|---|
| USERS | 사용자 (권한: VIEWER / RESEARCHER / MANAGER / ADMIN) |
| PROJECTS | 연구과제 |
| PROJECT_HISTORY | 과제 상태 변경 이력 |
| BUDGET | 연구비 사용 내역 |
| FILES | 첨부파일 |
| ACTIVITY_LOGS | 사용자 활동 로그 |
| K_NOTIFICATIONS | 카카오 알림톡 발송 이력 |

### 주요 관계

- USERS 1 : N PROJECTS (신청자)
- USERS 1 : N PROJECTS (담당자)
- PROJECTS 1 : N PROJECT_HISTORY
- PROJECTS 1 : N BUDGET
- PROJECTS 1 : N FILES
- PROJECTS 1 : N K_NOTIFICATIONS
- USERS 1 : N ACTIVITY_LOGS
- USERS 1 : N K_NOTIFICATIONS

### 과제 상태 흐름

```
DRAFT → SUBMITTED → REVIEWING → APPROVED → IN_PROGRESS → COMPLETED
                                          ↘ REJECTED
```

### BUDGET 카테고리

- PERSONNEL: 인건비
- TRAVEL: 여비
- RESEARCH_ACTIVITY: 연구활동비
- ETC: 기타

---

## API 목록

### 인증
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| POST | /api/auth/register | 없음 | 회원가입 |
| POST | /api/auth/login | 없음 | 로그인 |
| POST | /api/auth/logout | ALL | 로그아웃 |

### 사용자 관리
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/users | ADMIN | 사용자 목록 조회 |
| GET | /api/users/{id} | ADMIN | 사용자 상세 조회 |
| PATCH | /api/users/{id}/role | ADMIN | 권한 변경 |
| PATCH | /api/users/{id}/verify | ADMIN | 연구자 인증 승인 |
| DELETE | /api/users/{id} | ADMIN | 사용자 삭제 |

### 과제 관리
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/projects | ALL | 과제 목록 조회 |
| GET | /api/projects/{id} | ALL | 과제 상세 조회 |
| POST | /api/projects | RESEARCHER | 과제 등록 |
| PUT | /api/projects/{id} | RESEARCHER | 과제 수정 |
| PATCH | /api/projects/{id}/status | MANAGER / ADMIN | 과제 상태 변경 |
| DELETE | /api/projects/{id} | ADMIN | 과제 삭제 |
| GET | /api/projects/{id}/history | ALL | 상태 변경 이력 조회 |

### 연구비 관리
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/projects/{id}/budget | ALL | 연구비 목록 조회 |
| POST | /api/projects/{id}/budget | RESEARCHER | 연구비 등록 |
| PUT | /api/projects/{id}/budget/{bid} | RESEARCHER | 연구비 수정 |
| DELETE | /api/projects/{id}/budget/{bid} | ADMIN | 연구비 삭제 |
| GET | /api/projects/{id}/budget/summary | ALL | 연구비 집계 조회 |

### 파일 관리
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/projects/{id}/files | ALL | 파일 목록 조회 |
| POST | /api/projects/{id}/files | RESEARCHER | 파일 업로드 |
| DELETE | /api/projects/{id}/files/{fid} | RESEARCHER / ADMIN | 파일 삭제 |
| GET | /api/projects/{id}/files/{fid} | ALL | 파일 다운로드 |

### 알림
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/notifications | ALL | 내 알림 목록 조회 |
| POST | /api/notifications/send | MANAGER / ADMIN | 알림 발송 |
| GET | /api/notifications/{id} | ALL | 알림 상세 조회 |

### 활동 로그
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/logs | ADMIN | 전체 활동 로그 조회 |
| GET | /api/logs/users/{id} | ADMIN | 특정 사용자 활동 로그 조회 |

### 통계
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/stats/projects/status | ADMIN | 과제 상태별 현황 |
| GET | /api/stats/budget/category | ADMIN | 연구비 카테고리별 집계 |
| GET | /api/stats/budget/burnrate | ADMIN | 과제별 연구비 소진율 |
| GET | /api/stats/notifications/monthly | ADMIN | 월별 알림 발송 건수 |

### 대시보드
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/dashboard | ALL | 대시보드 요약 데이터 조회 |

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

## 트랜잭션 처리

### 과제 상태 변경 트랜잭션
과제 상태 변경 시 아래 3가지 작업이 하나의 트랜잭션으로 처리되어야 합니다.
중간에 하나라도 실패하면 전체 롤백됩니다.

1. PROJECTS 테이블 status 업데이트
2. PROJECT_HISTORY 테이블 이력 INSERT
3. K_NOTIFICATIONS 테이블 알림 기록 INSERT

구현 위치: ProjectService.changeStatus() 메서드
어노테이션: @Transactional (org.springframework.transaction.annotation.Transactional)

예시:
```java
@Transactional
public void changeStatus(Long projectId, String newStatus, Long changedBy, String comment) {
    // 1. 과제 상태 변경
    // 2. 이력 저장
    // 3. 알림 기록 저장
    // 4. 카카오 알림톡 API 호출 (트랜잭션 외부에서 처리 권장)
}
```

주의: 카카오 알림톡 API 호출은 외부 API라 트랜잭션 안에 포함하지 않습니다.
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

### 다음 작업

#### 6단계 — 연구비 관리 API
- [ ] BudgetVO, BudgetRequestVO
- [ ] BudgetMapper + BudgetMapper.xml — findByProjectId, insert, update, delete, summary
- [ ] BudgetService — 목록/등록/수정/삭제/카테고리별 집계
- [ ] BudgetController — GET/POST /api/projects/{id}/budget, PUT/DELETE /api/projects/{id}/budget/{bid}, GET /api/projects/{id}/budget/summary

---

## 트러블슈팅

### 1. mvc:annotation-driven + RequestMappingHandlerAdapter 충돌 (2026-04-16)
- **증상**: API 호출 시 Tomcat 400 HTML 응답 반환, Spring 컨트롤러까지 요청이 도달하지 않음
- **원인**: `mvc:annotation-driven`과 수동 `RequestMappingHandlerAdapter` 빈을 동시에 선언하면 두 개의 핸들러 어댑터가 충돌
- **해결**: 수동 `RequestMappingHandlerAdapter` 빈 제거, `mvc:annotation-driven` 내부에 `mvc:message-converters`로 통합

```xml
<mvc:annotation-driven>
    <mvc:message-converters>
        <bean class="org.springframework.http.converter.StringHttpMessageConverter">
            <property name="defaultCharset" value="UTF-8"/>
        </bean>
        <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter">
            <property name="defaultCharset" value="UTF-8"/>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>
```

### 2. Jackson 한글 JSON 파싱 오류 (Invalid UTF-8 middle byte) (2026-04-16)
- **증상**: 한글이 포함된 JSON 요청 시 `HttpMessageNotReadableException: Invalid UTF-8 middle byte 0xd7` 오류
- **원인**: `mvc:annotation-driven` 기본 설정에서 `MappingJackson2HttpMessageConverter`의 charset이 명시되지 않아 한글 파싱 실패
- **해결**: `MappingJackson2HttpMessageConverter`에 `defaultCharset UTF-8` 명시 (위 코드 참고)

### 3. LocalDateTime 직렬화 실패로 JSON 응답 중간에 잘림 (2026-04-28)
- **증상**: `createdAt` 필드에서 JSON이 끊기고 500 에러 응답이 이어붙어 반환됨
- **원인**: `jackson-datatype-jsr310` 미포함 — Jackson이 `LocalDateTime` 직렬화 방법을 몰라 응답 스트림 도중 예외 발생
- **해결**: `pom.xml`에 `jackson-datatype-jsr310` 추가, `UserVO` 날짜 필드에 `@JsonFormat` 추가, `spring-mvc.xml`에 `JavaTimeModule` 등록
- **상세**: `docs/troubleshooting-4단계-사용자관리API.md` 참고

### 4. ObjectMapper 빈 직접 선언 시 Spring 컨텍스트 초기화 실패 (2026-04-28)
- **증상**: `spring-mvc.xml`에 `ObjectMapper` 빈 추가 후 모든 API 빈 응답 반환
- **원인**: `ObjectMapper`에 `setModules()` 메서드가 없어 `<property name="modules">` 주입 시 Spring 컨텍스트 초기화 실패
- **해결**: `ObjectMapper` 직접 선언 대신 `Jackson2ObjectMapperFactoryBean` 사용 — `modulesToInstall` 프로퍼티로 모듈 등록
- **상세**: `docs/troubleshooting-4단계-사용자관리API.md` 참고

### 5. @Transactional이 서블릿 컨텍스트 Service 빈에 적용되지 않는 문제 (2026-04-28)
- **증상**: `spring-db.xml`에 `<tx:annotation-driven>` 추가했으나 `@Transactional` 미동작
- **원인**: Spring MVC는 루트 컨텍스트(`spring-db.xml`)와 서블릿 컨텍스트(`spring-mvc.xml`)가 분리됨. `<tx:annotation-driven>`은 선언된 컨텍스트의 빈에만 적용되는데, Service 빈은 `spring-mvc.xml`의 `component-scan`으로 서블릿 컨텍스트에 등록됨
- **해결**: `spring-mvc.xml`에도 `<tx:annotation-driven transaction-manager="transactionManager"/>` 추가
- **상세**: `docs/transaction-컨텍스트-분리-이슈.md` 참고
