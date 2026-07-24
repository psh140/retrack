/**
 * 표시용 포맷 유틸
 *
 * 원화 포맷 함수(won)가 여러 페이지에 중복 정의되어 있던 것을 통합했다.
 * 날짜 포맷 문자열도 이 파일에서 관리해 화면별 표기가 어긋나지 않도록 한다.
 *
 * @since 2026-07-24
 */
import dayjs from 'dayjs';

/** 날짜 포맷 — 목록·상세의 날짜 컬럼 */
export const DATE_FORMAT = 'YYYY-MM-DD';

/** 일시 포맷 — 로그·이력의 시각 컬럼 */
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';

/**
 * 숫자를 한국 원화 표기로 변환
 * @param {number} n - 금액 (null/undefined면 0으로 처리)
 * @returns {string} 예) 1234567 → "1,234,567원"
 */
export const won = (n) => (n ?? 0).toLocaleString('ko-KR') + '원';

/**
 * 값이 있으면 날짜 포맷, 없으면 '-' 반환
 * @param {string} value - 날짜 문자열
 * @param {string} format - 포맷 (기본 YYYY-MM-DD)
 * @returns {string} 포맷된 날짜 또는 '-'
 */
export const formatDate = (value, format = DATE_FORMAT) =>
  value ? dayjs(value).format(format) : '-';

/**
 * 값이 있으면 일시 포맷, 없으면 '-' 반환
 * @param {string} value - 일시 문자열
 * @returns {string} 포맷된 일시 또는 '-'
 */
export const formatDateTime = (value) => formatDate(value, DATETIME_FORMAT);
