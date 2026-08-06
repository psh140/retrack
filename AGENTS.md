# Retrack — 에이전트 작업 지침

연구과제의 등록·상태 관리·연구비 집계·파일 첨부·이메일 알림을 제공하는 웹 기반 관리 시스템.
**2026-08-03부터 https://hughpark.com 에서 실제 운영 중인 서비스다.**

이 파일은 `AGENTS.md` 규약을 따르는 도구(Codex 등)의 진입점이다.
프로젝트 상세는 이미 `CLAUDE.md` 계열 문서에 정리되어 있다.
아래 4개 규칙을 지키고, 작업 영역에 해당하는 문서를 열어서 확인할 것.

---

## 반드시 지킬 것 4가지

### 1. Spring Boot가 아니다

Spring Framework 5.3.x + XML 설정 + WAR 패키징이다. 공공기관·SI 현장 환경을 상정한
의도적 선택이므로 "현대화"하지 말 것.

- `@SpringBootApplication`, `application.properties`, `spring-boot-starter-*` 등 Boot 전용 코드 금지
- 설정은 `backend/src/main/webapp/WEB-INF/` 의 `web.xml` · `spring-mvc.xml` · `spring-db.xml`에서 한다
- 빌드 결과물은 WAR이고 Tomcat 9 컨테이너에 볼륨 마운트된다

### 2. 주석에 날짜를 남긴다

- 신규 파일: 클래스/인터페이스 Javadoc에 `@since YYYY-MM-DD`
- 기존 파일 수정: `@modified YYYY-MM-DD 변경 내용` 한 줄 추가
- MyBatis XML도 동일하게 `<!-- @since YYYY-MM-DD -->` 형태로 적용

### 3. 커밋·푸시는 반드시 사용자 허락을 받는다

파일 생성·수정·삭제·이동 후 **자동으로 커밋하지 않는다.** 작업을 마치면 보고하고 대기한다.
커밋 전에는 `CLAUDE.md`의 "개발 현황" 섹션이 실제 작업 내용과 일치하는지 먼저 확인한다.
(과거에 테스트 케이스를 추가하고 현황 문서를 갱신하지 않은 채 커밋해 문제가 된 적이 있다.)

### 4. 운영 중인 서비스를 건드리는 중이다

- 백엔드를 고치면 WAR 재빌드 → EC2로 scp 업로드 → 컨테이너 재시작이 필요하다
- 운영 기동은 반드시 두 파일을 함께 지정한다:
  `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
- 운영 전용 `frontend/nginx.prod.conf`(443 블록 포함)를 `prod.yml`이 볼륨으로 덮어쓴다.
  로컬 개발은 `nginx.conf`를 쓴다 — 인증서 없는 환경에서 443 블록이 있으면 nginx가 기동하지 않는다
- 모든 자격증명은 `.env`에서만 관리한다. 소스나 문서에 평문으로 적지 않는다

---

## 작업 전에 읽을 문서

| 작업 영역 | 문서 |
|---|---|
| 백엔드 (Java / MyBatis / Spring) | `backend/CLAUDE.md` |
| 프론트엔드 (React / axios / 컴포넌트) | `frontend/CLAUDE.md` |
| 프로젝트 전반 (구조 · 실행 · 배포) | `CLAUDE.md` |

`CLAUDE.md`라는 이름이지만 **내용은 도구 중립적인 프로젝트 문서**다. 그대로 읽고 따르면 된다.

### 그 외 참고 문서

- `docs/erd.md` · `docs/api-spec.md` — 데이터 모델과 API 목록
- `docs/설계판단-인증인가.md` · `docs/설계판단-데이터모델.md` · `docs/설계판단-파일관리.md` — 왜 그렇게 설계했는지
- `docs/배포-작업기록.md` — 실제 수행한 배포 절차와 트러블슈팅 (재현용)
- `docs/개발-진행현황.md` — 전체 개발 타임라인
- `docs/troubleshooting-*.md` — 단계별로 실제 부딪힌 문제와 해결
- `docs/운영DB-접속구성.md` — 운영 DB 조회 구성 (미실행 계획)

---

## 알아둘 함정

- **로컬 PostgreSQL 포트 충돌** — Windows에 `postgresql-x64-17` 서비스가 실행 중이면
  Docker DB 컨테이너(5432)와 충돌한다. Docker 작업 전 해당 서비스를 중지해야 한다
- **mapperLocations** — mapper XML이 없는데 `spring-db.xml`의 `mapperLocations`가 그 경로를
  가리키면 빈 초기화가 실패한다. Mapper 인터페이스를 추가하면 XML도 반드시 함께 만든다
- **resultMap 누락** — snake_case 컬럼과 camelCase 필드가 다를 때 `resultType`만 쓰면
  필드가 조용히 `null`로 반환된다. `<resultMap>`을 쓴다
- **mvc:annotation-driven 중복** — 수동 `RequestMappingHandlerAdapter`와 함께 선언하면
  400 오류가 난다. 상세는 `docs/troubleshooting-초기설정.md`

---

## `CLAUDE.md` 상단의 "하네스" 섹션에 대하여

루트 `CLAUDE.md` 맨 위에 에이전트·스킬 이름이 적힌 "하네스" 표가 있다.
**이것은 Claude Code 전용 설정이며 다른 도구에서는 동작하지 않는다.**
`retrack-backend` 같은 스킬을 찾으려 하지 말 것.

그 하네스를 왜 그렇게 구성했고 무엇이 잘 됐는지는 `docs/하네스-설계기록.md`에 정리해 두었다.
다른 도구에서 유사한 체계를 구성한다면 그 문서를 재료로 쓰되, 해당 도구의 실제 스펙에 맞춰
새로 설계할 것. 기존 정의 파일(`.claude/agents/`, `.claude/skills/`)을 그대로 옮기는 것은 권하지 않는다.
