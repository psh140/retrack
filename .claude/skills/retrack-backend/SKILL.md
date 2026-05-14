---
name: retrack-backend
description: >
  Retrack 백엔드의 단계별 기능 구현 오케스트레이터. "N단계 구현해줘", "X 기능 만들어줘", "AOP 추가", "통계 API", "대시보드",
  "활동 로그", "이메일 템플릿", "DB 인덱스", 또는 백엔드 Java/MyBatis/Spring 관련 구현 요청 시 반드시 이 스킬을 사용하라.
  Controller, Service, Mapper, VO, MyBatis XML, Spring 설정 파일 중 하나라도 건드리는 작업이면 이 스킬을 사용할 것.
  단순 조회("이 파일이 뭐야")나 순수 버그 수정은 직접 응답 가능.
---

# Retrack 백엔드 구현 오케스트레이터

**실행 모드:** 에이전트 팀 (backend-leader 리더, java-implementer + mybatis-specialist 병렬, quality-guardian 순차)

## Phase 0: 컨텍스트 확인

1. `backend/CLAUDE.md`의 "개발 현황" 섹션을 읽어 완료/미완료 단계를 파악한다
2. 사용자 요청이 어느 단계에 해당하는지 매핑한다
3. `_workspace/` 디렉토리 존재 여부 확인:
   - 존재하고 부분 수정 요청 → **부분 재실행** (해당 레이어만 재호출)
   - 존재하고 새 단계 요청 → **새 실행** (기존 `_workspace/`를 `_workspace_prev/`로 이동)
   - 미존재 → **초기 실행**

## Phase 1: 작업 분석

backend-leader 에이전트가 수행:

1. 구현 대상 파일 목록 도출:
   - Java 레이어: Controller / Service / Mapper 인터페이스 / VO (java-implementer 담당)
   - XML 레이어: `*Mapper.xml` (mybatis-specialist 담당)
   - Spring 설정: pom.xml / spring-mvc.xml / spring-db.xml 변경 여부 판단

2. 기존 파일 확인: 수정이냐 신규 생성이냐 구분

3. 의존성 파악: 새 기능이 기존 Mapper/VO를 재사용하는지 신규 생성인지 확인

## Phase 2: 병렬 구현

java-implementer와 mybatis-specialist에게 **동시에** 작업 배분:

**java-implementer에게 전달:**
```
구현 대상:
- VO: {파일명} — {필드 목록}
- Mapper 인터페이스: {파일명} — {메서드 시그니처}
- Service: {파일명} — {메서드 목록, 비즈니스 규칙}
- Controller: {파일명} — {엔드포인트 목록, 권한}
Spring 설정 변경: {변경 항목 또는 없음}
```

**mybatis-specialist에게 전달:**
```
구현 대상 XML: {파일명}
Mapper 인터페이스 시그니처: (java-implementer 완료 후 공유)
쿼리 요구사항:
- SELECT: {조회 조건, JOIN, 정렬}
- INSERT: {필드, RETURNING 여부}
- UPDATE/DELETE: {조건}
```

## Phase 3: 품질 검증

java-implementer와 mybatis-specialist 완료 후, quality-guardian에게 검증 요청:

```
검증 대상 파일:
- Java: {파일 목록}
- XML: {파일 목록}
검증 항목: 주석 완비 + 네이밍 규칙 + 경계면 일치
```

quality-guardian이 위반 발견 시 직접 수정 후 backend-leader에게 보고.

## Phase 4: backend/CLAUDE.md 업데이트

구현 완료 후:
1. `backend/CLAUDE.md`의 "완료된 작업" 섹션에 해당 단계 체크박스(`- [x]`) 표시
2. 구현된 내용을 간략히 기록 (기존 스타일 유지)
3. "다음 작업" 섹션에서 완료된 항목 제거

## 데이터 전달 프로토콜

- **태스크 기반**: TaskCreate로 각 에이전트 작업 추적
- **메시지 기반**: SendMessage로 팀원 간 실시간 조율
- **파일 기반**: 대용량 산출물은 `_workspace/{phase}_{agent}_{artifact}.md`에 저장

## 에러 핸들링

| 에러 유형 | 처리 방식 |
|----------|---------|
| java-implementer 실패 | 해당 레이어만 1회 재시도. 재실패 시 에러 내용과 함께 사용자 보고 |
| mybatis-specialist 실패 | XML만 1회 재시도. 재실패 시 사용자 보고 |
| quality-guardian 지적 | 해당 에이전트에게 수정 요청 후 재검증 1회 |
| Spring 설정 충돌 | 기존 파일을 읽어 병합. 불확실 시 사용자에게 확인 |

## Retrack 주요 경로 참조

```
backend/src/main/java/com/retrack/
  controller/   ← REST 엔드포인트
  service/      ← 비즈니스 로직
  mapper/       ← MyBatis 인터페이스
  vo/           ← VO/DTO
  exception/    ← BadRequestException, NotFoundException, UnauthorizedException

backend/src/main/resources/
  mapper/       ← MyBatis XML
  templates/    ← 이메일 Freemarker 템플릿

backend/src/main/webapp/WEB-INF/
  spring-mvc.xml
  spring-db.xml
  web.xml

sql/schema.sql  ← DB 스키마 (FK, 컬럼 타입 확인 시 참조)
```

## 테스트 시나리오

**정상 흐름:** "9단계 활동 로그 API 구현해줘"
→ Phase 0에서 backend/CLAUDE.md 확인 → Phase 1에서 ActivityLogVO/Mapper/Service/Controller + XML 목록 도출
→ Phase 2에서 병렬 구현 → Phase 3에서 주석 검증 → Phase 4에서 backend/CLAUDE.md 업데이트

**에러 흐름:** mybatis-specialist가 컬럼명을 모를 때
→ sql/schema.sql을 읽어 확인 → 재구현 → 검증 계속
