/**
 * 데이터가 없을 때 표시하는 빈 상태
 *
 * 기존에는 Empty 사용 방식이 화면마다 달랐다.
 * - Empty.PRESENTED_IMAGE_SIMPLE (DashboardPage)
 * - Table locale.emptyText에 문자열만 전달 (ProjectListPage 등)
 * - 기본 Empty 이미지 (그 외)
 * 안내 문구 어조와 여백을 함께 맞추기 위해 이 컴포넌트로 통일한다.
 *
 * [사용 예]
 *   <EmptyState description="최근 알림이 없습니다." />
 *   <Table locale={{ emptyText: <EmptyState description="등록된 과제가 없습니다." /> }} />
 *
 * @since 2026-07-24
 */
import { Empty } from 'antd';
import { SPACING } from '../../theme';

/**
 * @param {string} description - 안내 문구. 격식체(-습니다)로 작성한다.
 * @param {boolean} simple - 간략 이미지 사용 여부 (기본 true)
 *   카드 안이나 테이블 안처럼 좁은 영역에서는 간략 이미지가 적절하다.
 *   false로 주면 AntD 기본(큰) 이미지를 사용한다.
 * @param {React.ReactNode} children - 문구 아래 배치할 액션 버튼 등 — 선택
 */
function EmptyState({ description = '데이터가 없습니다.', simple = true, children }) {
  return (
    <Empty
      image={simple ? Empty.PRESENTED_IMAGE_SIMPLE : Empty.PRESENTED_IMAGE_DEFAULT}
      description={description}
      style={{ paddingTop: SPACING.md, paddingBottom: SPACING.md }}
    >
      {children}
    </Empty>
  );
}

export default EmptyState;
