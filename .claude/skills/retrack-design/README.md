# Retrack 디자인 시스템

**Retrack**(연구과제 관리 시스템) 제품에서 추출한 디자인 시스템입니다. Retrack은 한국 공공기관 / SI 환경(예: 식약처 스타일의 정부 연구행정)을 타겟으로 한 웹 기반 연구과제 관리 시스템으로, 과제 등록, 상태 워크플로, 연구비 집계, 파일 첨부, 이메일 알림 발송 기능을 **VIEWER / RESEARCHER / MANAGER / ADMIN** 4단계 권한으로 제공합니다.

제품은 **Ant Design v5 기본 테마**를 그대로 사용한 React 18 단일 SPA로 구현되어 있어, 이 디자인 시스템은 사실상 **AntD v5 기본 비주얼 언어를 한국 엔터프라이즈 소프트웨어 컨텍스트에 적용한 것**입니다. 거기에 Retrack의 톤·레이아웃·컴포넌트 패턴이 얹혀 있는 구조예요.

## 출처

- **GitHub:** [psh140/retrack](https://github.com/psh140/retrack) — Spring/MyBatis 백엔드 + React/Vite/Ant Design 프론트엔드 모노레포. 더 정교한 디자인 작업이 필요하면 이 저장소를 직접 살펴보세요.
  - [`frontend/`](https://github.com/psh140/retrack/tree/main/frontend) — Vite + React + Ant Design v5
  - [`docs/erd.md`](https://github.com/psh140/retrack/blob/main/docs/erd.md) — 데이터 모델
  - [`docs/api-spec.md`](https://github.com/psh140/retrack/blob/main/docs/api-spec.md) — REST API 명세
  - [`CLAUDE.md`](https://github.com/psh140/retrack/blob/main/CLAUDE.md) — 프로젝트 개요

## 제품 컨텍스트

**이름:** Retrack (리트랙) — "Research" + "Track".
**대상 사용자:** 한국 공공기관 / 정부 / SI 조달 검토자(포트폴리오 데모). 내부 사용자는 연구원, 과제 매니저, 시스템 관리자.
**서피스:** 단일 웹 앱(모바일 네이티브 없음). 반응형 — 데스크탑 우선이며 모바일에서는 사이드바가 Drawer로 전환.

### 도메인 엔티티
USERS · PROJECTS · PROJECT_HISTORY · BUDGET (인건비/여비/연구활동비/기타) · FILES · ACTIVITY_LOGS · NOTIFICATIONS

### 과제 상태 흐름
`DRAFT → SUBMITTED → REVIEWING → APPROVED → IN_PROGRESS → COMPLETED` (APPROVED에서 `REJECTED`로 분기 가능)

### 페이지 구성
로그인 · 회원가입 · 대시보드 · 과제 목록 · 과제 상세(정보/연구비 탭) · 과제 등록/수정 폼 · 알림 · 관리자(사용자 / 통계 / 로그)

---

## 콘텐츠 파운데이션 (Content fundamentals)

Retrack의 모든 카피는 **한국어**로 작성되며, 한국 정부·기업 소프트웨어 특유의 격식 있는 엔터프라이즈 어조를 유지합니다.

- **언어:** 한국어가 기본. 영어는 코드, 상태 키(`DRAFT`, `APPROVED`), 역할명(`ADMIN`, `MANAGER`)에 한정.
- **말투(존댓말 레벨):** **하십시오체 / 해요체 혼합 엔터프라이즈 정중체.** 폼 안내는 `-하세요` ("입력하세요", "선택하세요"). 성공 메시지는 `-했습니다` / `-됐습니다` ("회원가입이 완료됐습니다"). 에러는 중립적인 `-했습니다` ("로그인에 실패했습니다.").
- **인칭:** 1인칭 없음. 2인칭 대명사 회피("당신" 사용 안 함). 동사 어미로 사용자를 암묵적으로 호명: "Do you have an account?"가 아니라 "계정이 없으신가요?".
- **톤:** 평이하고 사실 위주. 마케팅 어조 없음. 농담 없음, 느낌표 없음, 이모지 없음, 캐주얼 축약어 없음.
- **케이싱:** 영어 상태 키는 **SCREAMING_SNAKE_CASE** (`IN_PROGRESS`, `RESEARCH_ACTIVITY`). UI 라벨은 한국어 문장형. 버튼은 짧은 동사("로그인", "가입하기", "로그아웃", "저장", "삭제").
- **문장부호:** 안내 메시지는 마침표 ("이메일을 입력하세요."). 버튼 라벨이나 짧은 필드 라벨에는 마침표 없음.
- **숫자 표기:** 모두 반각 아라비아 숫자 (`2026-05-14`, `8,400,000원`). DB는 ISO 날짜, UI는 적절히 한국식으로 (`2026년 5월 14일`).
- **이모지·아이콘:** 카피에 이모지 절대 사용 안 함. 아이콘은 오직 `@ant-design/icons`에서 가져오고, 라벨 옆에만 배치 — 본문 안에 끼워 넣지 않음.

### 구체 예시 (코드베이스 기준)

| 위치 | 문구 |
|---|---|
| 앱 이름 | `Retrack` |
| 앱 태그라인 | `연구과제 관리 시스템` |
| 폼 안내문 | `이메일을 입력하세요`, `비밀번호를 입력하세요`, `연락처를 입력하세요 (선택)` |
| 검증 오류 | `이메일을 입력하세요.` `올바른 이메일 형식이 아닙니다.` |
| 에러 토스트 | `로그인에 실패했습니다.` `회원가입에 실패했습니다.` |
| 성공 토스트 | `회원가입이 완료됐습니다. 로그인해 주세요.` |
| 주요 CTA | `로그인`, `가입하기`, `저장`, `등록`, `삭제` |
| 푸터 링크 | `계정이 없으신가요?` `이미 계정이 있으신가요?` |
| 사이드바 메뉴 | `대시보드`, `과제 목록`, `알림`, `사용자 관리`, `통계`, `활동 로그` |
| 역할 태그 값 | `ADMIN`, `MANAGER`, `RESEARCHER`, `VIEWER` (영문 그대로) |
| 상태 키 | `DRAFT`, `SUBMITTED`, `REVIEWING`, `APPROVED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED` |
| 연구비 카테고리 | `PERSONNEL` (인건비), `TRAVEL` (여비), `RESEARCH_ACTIVITY` (연구활동비), `ETC` (기타) |

### 한국어 텍스트 간격 규칙
- 영어 상태 키 + 한국어 라벨: 반각 공백으로 구분 → `상태: APPROVED`.
- 숫자 + 단위: 공백 없음 (`1,200,000원`, `5건`, `3개월`).
- 날짜·시간: 테이블은 `YYYY-MM-DD HH:mm`, 상세 화면은 `2026년 5월 14일`.

---

## 비주얼 파운데이션 (Visual foundations)

Retrack은 **Ant Design v5 기본 테마를 그대로 사용**합니다 — 커스텀 토큰 오버라이드 없음, ConfigProvider 테마 수정 없음. 따라서 비주얼 아이덴티티는 "다듬어진 기본 AntD"이며, 여기에 Retrack 고유의 레이아웃 선택이 얹어져 있습니다.

### 색상
- **프라이머리 블루:** `#1677ff` (AntD `blue-6`) — 프라이머리 버튼, 활성 메뉴, 링크에 사용.
- **뉴트럴:** 표면은 `#fff` (카드, 헤더, 사이더) 위에 `#f5f5f5` (페이지 배경)를 쌓는 구조. 디바이더는 `#f0f0f0` (`borderColor`).
- **텍스트:** AntD 기본값 — 본문 `rgba(0,0,0,0.88)`, 보조 `rgba(0,0,0,0.65)` (`<Text type="secondary">`), 3차/비활성 `rgba(0,0,0,0.45)`.
- **역할 태그 팔레트** (시맨틱, AntD 프리셋 명):
  - `ADMIN` → red
  - `MANAGER` → orange
  - `RESEARCHER` → blue
  - `VIEWER` → default (회색)
- **상태 색상** (제안 매핑, AntD 프리셋 매칭):
  - `DRAFT` → default, `SUBMITTED` → blue, `REVIEWING` → cyan, `APPROVED` → green, `IN_PROGRESS` → geekblue, `COMPLETED` → purple, `REJECTED` → red.
- **그라데이션 없음.** 글래스모피즘 없음. 액센트 그라데이션 없음. 제품은 플랫, 헤어라인 보더, 정보 밀도 높음.

### 타이포그래피
- **폰트 스택:** AntD 기본값 — `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`. 한국어는 시스템 폴백으로 `Apple SD Gothic Neo` (macOS) / `맑은 고딕` (Windows) / `Noto Sans KR` (Linux/web 폴백)을 사용.
- 디자인 시점 일관성을 위해 **Noto Sans KR**을 Google Fonts에서 임포트하여 캐노니컬 웹 폴백으로 사용. *(⚠ 폰트 대체: 실제 제품은 시스템 폰트를 쓰며, Noto Sans KR은 디자인 미리보기용으로 가장 가까운 Google Fonts 매칭입니다. `colors_and_type.css`에서 `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap')`로 로드.)*
- **타입 스케일** (AntD Typography 기본값):
  - H1 `38px / 1.21` — 페이지 히어로 (드묾)
  - H2 `30px / 1.27` — 섹션 타이틀
  - H3 `24px / 1.33` — 카드 헤더, 페이지 타이틀 (예: 로그인의 `Retrack`)
  - H4 `20px / 1.4`
  - H5 `16px / 1.5`
  - Body `14px / 1.5715` — 기본 본문, 테이블 셀, 폼 라벨
  - Small `12px / 1.66` — 캡션, 메타
- **굵기:** 400 regular, 500 medium (테이블 헤더, `Typography.Text strong`), 600은 H1–H5.

### 간격(Spacing)
- **베이스 단위:** 4px. AntD 기본값: 4 / 8 / 16 / 24 / 32 / 48.
- **콘텐츠 패딩:** 페이지 콘텐츠 주위 `24px` (`<Content style={{ padding: 24 }}>`).
- **헤더 높이:** `64px`.
- **사이더 너비:** `220px` (Retrack 고유값; AntD 기본은 200).
- **카드 내부 패딩:** `24px`.
- **폼 항목 간격:** 항목 사이 `24px` (AntD 기본 `marginBottom`).
- **컨트롤 높이:** `32px` (AntD 기본 `controlHeight`).

### 모서리 둥글기(Radii)
- `borderRadius: 6` (AntD 기본). 인풋·버튼·카드·태그에 적용. 태그는 더 작은 `2px`. 태그 외엔 완전 원형 pill 사용 안 함.

### 그림자(Shadows)
- AntD 기본 `boxShadowTertiary`가 카드 기본: `0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)`.
- 로그인/회원가입 카드는 약간 더 띄운 느낌의 `0 2px 8px rgba(0,0,0,0.1)`로 오버라이드.
- 드롭다운, 팝오버, 모달은 AntD의 `boxShadowSecondary`. 인너 섀도우 사용 안 함.

### 보더
- **1px solid `#f0f0f0`** — 헤더/콘텐츠, 사이더/콘텐츠, 테이블 행, 카드 외곽의 헤어라인.
- 더블 보더, 장식용 보더, 카드 좌측 액센트 보더 없음.

### 배경
- 단색만 사용. 페이지 배경 `#f5f5f5`, 카드 배경 `#fff`. 로그인/회원가입 페이지도 같은 `#f5f5f5` 배경에 중앙 띄움 카드.
- 이미지·텍스처·패턴·풀블리드 사진 없음. Retrack은 **크롬리스 엔터프라이즈 소프트웨어**입니다.

### 애니메이션
- AntD 기본값 — 짧은(`200ms`) ease-in-out 페이드와 슬라이드. Drawer는 왼쪽에서 슬라이드, Modal은 페이드업, Menu hover는 100ms 동안 색 전환. 바운스·스프링 물리·큰 모션 없음. 로딩 스피너는 `<Spin>` (회전 세그먼트).
- `motionDurationMid: 0.2s`, `motionEaseInOut: cubic-bezier(0.645, 0.045, 0.355, 1)`.

### 인터랙티브 상태
- **버튼 (primary):** rest `#1677ff` / hover `#4096ff` / active `#0958d9`. 텍스트는 항상 흰색.
- **버튼 (default):** 흰 배경 / `#d9d9d9` 보더 / hover 시 보더와 텍스트 `#1677ff`.
- **버튼 (text):** 투명 배경 / hover `rgba(0,0,0,0.06)`, press `rgba(0,0,0,0.15)`.
- **링크:** `#1677ff`, hover `#69b1ff`, 기본은 밑줄 없음(hover 시 밑줄 등장).
- **인풋:** `#d9d9d9` 보더 / hover `#4096ff` / focus `#1677ff` + 2px 파란 글로우.
- **메뉴 아이템 활성:** 연한 파란 배경 `#e6f4ff` + `#1677ff` 텍스트.
- **비활성:** `rgba(0,0,0,0.04)` 배경, `rgba(0,0,0,0.25)` 텍스트, `#d9d9d9` 보더, `not-allowed` 커서.

### 레이아웃 규칙
- **고정 헤더** (64px) 상단. **고정 좌측 사이더** (220px), `md` 이상 화면에서; `md`(768px) 미만에서는 슬라이드인 `<Drawer>`로 전환.
- `<Content>` 내부에 단일 콘텐츠 컬럼. 화려한 멀티컬럼 레이아웃 없음. 테이블·폼은 합리적인 최대 폭까지 풀폭으로 늘어남.
- 인증 페이지(로그인, 회원가입)는 레이아웃 **표시 안 함** — 단색 배경 위 중앙 정렬 400px 카드 (모바일은 `min(400px, 100% - 32px)`).
- 폼은 세로형 (`layout="vertical"` — 라벨이 입력 위). 인증 페이지에서는 버튼이 `block` (풀폭), 그 외 페이지는 기본 폭.

### 반응형 브레이크포인트 (AntD 기준)
| 토큰 | 임계값 | 적용 |
|---|---|---|
| `xs` | 0px+ | 모든 화면 |
| `sm` | 576px+ | — |
| `md` | 768px+ | 데스크탑 사이드바 표시 / 폼 2-col 등 |
| `lg` | 992px+ | 대시보드 4-up 스탯 카드, 2-col 차트, 과제 상세 2-col 레이아웃 |
| `xl` | 1200px+ | — |
| `xxl` | 1600px+ | — |

UI 키트는 `useBreakpoint()` 훅을 사용해 동적으로 분기:
- **`md` 미만** — 사이드바 → Drawer (햄버거 토글), 헤더 사용자 이름·로그아웃 텍스트 숨김, 페이지 패딩 24→16, 모든 grid 1열 스택, 테이블 가로 스크롤.
- **`md`~`lg`** — 사이드바 표시, 헤더 전체, 스탯 카드 2-col, 차트 1-col 스택.
- **`lg` 이상** — 모든 멀티 컬럼 레이아웃 정상 표시.

### 아이코노그래피
- **`@ant-design/icons`만 사용** (AntD 공식 아웃라인 아이콘 세트). 아래 `아이코노그래피` 섹션 참조.

### 투명도·블러
- 사용 안 함. AntD v5 모달이 반투명 검정 스크림(`rgba(0,0,0,0.45)`)을 쓰는 것만 예외. backdrop blur, 프로스티드 글래스 표면 없음.

### 카드
- 흰색, 6px 모서리, 1px `#f0f0f0` 보더(또는 보더 없이 가벼운 섀도우), 24px 내부 패딩. 옵션 `title` 행 하단에 헤어라인 디바이더.

---

## 아이코노그래피

Retrack은 **`@ant-design/icons`** (Ant Design 공식 아이콘 라이브러리)만 사용합니다. 이모지 없음, 유니코드 심볼 아이콘 없음, 커스텀 SVG 없음, Font Awesome 없음.

### 스타일
- **기본 아웃라인** — 단일 굵기 스트로크, 채움 없음.
- 인접 텍스트에 맞춘 1em 크기 (본문 `16px`, 폼 라벨 `14px`, 메뉴 아이템 `18px`).
- `currentColor` 상속 — 컨테이너 색상을 따라감.

### 코드베이스에서 관찰된 사용 패턴

| 컴포넌트 | 사용 아이콘 |
|---|---|
| 헤더 | `MenuOutlined` (모바일 햄버거), `LogoutOutlined` |
| 사이드바 | `DashboardOutlined`, `ProjectOutlined`, `BellOutlined`, `UserOutlined`, `BarChartOutlined`, `FileTextOutlined` |
| 추가 가능 후보 | `PlusOutlined` (생성), `EditOutlined` (수정), `DeleteOutlined` (삭제), `DownloadOutlined`, `UploadOutlined`, `SearchOutlined`, `FilterOutlined`, `CheckCircleOutlined` / `CloseCircleOutlined` (상태), `PaperClipOutlined` (파일 첨부) |

### 이 디자인 시스템에서의 사용 방법
- HTML 목업에서는 AntD icons CDN 사용: `https://cdn.jsdelivr.net/npm/@ant-design/icons-svg@4/inline-svg/outlined/{NAME}.svg`.
- 공식 아이콘 브라우저: [ant.design/components/icon](https://ant.design/components/icon).
- *(⚠ Retrack 고유 커스텀 아이콘은 존재하지 않습니다. 파비콘은 Vite 기본값 — 사용자 확인 필요 항목으로 플래그됨.)*

### 로고
- **R-마크 (`assets/logo-mark.svg`)**: 둥근 사각형(반지름 6px) 위에 흰색 "R" + 하단에 짧은 트랙 라인 액센트. 28% 알파의 트랙 라인은 *Retrack*의 "track"을 시각적으로 표현. 페이지 헤더, 로그인 카드, 파비콘 등 마크가 필요한 모든 자리에 사용.
- **풀 로고 (`assets/logo.svg`)**: R-마크 + "Retrack" 워드마크(브랜드 블루, 600 weight, letter-spacing -0.4). 마케팅 페이지·문서·로그인 헤더 등 마크와 이름이 모두 필요할 때.
- **모노 변형 (`assets/logo-mono.svg`)**: 브랜드 컬러를 쓸 수 없는 환경(인쇄, B&W 자료)을 위한 `#1f1f1f` 변형.
- **파비콘**: `assets/favicon.ico` (16/32/48 멀티사이즈), `assets/favicon-16.png` ~ `favicon-512.png`. UI 키트 HTML은 모던 브라우저용 SVG 파비콘 + ICO 폴백 + 180px Apple touch icon을 모두 링크.

---

## 파일 색인

```
├── README.md                  ← 지금 보고 있는 문서
├── SKILL.md                   ← Claude Code / agent skill 진입점
├── colors_and_type.css        ← CSS 변수: AntD 토큰 + Retrack 시맨틱 변수
├── docs/
│   ├── erd.md                 ← 데이터 모델
│   └── api-spec.md            ← REST API 명세
├── frontend/                  ← psh140/retrack 원본 소스 (참고용)
├── assets/
│   ├── favicon.ico            ← Retrack R-마크 (16/32/48 멀티사이즈 ICO)
│   ├── favicon-{16,32,48,180,512}.png  ← PNG 변형
│   ├── logo-mark.svg          ← R-마크 (둥근 사각형 + 흰 R + 트랙 라인)
│   ├── logo.svg               ← 풀 로고 (마크 + 워드마크)
│   ├── logo-mono.svg          ← 모노 변형
│   └── icons/                 ← 자주 쓰는 AntD 아이콘 SVG 25종
├── preview/                   ← 디자인 시스템 탭에 등록된 스펙 카드
│   ├── colors-*.html
│   ├── type-*.html
│   ├── spacing-*.html
│   ├── component-*.html
│   └── brand-*.html
└── ui_kits/
    └── retrack-web/           ← React 웹 앱 UI 키트
        ├── README.md
        ├── index.html         ← 클릭 프로토타입 (로그인 → 대시보드 → 과제)
        └── *.jsx              ← Header, Sidebar, LoginCard, ProjectTable 등
```

---

## Claude Code 스킬로 설치하기

이 폴더 전체를 다운로드해서 `~/.claude/skills/retrack-design/`에 풀면 됩니다:

```bash
# 1) 프로젝트 다운로드 (우측 상단 다운로드 버튼) 후
unzip retrack-design.zip -d ~/.claude/skills/retrack-design

# 2) retrack 프로젝트에서 Claude Code 실행
cd ~/path/to/retrack
claude "retrack-design 스킬 써서 DashboardPage 만들어줘"
```

설치 후에는 디자인 관련 작업을 시키면 Claude가 자동으로 이 스킬의 `README.md`, `colors_and_type.css`, `ui_kits/retrack-web/`을 읽고 그 가이드에 맞춰 코드를 작성합니다.
