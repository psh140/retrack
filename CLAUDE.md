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
