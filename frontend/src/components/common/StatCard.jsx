/**
 * 숫자 하나를 강조해 보여주는 통계 카드
 *
 * DashboardPage의 통계 카드 4개 + 연구비 합계 카드 + 사용자 수 카드가
 * 각각 인라인 style로 폰트 크기·색상을 직접 지정하고 있어
 * 같은 카드인데도 값 크기(30 / 28)와 글자색이 조금씩 달랐다.
 * 이 컴포넌트로 규격을 하나로 맞춘다.
 *
 * [사용 예]
 *   <StatCard label="진행 중" value={12} hint="활성 과제" color={COLORS.brand} />
 *   <StatCard label="전체 연구비 합계" value={won(total)} valueSize="small" />
 *
 * @since 2026-07-24
 */
import { Card, Grid } from 'antd';
import { COLORS, SPACING } from '../../theme';

const { useBreakpoint } = Grid;

/**
 * @param {string} label - 카드 상단 항목명 (예: '전체 과제')
 * @param {number|string} value - 강조 표시할 값. 숫자 또는 포맷된 문자열(won() 결과 등)
 * @param {string} suffix - 값 뒤에 붙일 단위 (예: '건', '명') — 선택
 * @param {string} hint - 값 아래 보조 설명 — 선택
 * @param {string} color - 값 글자색. 미지정 시 기본 본문색(theme의 COLORS.fg)
 * @param {'default'|'small'} valueSize - 값 폰트 크기.
 *   default = 숫자용(데스크탑 30 / 모바일 24), small = 금액처럼 자릿수가 긴 값용(28 / 22)
 */
function StatCard({ label, value, suffix, hint, color = COLORS.fg, valueSize = 'default' }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // 값 폰트 크기 — 화면 크기 × valueSize 조합으로 결정
  const fontSize =
    valueSize === 'small' ? (isMobile ? 22 : 28) : isMobile ? 24 : 30;

  return (
    <Card size="small">
      {/* 항목명 */}
      <div style={{ color: COLORS.fgSecondary, fontSize: 14 }}>{label}</div>

      {/* 값 — fontVariantNumeric: 'tabular-nums'는 숫자 폭을 고정해 자릿수가 흔들리지 않게 한다 */}
      <div
        style={{
          fontSize,
          fontWeight: 600,
          color,
          marginTop: SPACING.xs,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
        {/* 단위는 값보다 작게 — JSP의 <c:if> 역할 */}
        {suffix && <span style={{ fontSize: 16, marginLeft: 2 }}>{suffix}</span>}
      </div>

      {/* 보조 설명 */}
      {hint && (
        <div style={{ color: COLORS.fgTertiary, fontSize: 12, marginTop: SPACING.xxs }}>
          {hint}
        </div>
      )}
    </Card>
  );
}

export default StatCard;
