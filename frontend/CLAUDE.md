# Retrack 프론트엔드

## 개발 규칙

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

#### 4단계 — 대시보드
- [ ] `pages/DashboardPage.jsx`

#### 5단계 — 과제 관리
- [ ] `pages/ProjectListPage.jsx`
- [ ] `pages/ProjectDetailPage.jsx` (기본정보 탭: 과제정보 + 이력 + 첨부파일 / 연구비 탭: 목록 + 집계 차트)
- [ ] `pages/ProjectFormPage.jsx` (등록/수정 공용)

#### 6단계 — 알림
- [ ] `pages/NotificationPage.jsx`

#### 7단계 — 관리자
- [ ] `pages/UserManagePage.jsx`
- [ ] `pages/StatsPage.jsx` (recharts 차트)
- [ ] `pages/ActivityLogPage.jsx`

### 다음 작업

3단계 — 인증 (LoginPage.jsx, RegisterPage.jsx)

---

## 트러블슈팅

| 파일 | 내용 |
|---|---|
| `docs/troubleshooting-프론트엔드-초기설정.md` | ESLint unused-vars, prop-types 규칙, 빌드 ≠ 린트 |
| `docs/troubleshooting-프론트엔드-3단계-인증.md` | 로그인 403 (CORS), Vite proxy Origin 헤더 덮어쓰기로 해결 |
| `docs/nginx-배포설정.md` | 배포 시 Nginx 리버스 프록시 설정 (CORS 우회, React Router 폴백) |
