/**
 * 사용자 권한 공통 상수
 *
 * 권한 계층 비교 함수(hasRole)가 ProjectListPage·ProjectDetailPage·NotificationPage에
 * 각각 중복 정의되어 있던 것을 이 파일로 통합했다.
 *
 * @since 2026-07-24
 */

/** 권한 계층 — 인덱스가 클수록 상위 권한 */
export const ROLE_ORDER = ['VIEWER', 'RESEARCHER', 'MANAGER', 'ADMIN'];

/** 권한 선택지 (사용자 관리 화면의 Select 옵션) */
export const ROLE_OPTIONS = ROLE_ORDER;

/** 역할별 Tag 색상 — 헤더의 역할 뱃지에 사용 */
export const ROLE_COLOR = {
  ADMIN: 'red',
  MANAGER: 'orange',
  RESEARCHER: 'blue',
  VIEWER: 'default',
};

/**
 * 현재 사용자가 요구 권한 이상인지 판별
 * JSP의 <c:if test="${role >= 'RESEARCHER'}"> 역할
 *
 * @param {string} userRole - 현재 로그인 사용자 역할
 * @param {string} required - 요구 권한
 * @returns {boolean} 요구 권한 이상이면 true
 */
export const hasRole = (userRole, required) =>
  ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(required);
