/**
 * 전역 디자인 토큰 (Ant Design v5 ConfigProvider theme)
 *
 * retrack-design 스킬의 colors_and_type.css 값을 AntD 토큰 형식으로 옮긴 것.
 * 색상·모서리·폰트 값은 이 파일에서만 관리하고, 페이지 컴포넌트에서는
 * hex 값을 직접 쓰지 않고 여기서 export한 상수를 import해서 사용한다.
 *
 * JSP로 치면 공통 CSS 파일 하나를 include해서 전 화면이 같은 스타일을 쓰는 것과 같은 역할이다.
 *
 * @since 2026-07-24
 */

/** 브랜드/중립 색상 — 페이지에서 hex 직접 입력 대신 이 상수를 사용 */
export const COLORS = {
  brand: '#1677ff', // AntD blue-6 — primary
  brandHover: '#4096ff', // blue-5
  brandActive: '#0958d9', // blue-7
  brandBg: '#e6f4ff', // blue-1 — 선택된 메뉴, 옅은 채움

  bgPage: '#f5f5f5', // 페이지 배경
  bgContainer: '#ffffff', // 카드·헤더·사이더 배경

  fg: 'rgba(0, 0, 0, 0.88)', // 본문 텍스트
  fgSecondary: 'rgba(0, 0, 0, 0.65)', // 보조 텍스트
  fgTertiary: 'rgba(0, 0, 0, 0.45)', // 설명·placeholder

  border: '#d9d9d9', // 컨트롤 보더
  borderSecondary: '#f0f0f0', // 헤어라인 디바이더
  fillTertiary: 'rgba(0, 0, 0, 0.04)', // 바 차트 트랙 등 옅은 채움
};

/** 간격 단위 (4px 배수) — marginBottom, gap 등에 사용 */
export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/** 레이아웃 고정 치수 */
export const LAYOUT = {
  headerHeight: 64, // 상단 헤더 높이
  siderWidth: 220, // 좌측 사이드바 너비
  contentPadding: 24, // 본문 영역 패딩 (데스크탑)
  contentPaddingMobile: 16, // 본문 영역 패딩 (모바일)
};

/** 폰트 스택 — 시스템 폰트 우선, 한글은 Apple SD Gothic Neo / 맑은 고딕 */
const FONT_FAMILY = [
  '-apple-system',
  'BlinkMacSystemFont',
  "'Segoe UI'",
  'Roboto',
  "'Apple SD Gothic Neo'",
  "'Noto Sans KR'",
  "'Malgun Gothic'",
  "'Helvetica Neue'",
  'Arial',
  'sans-serif',
].join(', ');

/**
 * ConfigProvider에 전달할 테마 객체
 * - token: 전역 시드 토큰 (모든 컴포넌트에 적용)
 * - components: 컴포넌트별 개별 토큰 (전역 토큰을 덮어씀)
 */
const theme = {
  token: {
    // 색상
    colorPrimary: COLORS.brand,
    colorLink: COLORS.brand,
    colorBgLayout: COLORS.bgPage,
    colorBgContainer: COLORS.bgContainer,
    colorText: COLORS.fg,
    colorTextSecondary: COLORS.fgSecondary,
    colorTextTertiary: COLORS.fgTertiary,
    colorBorder: COLORS.border,
    colorBorderSecondary: COLORS.borderSecondary,

    // 모서리
    borderRadius: 6, // 버튼·인풋·카드 기본
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2, // 태그

    // 타이포
    fontFamily: FONT_FAMILY,
    fontSize: 14, // 본문 기준
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeHeading4: 20, // 페이지 제목 (Title level={4})
    fontSizeHeading5: 16,

    // 컨트롤 높이
    controlHeight: 32,

    // 간격 — AntD 내부 margin/padding 산출 기준값
    sizeUnit: 4,
    sizeStep: 4,
  },

  components: {
    // 헤더·사이더는 흰 배경, 본문 영역만 회색 (MainLayout 인라인 style 대체)
    Layout: {
      headerBg: COLORS.bgContainer,
      headerHeight: LAYOUT.headerHeight,
      headerPadding: `0 ${LAYOUT.contentPadding}px`,
      siderBg: COLORS.bgContainer,
      bodyBg: COLORS.bgPage,
    },
    Card: {
      // 카드마다 style={{ borderRadius: 6 }}을 반복하지 않도록 여기서 지정
      borderRadiusLG: 6,
    },
    Menu: {
      itemSelectedBg: COLORS.brandBg,
      itemSelectedColor: COLORS.brand,
    },
    Table: {
      headerBg: '#fafafa',
      cellPaddingBlockSM: 8,
    },
    Tag: {
      borderRadiusSM: 2,
    },
  },
};

export default theme;
