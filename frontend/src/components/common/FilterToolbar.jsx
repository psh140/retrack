/**
 * 검색·필터 컨트롤을 담는 공통 툴바
 *
 * 기존에는 검색 영역이 두 가지 방식으로 나뉘어 있었다.
 * - Card + Row/Col 조합 (UserManagePage·ActivityLogPage)
 * - 카드 없이 div flex (ProjectListPage)
 * 같은 성격의 영역이 화면마다 다르게 보이던 것을 Card 방식으로 통일한다.
 *
 * 자식 요소(Input.Search, Select, Button 등)는 그대로 넘기면 되고,
 * 배치·간격·모바일 대응은 이 컴포넌트가 처리한다.
 *
 * [사용 예]
 *   <FilterToolbar extra={<Button onClick={handleSearch}>검색</Button>}>
 *     <Input.Search style={{ width: 260 }} ... />
 *     <Select style={{ width: 140 }} ... />
 *   </FilterToolbar>
 *
 * @since 2026-07-24
 */
import { Card, Grid } from 'antd';
import { SPACING } from '../../theme';

const { useBreakpoint } = Grid;

/**
 * @param {React.ReactNode} children - 검색 입력·필터 Select 등 컨트롤들
 *   모바일에서는 각 컨트롤이 한 줄씩 100% 너비로 쌓인다.
 * @param {React.ReactNode} extra - 우측 끝에 붙일 영역 (검색·초기화 버튼 등, 선택)
 */
function FilterToolbar({ children, extra }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Card
      size="small"
      // 카드 기본 패딩(24px)은 컨트롤 한 줄을 담기엔 과해 12px로 줄인다
      styles={{ body: { padding: SPACING.sm } }}
      style={{ marginBottom: isMobile ? SPACING.sm : SPACING.md }}
    >
      <div
        style={{
          display: 'flex',
          // 모바일: 세로로 쌓기 / 데스크탑: 가로 배치 후 넘치면 줄바꿈
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          flexWrap: 'wrap',
          gap: SPACING.xs,
        }}
      >
        {children}

        {/* extra는 항상 오른쪽 끝으로 — marginLeft:auto가 남은 공간을 밀어낸다 */}
        {extra && (
          <div style={{ marginLeft: isMobile ? 0 : 'auto', flexShrink: 0 }}>{extra}</div>
        )}
      </div>
    </Card>
  );
}

export default FilterToolbar;
