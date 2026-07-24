/**
 * 과제 상태 태그
 *
 * 1단계에서 상태 레이블·색상은 constants/project.js로 단일화했지만,
 * "STATUS_MAP에서 찾아 없으면 코드 그대로 출력"하는 분기가
 * ProjectListPage·NotificationPage·ProjectDetailPage에 그대로 복사되어 있었다.
 * 그 분기를 이 컴포넌트 안으로 흡수한다.
 *
 * [사용 예]
 *   <StatusTag status="IN_PROGRESS" />              → 테이블·상세용 기본 태그
 *   <StatusTag status="IN_PROGRESS" variant="soft" /> → 대시보드 차트용 옅은 배경 태그
 *
 * @since 2026-07-24
 */
import { Tag } from 'antd';
import { STATUS_MAP } from '../../constants/project';

/**
 * @param {string} status - 과제 상태 코드 (DRAFT / SUBMITTED / ... / REJECTED)
 *   백엔드 ProjectVO.status 값을 그대로 넘긴다.
 * @param {'preset'|'soft'} variant - 표시 방식
 *   preset = AntD 프리셋 색상 태그 (목록·상세의 기본형)
 *   soft   = 옅은 배경 + 같은 계열 글자색 (대시보드 상태별 현황 차트처럼 여러 개가 세로로 늘어설 때)
 * @param {object} style - 추가 인라인 스타일 (폭 고정 등) — 선택
 */
function StatusTag({ status, variant = 'preset', style }) {
  const s = STATUS_MAP[status];

  // 정의에 없는 상태 코드는 색 없이 코드 그대로 노출 (백엔드에 상태가 추가된 경우 대비)
  if (!s) {
    return <Tag style={style}>{status ?? '-'}</Tag>;
  }

  if (variant === 'soft') {
    return (
      <Tag
        style={{
          color: s.fg,
          background: s.bg,
          borderColor: s.border,
          fontSize: 11,
          margin: 0,
          ...style,
        }}
      >
        {s.label}
      </Tag>
    );
  }

  return (
    <Tag color={s.color} style={style}>
      {s.label}
    </Tag>
  );
}

export default StatusTag;
