# Retrack Web UI 키트

[`psh140/retrack`](https://github.com/psh140/retrack)의 실제 React + Ant Design v5 구현에 충실한 Retrack 웹 앱 하이파이 클릭 프로토타입입니다.

## 폴더 구성

- **`index.html`** — 진입점. 클릭 프로토타입 전체를 실행합니다: 로그인 → 대시보드 → 과제 목록 → 과제 상세. 상태는 로컬 (실제 API 없음).
- **`AppShell.jsx`** — `MainLayout` 재현: 고정 220px 사이더 + 64px 헤더 + 콘텐츠. 인앱 라우터 상태 관리.
- **`Header.jsx`** — 상단 바. `Retrack` 브랜드 마크, 역할 태그, 로그아웃 버튼.
- **`Sidebar.jsx`** — 좌측 인라인 메뉴. ADMIN 그룹, 활성 상태 강조.
- **`LoginCard.jsx`** — 중앙 정렬 400px 카드 폼 (`Form layout="vertical"`).
- **`Dashboard.jsx`** — 4분할 통계 카드 + 연구비 파이 차트 + 최근 과제 테이블.
- **`ProjectList.jsx`** — 필터 행 + 페이지네이션 테이블 with 상태 태그.
- **`ProjectDetail.jsx`** — 제목 + 탭(기본정보 / 연구비). 이력 타임라인과 연구비 테이블 포함.
- **`Primitives.jsx`** — `<Button>`, `<Input>`, `<Card>`, `<Tag>`, `<Menu>`, `<Table>`, `<Tabs>`, `<Modal>` 등 미니멀한 AntD 룩어라이크 (시각적 재현만, 실제 폼·검증 로직 없음).
- **`tokens.js`** — `colors_and_type.css`에서 가져온 색·간격·상태 매핑. 인라인 사용을 위해 JS로 변환.

## 어떤 부분이 정확한가

- 사이드바 항목·아이콘은 `frontend/src/components/Sidebar.jsx`와 정확히 일치.
- 역할 태그 색상 매핑(`ROLE_COLOR`)은 `frontend/src/components/Header.jsx`와 일치.
- 레이아웃 수치(220px 사이더, 64px 헤더, 24px 콘텐츠 패딩, `#f5f5f5` 페이지 배경)는 `MainLayout.jsx`와 일치.
- 로그인 카드는 `LoginPage.jsx`와 동일한 400px 너비 + `0 2px 8px rgba(0,0,0,0.1)` 섀도우 사용.
- 폼 라벨·검증 문구·버튼 카피는 `LoginPage.jsx` / `RegisterPage.jsx`에서 그대로 가져옴.

## 실제 vs 흉내

- ✅ 비주얼 충실도 — AntD v5 기본 테마와 픽셀 동등.
- ✅ 화면 간 클릭 내비게이션 동작.
- ✅ 사실적인 한국어 샘플 데이터 (과제명, 연구원명, 예산, 상태).
- ✅ **반응형** — `useBreakpoint()` 기반. 모바일(`md` 미만)은 사이드바를 Drawer로 전환, 헤더 컴팩트, 그리드 스택, 테이블 가로 스크롤. 태블릿(`md`~`lg`)은 사이드바 + 2-col 스탯, 1-col 차트. 데스크탑(`lg` 이상)은 풀 레이아웃.
- ❌ 실제 API 없음 — `login`은 항상 성공. 검증 라이브러리·Zustand 스토어 없음.
- ❌ 대시보드 차트는 실제 `recharts` 인스턴스가 아닌 단순 SVG.
- ❌ Modal, 드롭다운 메뉴는 시각적 표현만.
