/**
 * 공통 UI 컴포넌트 모음 (배럴 파일)
 *
 * 페이지에서 컴포넌트를 하나씩 경로로 import하지 않고 여기서 한 번에 가져다 쓴다.
 *   import { PageHeader, FilterToolbar } from '../components/common';
 *
 * Java로 치면 자주 쓰는 클래스들을 한 패키지에 모아두고 그 패키지만 import하는 것과 같다.
 *
 * @since 2026-07-24
 */
export { default as PageHeader } from './PageHeader';
export { default as FilterToolbar } from './FilterToolbar';
export { default as StatCard } from './StatCard';
export { default as StatusTag } from './StatusTag';
export { default as EmptyState } from './EmptyState';
export { default as PageLoading } from './PageLoading';
