# Retrack — 연구과제 관리 시스템

## 하네스: Retrack

**트리거:**
- 백엔드 (Java/MyBatis/Spring) 작업 → `retrack-backend` 스킬
- 프론트엔드 (React/axios/컴포넌트) 작업 → `retrack-frontend` 스킬
- 프론트엔드 UI 디자인 작업 → `retrack-design` 스킬 (색상·로고·레이아웃·컴포넌트 스타일 등 모든 시각적 결정은 이 스킬의 가이드라인을 따른다. 임의 디자인 금지)
- 단순 질문이나 파일 조회는 직접 응답 가능

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-10 | 초기 구성 (백엔드 팀) | backend-leader, java-implementer, mybatis-specialist, quality-guardian | 반복 구현 패턴 자동화 |
| 2026-05-10 | 프론트엔드 팀 추가 | frontend-leader, ui-builder, api-connector | 페이지 단위 React 구현 자동화 |
| 2026-05-18 | 프론트엔드 QA 강화 | frontend-qa 추가, api-connector 반환 타입 검증 프로토콜, frontend/CLAUDE.md 업데이트 Phase 추가 | 백엔드보다 사용자 수동 검토 비중이 높아 자동화 필요 |

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
  backend/CLAUDE.md
  frontend/CLAUDE.md
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

### 커밋 전 체크
커밋 전에 `backend/CLAUDE.md`와 `frontend/CLAUDE.md`의 개발 현황이 실제 작업 내용과 일치하는지 확인한다.
