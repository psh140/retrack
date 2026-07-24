/**
 * 과제 상세 페이지 상단 요약 헤더
 *
 * 기존 상세 화면은 제목과 상태 태그만 헤더에 있고,
 * 상태 변경·수정·삭제 버튼은 "기본정보" 탭 안 카드 하단에 들어 있었다.
 * 그래서 연구비 탭으로 이동하면 액션 버튼에 접근할 수 없었다.
 * 이 컴포넌트가 제목·상태·주요 메타 정보·액션 버튼을 한 곳에 모아
 * 어느 탭을 보고 있든 동일하게 노출되도록 한다.
 *
 * 담당자는 표시하지 않는다 — 백엔드 ProjectVO가 managerId(숫자)만 내려주고
 * 이름을 조인해 주지 않기 때문이다. (백엔드 변경은 이 작업 범위 밖)
 *
 * @since 2026-07-24
 */
import { Button, Card, Typography, Grid } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { COLORS, SPACING } from '../../theme';
import { won, formatDate } from '../../utils/format';
import { StatusTag } from '../common';

const { Title } = Typography;
const { useBreakpoint } = Grid;

/**
 * 메타 항목 하나 (레이블 + 값)
 * 화면 상단에서 기간·총 연구비·등록일을 같은 형식으로 나열하기 위한 내부 컴포넌트다.
 *
 * @param {string} label - 항목명
 * @param {React.ReactNode} value - 표시할 값
 */
function MetaItem({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: SPACING.xs }}>
      <span style={{ color: COLORS.fgTertiary, fontSize: 12 }}>{label}</span>
      <span style={{ color: COLORS.fg, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  );
}

/**
 * @param {object} project - 과제 정보 (백엔드 ProjectVO)
 *   title / status / startDate / endDate / budgetTotal / createdAt 를 사용한다.
 * @param {Function} onBack - 「목록으로」 클릭 시 실행할 함수
 *   호출하는 쪽에서 navigate('/projects')를 넘긴다 — response.sendRedirect() 역할
 * @param {React.ReactNode} actions - 우측 액션 버튼 그룹 (상태 변경·수정·삭제)
 *   권한 분기는 호출하는 쪽에서 처리한다.
 */
function ProjectSummaryHeader({ project, onBack, actions }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Card style={{ marginBottom: isMobile ? SPACING.sm : SPACING.md }}>
      {/* 목록으로 돌아가기 */}
      <Button
        type="text"
        size="small"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ padding: 0, height: 'auto', color: COLORS.fgTertiary }}
      >
        목록으로
      </Button>

      {/* 제목 + 상태 + 우측 액션 그룹 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: SPACING.xs,
          marginTop: SPACING.xs,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs, minWidth: 0 }}>
          <Title level={4} style={{ margin: 0 }}>
            {project.title}
          </Title>
          <StatusTag status={project.status} />
        </div>

        {/* 액션 버튼이 하나도 없는 권한(VIEWER)이면 렌더링하지 않는다 — JSP의 <c:if> 역할 */}
        {actions && (
          <div style={{ display: 'flex', gap: SPACING.xs, flexWrap: 'wrap', flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>

      {/* 주요 메타 정보 — 아래 상세 표까지 내려가지 않아도 한눈에 보이도록 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: isMobile ? SPACING.xs : SPACING.lg,
          marginTop: SPACING.sm,
          paddingTop: SPACING.sm,
          borderTop: `1px solid ${COLORS.borderSecondary}`,
        }}
      >
        <MetaItem
          label="기간"
          value={`${formatDate(project.startDate)} ~ ${formatDate(project.endDate)}`}
        />
        <MetaItem label="총 연구비" value={won(project.budgetTotal)} />
        <MetaItem label="등록일" value={formatDate(project.createdAt)} />
      </div>
    </Card>
  );
}

export default ProjectSummaryHeader;
