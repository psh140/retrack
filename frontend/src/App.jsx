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
 * @modified 2026-05-19 7단계: 관리자 페이지 (사용자 관리·통계·활동 로그) 라우트 등록
 * @modified 2026-06-07 code-splitting: 모든 페이지 lazy() 전환 (초기 번들 분리)
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
import RoleRoute from './components/RoleRoute';

// 메인(랜딩) 페이지
const LandingPage = lazy(() => import('./pages/LandingPage'));

// 3단계 — 인증
const LoginPage    = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// 4단계 — 대시보드
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// 5단계 — 과제 관리
const ProjectListPage   = lazy(() => import('./pages/ProjectListPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ProjectFormPage   = lazy(() => import('./pages/ProjectFormPage'));

// 6단계 — 알림
const NotificationPage = lazy(() => import('./pages/NotificationPage'));

// 7단계 — 관리자
const UserManagePage  = lazy(() => import('./pages/UserManagePage'));
const StatsPage       = lazy(() => import('./pages/StatsPage'));
const ActivityLogPage = lazy(() => import('./pages/ActivityLogPage'));

/** 페이지 로딩 중 전체 화면 스피너 — JSP forward 대기 화면과 동일한 역할 */
const PageLoader = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={PageLoader}>
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

        {/* ADMIN 전용 — 7단계 */}
        <Route path="/admin/users" element={<RoleRoute role="ADMIN"><MainLayout><UserManagePage /></MainLayout></RoleRoute>} />
        <Route path="/admin/stats" element={<RoleRoute role="ADMIN"><MainLayout><StatsPage /></MainLayout></RoleRoute>} />
        <Route path="/admin/logs"  element={<RoleRoute role="ADMIN"><MainLayout><ActivityLogPage /></MainLayout></RoleRoute>} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
