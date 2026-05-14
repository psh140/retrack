/**
 * 로그인 여부를 확인하는 라우트 가드
 * 토큰이 없으면 /login으로 리다이렉트
 *
 * @since 2026-05-14
 */
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default PrivateRoute;
