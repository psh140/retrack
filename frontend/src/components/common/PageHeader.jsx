/**
 * 페이지 상단 헤더 (제목 + 설명 + 우측 액션 영역)
 *
 * 기존에는 화면마다 제목 마크업이 제각각이었다.
 * - Title level={4} + marginBottom (StatsPage·UserManagePage·ActivityLogPage)
 * - flex 컨테이너 + Title margin:0 + 버튼 (ProjectListPage·NotificationPage)
 * - div에 fontSize/fontWeight 직접 지정 (DashboardPage)
 * 이 컴포넌트 하나로 통일해 제목 크기·아래 여백·버튼 정렬이 모든 화면에서 같아지도록 한다.
 *
 * JSP로 치면 각 페이지 상단에 반복해서 넣던 <div class="page-title"> 블록을
 * 공통 include 파일 하나로 뺀 것과 같은 역할이다.
 *
 * [사용 예]
 *   <PageHeader
 *     title="과제 목록"
 *     description="등록된 연구과제를 조회합니다."
 *     extra={<Button type="primary">과제 등록</Button>}
 *   />
 *
 * @since 2026-07-24
 */
import { Typography, Grid } from 'antd';
import { SPACING } from '../../theme';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid; // 현재 화면 크기를 감지하는 Ant Design 훅

/**
 * @param {string} title - 페이지 제목 (필수)
 * @param {React.ReactNode} description - 제목 아래 보조 설명 (선택)
 * @param {React.ReactNode} extra - 우측에 배치할 액션 영역 (등록·발송 버튼 등, 선택)
 *   권한에 따라 버튼을 숨길 때는 호출하는 쪽에서 조건부로 넘긴다.
 *   예) extra={hasRole(userRole, 'RESEARCHER') && <Button>과제 등록</Button>}
 */
function PageHeader({ title, description, extra }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md; // md(768px) 미만이면 모바일

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        // 설명이 있으면 두 줄이 되므로 위쪽 정렬, 없으면 세로 가운데 정렬
        alignItems: description ? 'flex-start' : 'center',
        flexWrap: 'wrap', // 모바일에서 버튼이 아래줄로 내려가도록
        gap: SPACING.xs,
        marginBottom: isMobile ? SPACING.sm : SPACING.md,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {/* level={4} = 20px — 전 화면 페이지 제목의 기준 크기 (theme.js fontSizeHeading4) */}
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>

        {/* 조건이 true일 때만 렌더링 — JSP의 <c:if> 역할 */}
        {description && (
          <Text type="secondary" style={{ display: 'block', marginTop: SPACING.xxs }}>
            {description}
          </Text>
        )}
      </div>

      {extra && <div style={{ flexShrink: 0 }}>{extra}</div>}
    </div>
  );
}

export default PageHeader;
