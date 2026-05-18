/**
 * axios 인스턴스 및 공통 인터셉터 설정
 * - request: 모든 요청에 JWT 토큰 자동 주입
 * - response: 401 응답 시 localStorage 초기화 후 /login 리다이렉트
 *
 * @since 2026-05-14
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/** 요청 인터셉터 — Authorization 헤더에 Bearer 토큰 자동 추가 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 응답 인터셉터
 * 401: 토큰 만료 또는 인증 실패 → 저장 정보 클리어 후 로그인 페이지로 강제 이동
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===================== 인증 API =====================

/** 로그인 — 성공 시 { token, userId, username, role } 반환 */
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

/**
 * 회원가입
 * phone은 선택값 (빈 문자열로 전달 가능)
 */
export const register = (username, email, password, phone = '') =>
  api.post('/auth/register', { username, email, password, phone });

// ===================== 대시보드 API =====================

/** 대시보드 요약 — 역할별 과제 현황·연구비·알림 반환 */
export const getDashboard = () => api.get('/dashboard');

// ===================== 과제 API =====================

/**
 * 과제 목록 조회
 * @param {Object} params - { keyword, status, page, size, userId, managerId, ... }
 * 응답: PageResponse { items, totalCount, page, size, totalPages }
 */
export const getProjects = (params) => api.get('/projects', { params });

/** 과제 상세 조회 */
export const getProject = (id) => api.get(`/projects/${id}`);

/** 과제 등록 (RESEARCHER 이상) */
export const createProject = (data) => api.post('/projects', data);

/** 과제 수정 (RESEARCHER 이상, 본인 과제) */
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);

/** 과제 상태 변경 (MANAGER 이상) — body: { status, comment } */
export const changeProjectStatus = (id, status, comment) =>
  api.patch(`/projects/${id}/status`, { status, comment });

/** 과제 삭제 (ADMIN만) */
export const deleteProject = (id) => api.delete(`/projects/${id}`);

/** 과제 상태 변경 이력 조회 */
export const getProjectHistory = (id) => api.get(`/projects/${id}/history`);

// ===================== 연구비 API =====================

/** 연구비 목록 조회 */
export const getBudgets = (projectId) => api.get(`/projects/${projectId}/budget`);

/** 연구비 등록 (RESEARCHER 이상) */
export const createBudget = (projectId, data) => api.post(`/projects/${projectId}/budget`, data);

/** 연구비 수정 (RESEARCHER 이상) */
export const updateBudget = (projectId, budgetId, data) =>
  api.put(`/projects/${projectId}/budget/${budgetId}`, data);

/** 연구비 삭제 (ADMIN만) */
export const deleteBudget = (projectId, budgetId) =>
  api.delete(`/projects/${projectId}/budget/${budgetId}`);

/** 연구비 카테고리별 집계 — { PERSONNEL, TRAVEL, RESEARCH_ACTIVITY, ETC, total } */
export const getBudgetSummary = (projectId) => api.get(`/projects/${projectId}/budget/summary`);

// ===================== 파일 API =====================

/** 첨부파일 목록 조회 */
export const getFiles = (projectId) => api.get(`/projects/${projectId}/files`);

/** 파일 업로드 (RESEARCHER 이상) — FormData 전달 */
export const uploadFile = (projectId, formData) =>
  api.post(`/projects/${projectId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** 파일 삭제 (RESEARCHER 본인 또는 ADMIN) */
export const deleteFile = (projectId, fileId) =>
  api.delete(`/projects/${projectId}/files/${fileId}`);

export default api;
