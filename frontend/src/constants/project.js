/**
 * 과제 도메인 공통 상수
 *
 * 상태·연구비 카테고리의 한글 레이블과 색상을 이 파일 한 곳에서 관리한다.
 * (기존에는 DashboardPage·ProjectListPage·ProjectDetailPage·StatsPage가 각자 정의해
 *  같은 상태가 화면마다 '작성중'/'초안'처럼 다르게 표시되는 문제가 있었다.)
 *
 * Java로 치면 상태 enum + 라벨 프로퍼티 파일 역할이다.
 *
 * @since 2026-07-24
 */
import { COLORS } from '../theme';

/**
 * 과제 상태 정의 — 백엔드 ProjectService의 상태 코드와 1:1 대응
 * - value  : DB에 저장되는 상태 코드
 * - label  : 화면 표시용 한글 레이블
 * - color  : AntD Tag의 preset 색상명 (<Tag color="blue">)
 * - fg/bg/border : 커스텀 태그·바 차트에서 쓰는 hex 값
 */
export const PROJECT_STATUSES = [
  { value: 'DRAFT',       label: '작성중', color: 'default',  fg: '#595959', bg: '#fafafa', border: '#d9d9d9' },
  { value: 'SUBMITTED',   label: '제출',   color: 'blue',     fg: '#1677ff', bg: '#e6f4ff', border: '#91caff' },
  { value: 'REVIEWING',   label: '검토중', color: 'cyan',     fg: '#13c2c2', bg: '#e6fffb', border: '#87e8de' },
  { value: 'APPROVED',    label: '승인',   color: 'green',    fg: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
  { value: 'IN_PROGRESS', label: '진행중', color: 'geekblue', fg: '#2f54eb', bg: '#f0f5ff', border: '#adc6ff' },
  { value: 'COMPLETED',   label: '완료',   color: 'purple',   fg: '#722ed1', bg: '#f9f0ff', border: '#d3adf7' },
  { value: 'REJECTED',    label: '반려',   color: 'red',      fg: '#f5222d', bg: '#fff1f0', border: '#ffa39e' },
];

/** 상태 코드로 상태 정의를 찾기 위한 Map — STATUS_MAP['DRAFT'].label */
export const STATUS_MAP = Object.fromEntries(
  PROJECT_STATUSES.map((s) => [s.value, s])
);

/** 상태 코드 배열 — 차트 등에서 전체 상태를 순회할 때 사용 */
export const STATUS_VALUES = PROJECT_STATUSES.map((s) => s.value);

/** 상태 코드 → 한글 레이블 (Map 형태가 필요한 곳에서 사용) */
export const STATUS_LABELS = Object.fromEntries(
  PROJECT_STATUSES.map((s) => [s.value, s.label])
);

/**
 * 상태 전이 규칙 — 백엔드 ProjectService.VALID_TRANSITIONS 와 동일하게 유지할 것
 * 현재 상태에서 변경 가능한 다음 상태 목록
 */
export const VALID_TRANSITIONS = {
  DRAFT:       ['SUBMITTED'],
  SUBMITTED:   ['REVIEWING'],
  REVIEWING:   ['APPROVED', 'REJECTED'],
  APPROVED:    ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED:   [],
  REJECTED:    [],
};

/**
 * 연구비 카테고리 정의 — 백엔드 BudgetService.VALID_CATEGORIES 와 대응
 * color는 카테고리별 차트·집계 카드에 사용
 */
export const BUDGET_CATEGORIES = [
  { value: 'PERSONNEL',         label: '인건비',    color: COLORS.brand },
  { value: 'TRAVEL',            label: '여비',      color: '#13c2c2' },
  { value: 'RESEARCH_ACTIVITY', label: '연구활동비', color: '#52c41a' },
  { value: 'ETC',               label: '기타',      color: '#8c8c8c' },
];

/** 카테고리 코드 → 한글 레이블 */
export const CATEGORY_LABELS = Object.fromEntries(
  BUDGET_CATEGORIES.map((c) => [c.value, c.label])
);

/** 카테고리 코드 → 차트 색상 */
export const CATEGORY_COLORS = Object.fromEntries(
  BUDGET_CATEGORIES.map((c) => [c.value, c.color])
);
