---
name: react-page
description: >
  Retrack React 페이지 컴포넌트 구현 패턴 스킬. ui-builder 에이전트가 사용.
  함수형 컴포넌트, useState/useEffect 훅, 로딩/에러 상태, 권한 분기 UI 패턴을 제공한다.
---

# React 페이지 컴포넌트 구현 패턴

## 1. 기본 페이지 구조

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../api';

/**
 * 연구과제 목록 페이지
 */
function ProjectListPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        getProjects()
            .then(data => setProjects(data))
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">오류: {error}</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>연구과제 목록</h1>
                {['RESEARCHER', 'MANAGER', 'ADMIN'].includes(userRole) && (
                    <button onClick={() => navigate('/projects/new')}>과제 등록</button>
                )}
            </div>
            <div className="project-list">
                {projects.length === 0 ? (
                    <p>등록된 과제가 없습니다.</p>
                ) : (
                    projects.map(p => (
                        <div key={p.projectId}
                             className="project-card"
                             onClick={() => navigate(`/projects/${p.projectId}`)}>
                            <h3>{p.title}</h3>
                            <span className={`status status-${p.status}`}>{p.status}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ProjectListPage;
```

## 2. 폼 페이지 패턴

```jsx
function ProjectFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        title: '', description: '', startDate: '', endDate: '', budgetTotal: ''
    });
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 수정 모드: 기존 데이터 로드
    useEffect(() => {
        if (!isEdit) return;
        getProject(id)
            .then(data => setForm(data))
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            if (isEdit) {
                await updateProject(id, form);
            } else {
                await createProject(form);
            }
            navigate('/projects');
        } catch (err) {
            setError(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>로딩 중...</div>;

    return (
        <form onSubmit={handleSubmit}>
            <h1>{isEdit ? '과제 수정' : '과제 등록'}</h1>
            {error && <div className="error">{error}</div>}
            <input name="title" value={form.title} onChange={handleChange} placeholder="과제명" required />
            <textarea name="description" value={form.description} onChange={handleChange} />
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            <input type="number" name="budgetTotal" value={form.budgetTotal} onChange={handleChange} />
            <button type="submit" disabled={submitting}>
                {submitting ? '처리 중...' : isEdit ? '수정' : '등록'}
            </button>
        </form>
    );
}
```

## 3. 공통 컴포넌트

### PrivateRoute (로그인 필요)
```jsx
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}
export default PrivateRoute;
```

### RoleRoute (권한 필요)
```jsx
function RoleRoute({ children, role }) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const roleOrder = ['VIEWER', 'RESEARCHER', 'MANAGER', 'ADMIN'];
    const hasPermission = token && roleOrder.indexOf(userRole) >= roleOrder.indexOf(role);
    return hasPermission ? children : <Navigate to="/" />;
}
export default RoleRoute;
```

### Header
```jsx
function Header() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName');

    const handleLogout = async () => {
        await logout();
        localStorage.clear();
        navigate('/login');
    };

    return (
        <header>
            <h2>Retrack</h2>
            <div>
                <span>{userName}님</span>
                <button onClick={handleLogout}>로그아웃</button>
            </div>
        </header>
    );
}
```

## 4. 과제 상태 표시 스타일

```jsx
// 상태별 색상 클래스
const STATUS_LABELS = {
    DRAFT: '초안',
    SUBMITTED: '제출됨',
    REVIEWING: '검토 중',
    APPROVED: '승인됨',
    IN_PROGRESS: '진행 중',
    COMPLETED: '완료',
    REJECTED: '반려'
};

// 사용 예시
<span className={`status ${project.status.toLowerCase()}`}>
    {STATUS_LABELS[project.status]}
</span>
```

## 5. App.js 라우팅 전체 구조

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 공개 */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* 로그인 필요 */}
                <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/projects" element={<PrivateRoute><ProjectListPage /></PrivateRoute>} />
                <Route path="/projects/new" element={<PrivateRoute><ProjectFormPage /></PrivateRoute>} />
                <Route path="/projects/:id" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
                <Route path="/projects/:id/edit" element={<PrivateRoute><ProjectFormPage /></PrivateRoute>} />
                <Route path="/projects/:id/budget" element={<PrivateRoute><BudgetPage /></PrivateRoute>} />
                <Route path="/projects/:id/files" element={<PrivateRoute><FilePage /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><NotificationPage /></PrivateRoute>} />

                {/* ADMIN 전용 */}
                <Route path="/admin/users" element={<RoleRoute role="ADMIN"><UserManagePage /></RoleRoute>} />
                <Route path="/admin/stats" element={<RoleRoute role="ADMIN"><StatsPage /></RoleRoute>} />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}
```
