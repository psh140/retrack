---
name: retrack-frontend
description: >
  Retrack 프론트엔드(React 18) 페이지/컴포넌트 구현 오케스트레이터.
  "로그인 페이지 만들어줘", "과제 목록 화면", "대시보드 구현", "프론트엔드 작업", "React 컴포넌트",
  "API 연동", "axios 설정", "라우팅 추가" 등 프론트엔드 관련 구현 요청 시 반드시 이 스킬을 사용하라.
  HTML/CSS/JS/JSX 파일을 건드리는 작업이면 이 스킬을 사용할 것.
---

# Retrack 프론트엔드 구현 오케스트레이터

**실행 모드:** 에이전트 팀 (frontend-leader 리더, ui-builder + api-connector 병렬)

## Phase 0: 컨텍스트 확인

1. `frontend/src/` 구조를 확인하여 기존 구현 현황 파악
2. `frontend/src/api/index.js` 존재 여부 확인:
   - 없으면 api-connector가 먼저 axios 인스턴스 + 전체 API 함수 뼈대 생성
   - 있으면 필요한 함수만 추가
3. 요청된 페이지가 App.js에 라우팅 등록되어 있는지 확인

## Phase 1: 작업 분석

frontend-leader 에이전트가 수행:

1. 구현 대상 페이지 식별
2. 필요한 공통 컴포넌트 확인 (Header, Sidebar가 없으면 먼저 구현)
3. 필요한 API 함수 목록 도출 (CLAUDE.md의 API 목록 참조)
4. 권한 체크 필요 여부 판단

## Phase 2: 병렬 구현

ui-builder와 api-connector에게 **동시에** 작업 배분:

**ui-builder에게 전달:**
```
구현 대상 페이지: {페이지명}
경로: {URL 경로}
필요한 UI 요소:
- {목록, 폼, 버튼 등}
권한 분기:
- {역할}만 볼 수 있는 요소: {요소}
사용할 API 함수명: (api-connector가 구현 예정)
```

**api-connector에게 전달:**
```
추가/확인할 API 함수:
- {함수명}: {메서드} {엔드포인트}
- {함수명}: {메서드} {엔드포인트}
```

## Phase 3: App.js 라우팅 등록

구현 완료 후 `frontend/src/App.js`에 라우트 추가:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 인증 필요 라우트
<Route path="/projects" element={<PrivateRoute><ProjectListPage /></PrivateRoute>} />

// 권한 필요 라우트
<Route path="/admin/users" element={<RoleRoute role="ADMIN"><UserManagePage /></RoleRoute>} />

// 공개 라우트
<Route path="/login" element={<LoginPage />} />
```

## Phase 4: 의존성 확인

`frontend/package.json`에 필요한 패키지가 있는지 확인:
- `react-router-dom` — 라우팅
- `axios` — HTTP 클라이언트

없으면 설치 명령어를 사용자에게 안내:
```bash
cd frontend && npm install react-router-dom axios
```

## 데이터 전달 프로토콜

- **메시지 기반**: ui-builder ↔ api-connector 간 함수 시그니처 공유
- **파일 기반**: 각 에이전트가 완성한 파일을 직접 저장

## 에러 핸들링

| 에러 유형 | 처리 방식 |
|----------|---------|
| API 연동 실패 | api-connector 1회 재시도, 재실패 시 사용자 보고 |
| 컴포넌트 에러 | ui-builder 수정 요청 |
| 패키지 미설치 | 설치 명령어를 사용자에게 안내 |

## Retrack 프론트엔드 경로 참조

```
frontend/src/
  pages/        ← 페이지 컴포넌트
  components/   ← 공통 컴포넌트 (Header, Sidebar, PrivateRoute, RoleRoute)
  api/
    index.js    ← axios 인스턴스 + API 함수 전체
  App.js        ← 라우팅 설정
```

## 백엔드 연동 기준

- 백엔드: `http://localhost:8080`
- 인증: `Authorization: Bearer {JWT}` 헤더
- 응답 형식: `{ success: true, message: "", data: {...} }` → data 추출 후 사용
- 권한: localStorage의 `userRole` 값 (`VIEWER/RESEARCHER/MANAGER/ADMIN`)

## 구현 순서 권장

1. `api/index.js` (axios + 전체 API 함수 뼈대)
2. `components/Header.js`, `components/Sidebar.js`, `components/PrivateRoute.js`, `components/RoleRoute.js`
3. `pages/LoginPage.js`, `pages/RegisterPage.js`
4. `pages/DashboardPage.js`
5. `pages/ProjectListPage.js` → `ProjectDetailPage.js` → `ProjectFormPage.js`
6. `pages/BudgetPage.js`, `pages/FilePage.js`
7. `pages/NotificationPage.js`
8. `pages/UserManagePage.js`, `pages/StatsPage.js`

## 테스트 시나리오

**정상 흐름:** "로그인 페이지 만들어줘"
→ Phase 0에서 api/index.js 없음 확인 → api-connector가 먼저 생성
→ ui-builder가 LoginPage.js 구현 → App.js 라우팅 등록

**에러 흐름:** CORS 에러 발생
→ 백엔드 spring-mvc.xml CORS 설정 확인 안내 (이미 localhost:3000 허용됨)
