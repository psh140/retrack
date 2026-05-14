# Retrack 프론트엔드

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

#### 초기 세팅
- [ ] Vite 프로젝트 생성
- [ ] 패키지 설치 (react-router-dom, axios, zustand, dayjs, antd, @ant-design/icons, recharts)
- [ ] ESLint + Prettier 설정
- [ ] vite.config.js proxy 설정 (`/api` → `http://localhost:8080`)
- [ ] .env 파일 (`VITE_API_URL=/api`)
- [ ] 폴더 구조 생성 (pages/, components/, api/, store/)

#### 1단계 — 기반 설정
- [ ] `api/index.js` — axios 인스턴스 + request/response interceptor
- [ ] `store/authStore.js` — Zustand auth store (token, userId, userRole, setAuth, logout)
- [ ] `components/PrivateRoute.js` — 로그인 여부 확인
- [ ] `components/RoleRoute.js` — 권한 확인
- [ ] `App.js` — 라우팅 전체 구조

#### 2단계 — 레이아웃
- [ ] `components/Header.js`
- [ ] `components/Sidebar.js`

#### 3단계 — 인증
- [ ] `pages/LoginPage.js`
- [ ] `pages/RegisterPage.js`

#### 4단계 — 대시보드
- [ ] `pages/DashboardPage.js`

#### 5단계 — 과제 관리
- [ ] `pages/ProjectListPage.js`
- [ ] `pages/ProjectDetailPage.js` (기본정보 탭: 과제정보 + 이력 + 첨부파일 / 연구비 탭: 목록 + 집계 차트)
- [ ] `pages/ProjectFormPage.js` (등록/수정 공용)

#### 6단계 — 알림
- [ ] `pages/NotificationPage.js`

#### 7단계 — 관리자
- [ ] `pages/UserManagePage.js`
- [ ] `pages/StatsPage.js` (recharts 차트)
- [ ] `pages/ActivityLogPage.js`

### 다음 작업

초기 세팅부터 시작
