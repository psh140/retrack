/**
 * 권한(Role)을 확인하는 라우트 가드
 * 토큰이 없으면 /login, 권한 부족이면 /dashboard로 리다이렉트
 * 권한 계층: VIEWER < RESEARCHER < MANAGER < ADMIN
 *
 * @since 2026-05-14
 */
import { Navigate } from 'react-router-dom';

const ROLE_ORDER = ['VIEWER', 'RESEARCHER', 'MANAGER', 'ADMIN'];

/**
 * @param {string} role - 접근에 필요한 최소 권한 (예: "ADMIN")
 */
function RoleRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (ROLE_ORDER.indexOf(userRole) < ROLE_ORDER.indexOf(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleRoute;
