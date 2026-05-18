---
name: retrack-design
description: Retrack(연구과제 관리 시스템) 브랜드에 맞는 UI와 에셋을 생성할 때 사용하는 스킬입니다. 실제 프로덕션 코드든 일회성 프로토타입/목업이든 모두 활용 가능하며, 디자인 가이드라인·색상·타입·폰트·에셋·UI 키트 컴포넌트를 포함합니다.
user-invocable: true
---

먼저 이 스킬 안의 `README.md`를 읽고, 다른 파일들도 함께 탐색하세요.

Retrack은 한국 공공기관/SI 환경용 연구과제 관리 시스템으로, **React 18 + Ant Design v5** 기본 테마 위에 구현되어 있습니다. 비주얼 아이덴티티는 "다듬어진 기본 Ant Design" — 플랫, 헤어라인 보더, 정보 밀도가 높고 격식 있는 한국 엔터프라이즈 UI입니다. 그라데이션·이모지·마케팅 어조 없음.

## 디자인 시작 전 핵심 사항
- **프라이머리 색:** `#1677ff` (AntD blue-6).
- **페이지 배경:** `#f5f5f5`. 카드 배경 `#fff`. 디바이더 `#f0f0f0`. 보더 `#d9d9d9`.
- **폰트 스택:** AntD 기본 시스템 스택. 디자인 시점에는 `colors_and_type.css`가 Google Fonts에서 Noto Sans KR을 로드.
- **카피:** 한국어, 격식 있는 엔터프라이즈 어조(`-하세요`, `-했습니다`). 이모지 없음. 2인칭 대명사 회피. 영어는 상태 키(`IN_PROGRESS`, `APPROVED`)와 역할명(`ADMIN`, `RESEARCHER`)에만.
- **아이콘:** `@ant-design/icons` 아웃라인 세트, 1em 크기, `currentColor` 상속. 자주 쓰는 25종이 `assets/icons/*.svg`에 정리되어 있음. 추가가 필요하면 https://ant.design/components/icon 에서 가져옴.
- **로고:** `assets/logo-mark.svg` (R-마크), `assets/logo.svg` (마크 + 워드마크), `assets/logo-mono.svg` (모노). 헤더·인증 카드·파비콘 등에서 사용.
- **레이아웃:** `md+`에서 고정 220px 좌측 사이더 + 64px 상단 헤더. 768px 미만에서 사이더는 Drawer로 전환. 콘텐츠 패딩 24px.

## 이 스킬에 포함된 파일
- `README.md` — 콘텐츠·비주얼·아이코노그래피 파운데이션 전체 및 출처.
- `colors_and_type.css` — 색·타입·간격·모서리·섀도우·모션을 담은 CSS 변수(`--rt-*`) 일괄 정의. Noto Sans KR 임포트 포함.
- `assets/logo-mark.svg`, `assets/logo.svg`, `assets/logo-mono.svg` — Retrack 브랜드 마크 (R 글자 + 트랙 라인 액센트, 블루/모노 변형).
- `assets/favicon.ico` + `assets/favicon-{16,32,48,180,512}.png` — 멀티사이즈 파비콘 세트.
- `assets/icons/*.svg` — AntD 아웃라인 아이콘 25종 (dashboard, project, bell, user, plus, edit, delete 등).
- `ui_kits/retrack-web/` — React+AntD 룩어라이크 클릭 프로토타입. 실제 제품의 비주얼 목업을 만들 때 여기서 복사해 사용. 컴포넌트 통째로 재사용해도 되고 스타일만 따와도 됩니다.
- `preview/` — Design System 탭에서 쓰이는 작은 스펙 카드들.
- `frontend/` — `psh140/retrack`에서 가져온 원본 소스 파일 (App.jsx, Header.jsx, Sidebar.jsx, LoginPage.jsx, RegisterPage.jsx, MainLayout.jsx, `frontend/CLAUDE.md` 등). 새 화면을 픽셀 정확하게 만들거나 React 주석 컨벤션을 따를 때 참고.
- `docs/erd.md`, `docs/api-spec.md` — 데이터 모델과 REST API 명세. 도메인 컨텍스트가 필요할 때 참고.

## 이 스킬 사용 방법
시각 산출물(슬라이드, 목업, 일회성 프로토타입 등)을 만들 때는 에셋을 복사하고 정적 HTML 파일을 생성해 사용자가 볼 수 있게 합니다. 토큰은 `colors_and_type.css`를 참조. 앱 화면이라면 `ui_kits/retrack-web/`에서 복사해 변형.

프로덕션 코드 작업이라면, 이 프로젝트는 React + Ant Design v5 + Vite + Zustand + axios 스택입니다. 특별한 이유가 없다면 AntD 컴포넌트 (`Form`, `Card`, `Button`, `Tag`, `Table`, `Menu`, `Layout`, `Drawer`, 차트는 `recharts`) 안에서 작업하세요. 한국어 주석 권장 — Java/JSP↔React 대응 주석 컨벤션은 `frontend/CLAUDE.md` 참고.

사용자가 별도 안내 없이 이 스킬을 호출하면, 무엇을 만들고 싶은지 물어보고(대상, 범위, 화면/슬라이드/에셋 구분, 변형 개수 등) 디자인 전문가로서 HTML 산출물이나 React 프로덕션 코드를 상황에 맞게 출력하세요.

## 출처
- https://github.com/psh140/retrack — 실제 제품
