# Retrack 프론트엔드

## 개발 규칙

### 디자인 시스템

모든 UI 시각적 결정은 **`retrack-design` 스킬**을 따른다.

- 색상: `#1677ff` (primary), `#f5f5f5` (페이지 배경), `#fff` (카드), `#f0f0f0` (구분선)
- 로고: `public/logo-mark.svg`, `public/logo.svg`, `public/logo-mono.svg`
- 레이아웃: 220px 사이더 + 64px 헤더, 콘텐츠 패딩 24px
- 아이콘: `@ant-design/icons` 아웃라인 세트
- 상세 토큰·컴포넌트 패턴: `.claude/skills/retrack-design/` 참고
- 임의 디자인(색상 자의적 선택, 그라데이션, 이모지 등) 금지

### 검색 기능

백엔드 10.5단계에서 과제·사용자 검색이 구현되어 있음. 프론트엔드는 쿼리 파라미터로 전달한다.

**과제 목록 (`GET /api/projects`)**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `keyword` | string | 과제명 부분 일치 (ILIKE) |
| `status` | string | 상태 필터 (`DRAFT` / `SUBMITTED` / `REVIEWING` / `APPROVED` / `IN_PROGRESS` / `COMPLETED` / `REJECTED`) |
| `page` | number | 페이지 번호 (기본값 1) |
| `size` | number | 페이지당 건수 (10 / 20 / 50) |

**사용자 관리 (`GET /api/users`)**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `keyword` | string | 사용자명 또는 이메일 부분 일치 |
| `role` | string | 역할 필터 (`VIEWER` / `RESEARCHER` / `MANAGER` / `ADMIN`) |
| `isVerified` | boolean | 연구자 인증 여부 필터 |
| `page` | number | 페이지 번호 (기본값 1) |
| `size` | number | 페이지당 건수 (10 / 20 / 50) |

**UI 패턴**
- `Input.Search` (keyword) + `Select` (status 또는 role) 조합
- 검색 버튼 클릭 또는 Enter 시 API 호출
- 파라미터 변경 시 page를 1로 초기화

---

### 주석 규칙

모든 JSX/JS 파일에 반드시 주석을 작성한다.

**파일 상단 JSDoc**
- 파일 역할 설명 + `@since YYYY-MM-DD`
- 수정 시 `@modified YYYY-MM-DD 변경 내용` 한 줄 추가

**함수/변수 주석 원칙**
- React 훅, props, 상태값 등 React 개념은 **Java/JSP 대응 개념을 함께 명시**
- 이유: 백엔드 개발자가 프론트 코드를 읽을 때 빠르게 이해할 수 있도록

**대응 표기 예시**
```js
const navigate = useNavigate();   // response.sendRedirect() 역할
const location = useLocation();   // request.getRequestURI() 역할
const { userRole } = useAuthStore(); // session.getAttribute("userRole") 역할
const [open, setOpen] = useState(false); // private boolean open = false; + setter
```

**props 주석**
- `@param` 태그로 props 역할 설명
- 부모→자식 데이터 흐름이 불명확할 경우 출처도 명시

**조건부 렌더링**
```jsx
{/* 조건이 true일 때만 렌더링 — JSP의 <c:if> 역할 */}
{isMobile && <Button />}
```

---

## 기술 스택 결정 사항

백엔드 완료 후 아래 항목을 확정하고 작업을 시작한다.
확정된 항목은 아래 표에 직접 기록한다.

| 항목 | 결정 | 비고 |
|---|---|---|
| 언어 | JavaScript | TypeScript 미채택 |
| 빌드 도구 | Vite | CRA는 구식 |
| 상태관리 | Zustand | 전역 상태가 auth 하나뿐 — Redux는 오버스펙 |
| HTTP 클라이언트 | axios | interceptor로 토큰 자동 주입 + 401 자동 로그아웃 |
| 라우팅 | React Router v6 | |
| UI 라이브러리 | Ant Design v5 | CSS-in-JS 방식 |
| 날짜 처리 | dayjs | LocalDateTime 파싱용 |
| CSS 방식 | Ant Design 내장 | 별도 CSS 파일 최소화 |
| 환경변수 | .env (VITE_API_URL) | |
| 토큰 저장 | localStorage | |
| CORS 처리 | Vite proxy | 개발 서버(5173) → 백엔드(8080) 프록시 |
| 아이콘 | @ant-design/icons | Ant Design 세트 |
| 차트 | recharts | 통계 페이지용 |
| 코드 품질 | ESLint + Prettier | Vite 초기 세팅 시 함께 설정 |
| 반응형 | 전체 적용 | useBreakpoint() + Drawer, 모바일·데스크탑 모두 지원 |
| 페이지 목록 | 확정 | 아래 참조 |

---

## 페이지 목록

| 경로 | 페이지 | 권한 |
|---|---|---|
| `/` | 메인(랜딩) | 공개 |
| `/login` | 로그인 | 공개 |
| `/register` | 회원가입 | 공개 |
| `/dashboard` | 대시보드 | 로그인 |
| `/projects` | 과제 목록 | 로그인 |
| `/projects/new` | 과제 등록 | RESEARCHER 이상 |
| `/projects/:id` | 과제 상세 (기본정보 탭 + 연구비 탭) | 로그인 |
| `/projects/:id/edit` | 과제 수정 | 로그인 (소유권 검증은 백엔드) |
| `/notifications` | 알림 목록 | 로그인 |
| `/admin/users` | 사용자 관리 | ADMIN |
| `/admin/stats` | 통계 | ADMIN |
| `/admin/logs` | 활동 로그 | ADMIN |

---

## 개발 현황

### 완료된 작업

#### 초기 세팅 (2026-05-14)
- [x] `.vscode/settings.json` 생성 (formatOnSave, ESLint 자동 수정)
- [x] Vite 프로젝트 생성 (CRA → Vite 전환, React 18, JavaScript)
- [x] 패키지 설치 (react-router-dom, axios, zustand, dayjs, antd, @ant-design/icons, recharts)
- [x] ESLint + Prettier 설정 (.eslintrc.cjs, .prettierrc)
- [x] vite.config.js proxy 설정 (`/api` → `http://localhost:8080`)
- [x] .env 파일 (`VITE_API_URL=/api`)
- [x] 폴더 구조 생성 (pages/, components/, api/, store/)

#### 1단계 — 기반 설정 (2026-05-14)
- [x] `api/index.js` — axios 인스턴스 + request/response interceptor
- [x] `store/authStore.js` — Zustand auth store (token, userId, userRole, setAuth, logout)
- [x] `components/PrivateRoute.jsx` — 로그인 여부 확인
- [x] `components/RoleRoute.jsx` — 권한 확인 (ROLE_ORDER 배열로 계층 비교)
- [x] `App.jsx` — 라우팅 전체 구조 (페이지 추가 시 주석 해제)

#### 2단계 — 레이아웃 (2026-05-14)
- [x] `components/MainLayout.jsx` — 데스크탑: Sider 고정 / 모바일: Drawer 전환 (useBreakpoint)
- [x] `components/Header.jsx` — 앱명, 사용자 역할, 로그아웃 버튼, 모바일 햄버거 버튼
- [x] `components/Sidebar.jsx` — 메뉴 항목 (ADMIN 메뉴 권한 분기)

#### 3단계 — 인증 (2026-05-14)
- [x] `pages/LoginPage.jsx` — 이메일/비밀번호 폼, 로그인 성공 시 authStore 저장 후 /dashboard 이동
- [x] `pages/RegisterPage.jsx` — 이름/이메일/비밀번호/연락처 폼, 가입 성공 시 /login 이동
- [x] `api/index.js` — login(), register() 함수 추가

#### 4단계 — 대시보드 (2026-05-18)
- [x] `pages/DashboardPage.jsx` — 통계 카드 4개 + 상태별 바 차트 + 연구비 합계 + 최근 알림 (역할별 분기)
- [x] `api/index.js` — getDashboard() 추가
- [x] `pages/LandingPage.jsx` — 메인 랜딩 페이지 (Hero + 기능 소개 카드 4개, 공개)
- [x] `App.jsx` — `/` 경로 LandingPage로 변경, 검색 기능 파라미터 문서화

#### 5단계 — 과제 관리 (2026-05-18)
- [x] `pages/ProjectListPage.jsx` — 목록 테이블 + keyword/status 검색 + 페이지네이션 + RESEARCHER 이상 등록 버튼
- [x] `pages/ProjectDetailPage.jsx` — 기본정보 탭(과제정보 + 상태 변경 + 이력 + 첨부파일) / 연구비 탭(집계 차트 + 집행 내역)
- [x] `pages/ProjectFormPage.jsx` — 등록/수정 공용 폼 (/projects/new → 등록, /projects/:id/edit → 수정)
- [x] `api/index.js` — getProjects, getProject, createProject, updateProject, changeProjectStatus, deleteProject, getProjectHistory, getBudgets, createBudget, updateBudget, deleteBudget, getBudgetSummary, getFiles, uploadFile, deleteFile 추가

#### 6단계 — 알림 (2026-05-18)
- [x] `pages/NotificationPage.jsx` — 알림 목록 테이블 + MANAGER 이상 발송 Modal (수신자 ID / 관련 과제 ID / 메시지)
- [x] `api/index.js` — getNotifications(), sendNotification() 추가
- [x] `App.jsx` — `/notifications` 라우트 등록

#### 7단계 — 관리자
- [ ] `pages/UserManagePage.jsx` — 검색(keyword + role + isVerified 필터) 인라인 구현 포함
- [ ] `pages/StatsPage.jsx` (recharts 차트)
- [ ] `pages/ActivityLogPage.jsx`

### 다음 작업

7단계 — 관리자 페이지 (UserManagePage.jsx, StatsPage.jsx, ActivityLogPage.jsx)

---

## 트러블슈팅

| 파일 | 내용 |
|---|---|
| `docs/troubleshooting-프론트엔드-초기설정.md` | ESLint unused-vars, prop-types 규칙, 빌드 ≠ 린트 |
| `docs/troubleshooting-프론트엔드-3단계-인증.md` | 로그인 403 (CORS), Vite proxy Origin 헤더 덮어쓰기로 해결 |
| `docs/troubleshooting-5단계-과제관리-프론트엔드.md` | seed.sql IN_REVIEW vs 백엔드 REVIEWING 불일치 — DB 재시딩으로 해결 |
| `docs/nginx-배포설정.md` | 배포 시 Nginx 리버스 프록시 설정 (CORS 우회, React Router 폴백) |
