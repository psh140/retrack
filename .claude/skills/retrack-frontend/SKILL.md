---
name: retrack-frontend
description: >
  Retrack 프론트엔드(React 18) 페이지/컴포넌트 구현 오케스트레이터.
  "로그인 페이지 만들어줘", "과제 목록 화면", "대시보드 구현", "프론트엔드 작업", "React 컴포넌트",
  "API 연동", "axios 설정", "라우팅 추가" 등 프론트엔드 관련 구현 요청 시 반드시 이 스킬을 사용하라.
  HTML/CSS/JS/JSX 파일을 건드리는 작업이면 이 스킬을 사용할 것.
---

# Retrack 프론트엔드 구현 오케스트레이터

**실행 모드:** 에이전트 팀 (frontend-leader 리더, ui-builder + api-connector 병렬, frontend-qa 순차)

## 확정된 기술 스택

| 항목 | 결정 | 비고 |
|---|---|---|
| 언어 | JavaScript | TypeScript 미채택 |
| 빌드 도구 | Vite | |
| 상태관리 | Zustand | auth 전역 상태 전용 (`src/store/authStore.js`) |
| HTTP 클라이언트 | axios | interceptor로 토큰 자동 주입 + 401 자동 로그아웃 |
| 라우팅 | React Router v6 | |
| UI 라이브러리 | Ant Design v5 | CSS-in-JS 방식, 별도 CSS 파일 최소화 |
| 날짜 처리 | dayjs | LocalDateTime 파싱용 |
| 토큰 저장 | localStorage | 키: `token`, `userId`, `userRole` |
| CORS 처리 | Vite proxy | 개발 서버(5173) → 백엔드(8080) `vite.config.js`에 설정 |
| 아이콘 | @ant-design/icons | Ant Design 세트 |
| 차트 | recharts | 통계 페이지용 |
| 코드 품질 | ESLint + Prettier | |

## Phase 0: 컨텍스트 확인

1. `frontend/src/` 구조를 확인하여 기존 구현 현황 파악
2. `frontend/src/api/index.js` 존재 여부 확인:
   - 없으면 api-connector가 먼저 axios 인스턴스 + 전체 API 함수 뼈대 생성
   - 있으면 필요한 함수만 추가
3. `frontend/src/store/authStore.js` 존재 여부 확인:
   - 없으면 ui-builder가 먼저 생성
4. 요청된 페이지가 App.js에 라우팅 등록되어 있는지 확인

## Phase 1: 작업 분석

frontend-leader 에이전트가 수행:

1. 구현 대상 페이지 식별
2. 필요한 공통 컴포넌트 확인 (Header, Sidebar가 없으면 먼저 구현)
3. 필요한 API 함수 목록 도출 (docs/api-spec.md 참조)
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
Ant Design v5 컴포넌트 사용 (Table, Form, Button, Modal, Select 등)
날짜는 dayjs로 파싱
```

**api-connector에게 전달:**
```
추가/확인할 API 함수:
- {함수명}: {메서드} {엔드포인트}
- {함수명}: {메서드} {엔드포인트}
axios 인스턴스(src/api/index.js)에 함수 추가
```

**api-connector 필수 프로토콜 — 반환 타입 검증:**
각 API 함수 작성 전, 반드시 아래 순서로 반환 타입을 확인한다:
1. `backend/src/main/java/com/retrack/controller/{도메인}Controller.java` 해당 메서드 반환값 확인
   - `ApiResponse.ok("메시지", projectId)` → `res.data.data`는 **Long(단일값)**
   - `ApiResponse.ok("메시지", projectVO)` → `res.data.data`는 **객체** → `.fieldName` 접근 가능
   - `ApiResponse.ok("메시지", list)` → `res.data.data`는 **배열**
   - `PageResponse` 반환 → `res.data.data.items`, `res.data.data.totalCount` 등
2. `api-spec.md`는 엔드포인트 목록 확인용으로만 사용, 반환 타입의 최종 기준은 컨트롤러 코드
3. 확인한 반환 타입을 JSDoc 주석으로 명시:
   ```js
   /** 과제 등록 — 성공 시 data: projectId (Long) */
   export const createProject = (data) => api.post('/projects', data);
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

## Phase 4: QA 검증 (frontend-qa) ← 생략 불가. 반드시 실행할 것.

ui-builder + api-connector + 라우팅 등록 완료 후, **사용자에게 보고하기 전에** frontend-qa 에이전트를 실행한다.
QA를 건너뛰고 사용자에게 완료 보고하는 것은 금지다.
위반 발견 시 직접 수정 후 frontend-leader에게 보고한다. 수정 완료 후 사용자에게 최종 보고한다.

**검증 항목 체크리스트:**

### 1. API 응답 구조 일치
- `docs/api-spec.md`와 백엔드 컨트롤러 반환값을 확인하여 `res.data.data` 사용이 올바른지 검증
- 단일값 반환(Long, String) vs 객체 반환(VO) 구분 — `res.data.data.fieldName` 오참조 방지
  - 예시 버그: `createProject` 반환값은 `Long(projectId)` → `res.data.data`가 정답, `res.data.data.projectId`는 undefined

### 2. fetch 에러 처리
- 네이티브 `fetch` 사용 시 `res.ok` 체크 여부 확인 — 누락 시 에러 응답이 파일/데이터로 처리됨
- axios가 아닌 fetch를 쓰는 이유가 있는지 확인 (파일 다운로드처럼 Authorization 헤더 필요 시에만 허용)

### 3. 인증 상태 처리
- 공개 페이지(LandingPage, LoginPage, RegisterPage)에 로그인 상태 감지 후 `/dashboard` 리다이렉트 로직 존재 여부
- PrivateRoute로 감싸지 않은 로그인 필요 페이지 없는지 확인

### 4. 라우팅 일관성
- `navigate('/경로')` 호출 대상이 `App.jsx`에 등록된 경로와 일치하는지 확인
- 동적 경로(`/projects/:id`) navigate 시 실제 ID 값이 올바르게 전달되는지 확인

### 5. 열거형 상수 동기화
- 상태값(STATUS), 카테고리(CATEGORY) 등 열거형 상수가 백엔드 소스와 일치하는지 확인
  - 백엔드 기준: `ProjectService.VALID_STATUSES`, `BudgetService.VALID_CATEGORIES`
  - 시드 데이터(`sql/seed.sql`)도 동일한 값 사용 여부 확인
  - 예시 버그: seed.sql의 `IN_REVIEW` vs 백엔드 `REVIEWING`

### 6. 권한 분기 일치
- 프론트 `hasRole(userRole, 'ROLE')` 조건이 백엔드 `@RequiredRole("ROLE")`과 일치하는지 확인
- MANAGER/ADMIN 전용 기능이 프론트에서도 동일 레벨로 제한되는지 확인

### 7. 상태 갱신 누락
- 생성/수정/삭제 후 관련 `fetchXxx()` 호출로 화면 데이터가 최신화되는지 확인
- 리프레시 시 불필요한 전체 Spin 스피너 노출 여부 (`showSpinner` 파라미터 분리 패턴 적용)

### 8. 주석 규칙 (`frontend/CLAUDE.md` 기준)
- 파일 상단 JSDoc(`@since`, 수정 시 `@modified`) 존재 여부
- React 훅·props에 Java/JSP 대응 개념 주석 여부

---

## Phase 5: 의존성 확인

`frontend/package.json`에 필요한 패키지가 있는지 확인:
- `react-router-dom` — 라우팅
- `axios` — HTTP 클라이언트
- `zustand` — 상태관리
- `dayjs` — 날짜 처리
- `antd` — UI 라이브러리

없으면 설치 명령어를 사용자에게 안내:
```bash
cd frontend && npm install react-router-dom axios zustand dayjs antd @ant-design/icons recharts
```

## Phase 6: frontend/CLAUDE.md 업데이트

구현 및 QA 완료 후 frontend-leader가 직접 수행:

1. `frontend/CLAUDE.md`의 "완료된 작업" 섹션에 해당 단계 체크박스(`- [x]`) 표시
2. 구현된 파일과 주요 기능을 간략히 기록 (기존 스타일 유지)
3. "다음 작업" 섹션을 다음 단계로 업데이트
4. 트러블슈팅이 발생했다면 "트러블슈팅" 표에 파일명과 내용 한 줄 추가

---

## 데이터 전달 프로토콜

- **메시지 기반**: ui-builder ↔ api-connector 간 함수 시그니처 공유
- **파일 기반**: 각 에이전트가 완성한 파일을 직접 저장

## 에러 핸들링

| 에러 유형 | 처리 방식 |
|----------|---------|
| API 연동 실패 | api-connector 1회 재시도, 재실패 시 사용자 보고 |
| 컴포넌트 에러 | ui-builder 수정 요청 |
| 패키지 미설치 | 설치 명령어를 사용자에게 안내 |
| frontend-qa 지적 | 해당 에이전트(ui-builder 또는 api-connector)에게 수정 요청 후 재검증 1회 |

## Retrack 프론트엔드 경로 참조

```
frontend/src/
  pages/        ← 페이지 컴포넌트
  components/   ← 공통 컴포넌트 (Header, Sidebar, PrivateRoute, RoleRoute)
  api/
    index.js    ← axios 인스턴스 + interceptor + API 함수 전체
  store/
    authStore.js ← Zustand auth 상태 (token, userId, userRole, setAuth, logout)
  App.js        ← 라우팅 설정
```

## 백엔드 연동 기준

- API 기본 경로: `/api` (Vite proxy가 8080으로 전달)
- 인증: `Authorization: Bearer {JWT}` 헤더 (interceptor 자동 주입)
- 응답 형식: `{ success: true, message: "", data: {...} }` → `response.data.data` 추출 후 사용
- 토큰: `localStorage.getItem('token')`
- 권한: `localStorage.getItem('userRole')` (`VIEWER/RESEARCHER/MANAGER/ADMIN`)
- 401 응답 시: localStorage 클리어 + `/login` 리다이렉트 (interceptor 자동 처리)

## 구현 순서 권장

1. `api/index.js` (axios 인스턴스 + interceptor + 전체 API 함수 뼈대)
2. `store/authStore.js` (Zustand auth store)
3. `components/PrivateRoute.js`, `components/RoleRoute.js`
4. `components/Header.js`, `components/Sidebar.js`
5. `pages/LoginPage.js`, `pages/RegisterPage.js`
6. `pages/DashboardPage.js`
7. `pages/ProjectListPage.js` → `ProjectDetailPage.js` → `ProjectFormPage.js`
8. `pages/BudgetPage.js`, `pages/FilePage.js`
9. `pages/NotificationPage.js`
10. `pages/UserManagePage.js`, `pages/StatsPage.js`, `pages/ActivityLogPage.js`

## 테스트 시나리오

**정상 흐름:** "로그인 페이지 만들어줘"
→ Phase 0에서 api/index.js, authStore.js 없음 확인
→ api-connector가 axios 인스턴스 + interceptor 생성
→ ui-builder가 authStore.js + LoginPage.js 구현
→ App.js 라우팅 등록

**에러 흐름:** CORS 에러 발생
→ vite.config.js의 proxy 설정 확인 (`/api` → `http://localhost:8080`)
