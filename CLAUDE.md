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
- `com.retrack.controller`: @RestController, @RequestMapping("/api/...")
- `com.retrack.service`: 비즈니스 로직, @Service
- `com.retrack.mapper`: MyBatis Mapper 인터페이스, @Mapper
- `com.retrack.vo`: VO/DTO 클래스

### 네이밍 규칙
- 클래스명: PascalCase (예: ProjectController)
- 메서드명: camelCase (예: getProjectList)
- 테이블 컬럼명: snake_case (예: project_id)
- API URL: kebab-case (예: /api/projects/{id}/status)

### 응답 형식
- 모든 API 응답은 JSON
- Content-Type: application/json; charset=UTF-8

### 주의사항
- Spring Framework 5.3.x 사용 (Spring Boot 아님)
- web.xml, spring-mvc.xml, spring-db.xml XML 설정 방식
- MyBatis mapper XML은 src/main/resources/mapper/ 에 위치
- WAR 패키징 방식으로 빌드
- mapperLocations 설정은 mapper XML 파일이 없으면 주석 처리 필요
- Windows 환경에서 로컬 PostgreSQL 서비스(postgresql-x64-17)가 실행 중이면 포트 충돌 발생 → 작업 전 중지 필요

---

## 개발 현황

### 완료된 작업

#### 1단계 — 기반 설정
- [x] DB 스키마 확인 (7개 테이블 모두 정상)
- [x] pom.xml — JWT(jjwt 0.11.5), BCrypt(spring-security-crypto 5.8.13) 의존성 추가
- [x] spring-db.xml — DB host `localhost` → `db` 수정, mapperLocations 활성화
- [x] spring-mvc.xml — CORS 설정 (localhost:3000 허용), mvc:annotation-driven + UTF-8 인코딩 설정
- [x] ApiResponse — 공통 API 응답 포맷 (`success`, `message`, `data`)

#### 2단계 — 인증 API
- [x] UserVO, LoginRequestVO, RegisterRequestVO
- [x] JwtUtil — 토큰 생성/검증, 만료 30분, HMAC-SHA256
- [x] AuthMapper + AuthMapper.xml — insertUser, findByEmail, existsByEmail
- [x] AuthService — 회원가입(BCrypt 암호화), 로그인(JWT 발급)
- [x] AuthController — POST /api/auth/register, /login, /logout
- [x] 인증 방식: JWT (React/Spring 분리 구조)

### 다음 작업

#### 3단계 — JWT 인터셉터
- [ ] `JwtInterceptor` 구현
  - `Authorization: Bearer {token}` 헤더에서 토큰 추출
  - 토큰 없음 → 401 반환
  - 토큰 유효하지 않음 → 401 반환
  - 권한 부족 → 403 반환
  - 토큰 유효 시 userId, role을 request attribute에 저장 (컨트롤러에서 꺼내 쓸 수 있도록)
- [ ] `spring-mvc.xml`에 인터셉터 등록
  - `/api/auth/**` 제외하고 나머지 `/api/**`에 적용
- [ ] 인터셉터에서 권한 체크 방법 결정 (어노테이션 방식 or 인터셉터 내부 URL 매핑)

---

## 트러블슈팅

### 1. mvc:annotation-driven + RequestMappingHandlerAdapter 충돌
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

### 2. Jackson 한글 JSON 파싱 오류 (Invalid UTF-8 middle byte)
- **증상**: 한글이 포함된 JSON 요청 시 `HttpMessageNotReadableException: Invalid UTF-8 middle byte 0xd7` 오류
- **원인**: `mvc:annotation-driven` 기본 설정에서 `MappingJackson2HttpMessageConverter`의 charset이 명시되지 않아 한글 파싱 실패
- **해결**: `MappingJackson2HttpMessageConverter`에 `defaultCharset UTF-8` 명시 (위 코드 참고)
