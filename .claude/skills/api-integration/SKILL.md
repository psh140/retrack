---
name: api-integration
description: >
  Retrack 프론트엔드의 axios API 연동 스킬. api-connector 에이전트가 사용.
  axios 인스턴스 설정, JWT 인터셉터, 백엔드 REST API 호출 함수를 frontend/src/api/index.js에 구현한다.
---

# Retrack API 연동 가이드

## 핵심 설계 원칙

1. **인터셉터로 중앙 처리**: 토큰 첨부와 401 처리를 인터셉터에서 한 번만 구현
2. **data 추출**: 백엔드가 `{ success, message, data }` 형태로 반환하므로 응답 인터셉터에서 `.data` 추출
3. **에러 전파**: catch하지 않고 throw — 컴포넌트에서 처리
4. **파일 업로드**: `multipart/form-data` 헤더 별도 지정

## 완성된 api/index.js 전체 구조

```js
import axios from 'axios';

// axios 인스턴스
const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' }
});

// 요청 인터셉터: JWT 자동 첨부
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, error => Promise.reject(error));

// 응답 인터셉터: data 추출 + 401 처리
api.interceptors.response.use(
    response => response.data.data,
    error => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        const message = error.response?.data?.message || '서버 오류가 발생했습니다';
        return Promise.reject(message);
    }
);

// ===== 인증 =====
export const login = (email, password) =>
    api.post('/api/auth/login', { email, password });
export const register = (data) => api.post('/api/auth/register', data);
export const logout = () => api.post('/api/auth/logout');

// ===== 과제 =====
export const getProjects = () => api.get('/api/projects');
export const getProject = (id) => api.get(`/api/projects/${id}`);
export const createProject = (data) => api.post('/api/projects', data);
export const updateProject = (id, data) => api.put(`/api/projects/${id}`, data);
export const changeProjectStatus = (id, data) =>
    api.patch(`/api/projects/${id}/status`, data);
export const deleteProject = (id) => api.delete(`/api/projects/${id}`);
export const getProjectHistory = (id) => api.get(`/api/projects/${id}/history`);

// ===== 연구비 =====
export const getBudgets = (projectId) =>
    api.get(`/api/projects/${projectId}/budget`);
export const createBudget = (projectId, data) =>
    api.post(`/api/projects/${projectId}/budget`, data);
export const updateBudget = (projectId, budgetId, data) =>
    api.put(`/api/projects/${projectId}/budget/${budgetId}`, data);
export const deleteBudget = (projectId, budgetId) =>
    api.delete(`/api/projects/${projectId}/budget/${budgetId}`);
export const getBudgetSummary = (projectId) =>
    api.get(`/api/projects/${projectId}/budget/summary`);

// ===== 파일 =====
export const getFiles = (projectId) =>
    api.get(`/api/projects/${projectId}/files`);
export const uploadFile = (projectId, formData) =>
    api.post(`/api/projects/${projectId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
export const deleteFile = (projectId, fileId) =>
    api.delete(`/api/projects/${projectId}/files/${fileId}`);
export const downloadFile = (projectId, fileId) =>
    api.get(`/api/projects/${projectId}/files/${fileId}`, { responseType: 'blob' });

// ===== 알림 =====
export const getNotifications = () => api.get('/api/notifications');
export const sendNotification = (data) => api.post('/api/notifications/send', data);
export const getNotification = (id) => api.get(`/api/notifications/${id}`);

// ===== 사용자 (ADMIN) =====
export const getUsers = () => api.get('/api/users');
export const getUser = (id) => api.get(`/api/users/${id}`);
export const updateUserRole = (id, role) =>
    api.patch(`/api/users/${id}/role`, { role });
export const verifyUser = (id) => api.patch(`/api/users/${id}/verify`);
export const deleteUser = (id) => api.delete(`/api/users/${id}`);

// ===== 통계 (ADMIN) =====
export const getProjectStats = () => api.get('/api/stats/projects/status');
export const getBudgetCategoryStats = () => api.get('/api/stats/budget/category');
export const getBurnRate = () => api.get('/api/stats/budget/burnrate');
export const getMonthlyNotifications = () =>
    api.get('/api/stats/notifications/monthly');

// ===== 대시보드 =====
export const getDashboard = () => api.get('/api/dashboard');

export default api;
```

## 로그인 후 localStorage 저장 패턴

```js
// LoginPage.js에서 로그인 성공 후
const data = await login(email, password);
localStorage.setItem('token', data.token);
localStorage.setItem('userId', data.userId);
localStorage.setItem('userRole', data.role);
localStorage.setItem('userName', data.name);
navigate('/');
```

## 파일 다운로드 패턴 (컴포넌트에서)

```js
const handleDownload = async (fileId, originalName) => {
    const blob = await downloadFile(projectId, fileId);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
```

## 파일 업로드 패턴 (컴포넌트에서)

```js
const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await uploadFile(projectId, formData);
    // 목록 갱신
    const updated = await getFiles(projectId);
    setFiles(updated);
};
```
