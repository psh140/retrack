/**
 * 애플리케이션 라우팅 설정
 * 페이지 구현 완료 시 해당 import와 Route 주석을 해제하여 등록
 *
 * @since 2026-05-14
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// 페이지 구현 시 주석 해제
// import PrivateRoute from './components/PrivateRoute';
// import RoleRoute from './components/RoleRoute';

// 페이지 컴포넌트 (단계별 구현 예정)
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import DashboardPage from './pages/DashboardPage';
// import ProjectListPage from './pages/ProjectListPage';
// import ProjectDetailPage from './pages/ProjectDetailPage';
// import ProjectFormPage from './pages/ProjectFormPage';
// import NotificationPage from './pages/NotificationPage';
// import UserManagePage from './pages/UserManagePage';
// import StatsPage from './pages/StatsPage';
// import ActivityLogPage from './pages/ActivityLogPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 공개 */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/register" element={<RegisterPage />} /> */}

        {/* 로그인 필요 */}
        {/* <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} /> */}
        {/* <Route path="/projects" element={<PrivateRoute><ProjectListPage /></PrivateRoute>} /> */}
        {/* <Route path="/projects/new" element={<PrivateRoute><ProjectFormPage /></PrivateRoute>} /> */}
        {/* <Route path="/projects/:id" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} /> */}
        {/* <Route path="/projects/:id/edit" element={<PrivateRoute><ProjectFormPage /></PrivateRoute>} /> */}
        {/* <Route path="/notifications" element={<PrivateRoute><NotificationPage /></PrivateRoute>} /> */}

        {/* ADMIN 전용 */}
        {/* <Route path="/admin/users" element={<RoleRoute role="ADMIN"><UserManagePage /></RoleRoute>} /> */}
        {/* <Route path="/admin/stats" element={<RoleRoute role="ADMIN"><StatsPage /></RoleRoute>} /> */}
        {/* <Route path="/admin/logs" element={<RoleRoute role="ADMIN"><ActivityLogPage /></RoleRoute>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
