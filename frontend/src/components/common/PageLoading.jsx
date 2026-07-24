/**
 * 페이지 데이터 로딩 중 표시하는 스피너
 *
 * DashboardPage와 StatsPage가 동일한 마크업
 * (display:flex + justifyContent:center + paddingTop:80)을 각자 들고 있었다.
 * 로딩 화면이 화면마다 다른 위치에 뜨지 않도록 한 곳에서 관리한다.
 *
 * [사용 예]
 *   if (loading) return <PageLoading />;
 *
 * @since 2026-07-24
 */
import { Spin } from 'antd';
import { COLORS, SPACING } from '../../theme';

/**
 * @param {string} tip - 스피너 아래 안내 문구 — 선택 (예: '데이터를 불러오는 중입니다.')
 */
function PageLoading({ tip }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        // 본문 상단에서 적당히 내려온 위치 — 48 + 32 = 80px
        paddingTop: SPACING.xxl + SPACING.xl,
      }}
    >
      <Spin size="large" />
      {/* 문구가 전달된 경우에만 렌더링 — JSP의 <c:if> 역할 */}
      {tip && <div style={{ color: COLORS.fgTertiary, fontSize: 14 }}>{tip}</div>}
    </div>
  );
}

export default PageLoading;
