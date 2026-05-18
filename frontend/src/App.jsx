/**
 * 애플리케이션 라우팅 설정
 * 페이지 구현 완료 시 해당 import와 Route 주석을 해제하여 등록
 *
 * @since 2026-05-14
 * @modified 2026-05-14 3단계: 로그인·회원가입 라우트 등록
 * @modified 2026-05-18 4단계: 대시보드 플레이스홀더 라우트 등록
 * @modified 2026-05-18 메인(랜딩) 페이지 추가, "/" 진입점 변경
 * @modified 2026-05-18 5단계: 과제 목록·상세·등록/수정 라우트 등록
 * @modified 2026-05-18 6단계: 알림 라우트 등록
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
// import RoleRoute from './components/RoleRoute';

// 메인(랜딩) 페이지
import LandingPage from './pages/LandingPage';

// 3단계 — 인증
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// 4단계 — 대시보드
import DashboardPage from './pages/DashboardPage';

// 5단계 — 과제 관리
import ProjectListPage from './pages/ProjectListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectFormPage from './pages/ProjectFormPage';

// 6단계 — 알림
import NotificationPage from './pages/NotificationPage';

// 이후 단계 구현 예정
// import UserManagePage from './pages/UserManagePage';
// import StatsPage from './pages/StatsPage';
// import ActivityLogPage from './pages/ActivityLogPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 — MainLayout 없이 단독 표시 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 로그인 필요 */}
        <Route path="/dashboard"         element={<PrivateRoute><MainLayout><DashboardPage /></MainLayout></PrivateRoute>} />
        <Route path="/projects"          element={<PrivateRoute><MainLayout><ProjectListPage /></MainLayout></PrivateRoute>} />
        <Route path="/projects/new"      element={<PrivateRoute><MainLayout><ProjectFormPage /></MainLayout></PrivateRoute>} />
        <Route path="/projects/:id"      element={<PrivateRoute><MainLayout><ProjectDetailPage /></MainLayout></PrivateRoute>} />
        <Route path="/projects/:id/edit" element={<PrivateRoute><MainLayout><ProjectFormPage /></MainLayout></PrivateRoute>} />
        <Route path="/notifications"     element={<PrivateRoute><MainLayout><NotificationPage /></MainLayout></PrivateRoute>} />

        {/* ADMIN 전용 (7단계 이후 주석 해제) */}
        {/* <Route path="/admin/users" element={<RoleRoute role="ADMIN"><UserManagePage /></RoleRoute>} /> */}
        {/* <Route path="/admin/stats" element={<RoleRoute role="ADMIN"><StatsPage /></RoleRoute>} /> */}
        {/* <Route path="/admin/logs" element={<RoleRoute role="ADMIN"><ActivityLogPage /></RoleRoute>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
