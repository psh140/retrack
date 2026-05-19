/**
 * axios 인스턴스 및 공통 인터셉터 설정
 * - request: 모든 요청에 JWT 토큰 자동 주입
 * - response: 401 응답 시 localStorage 초기화 후 /login 리다이렉트
 *
 * @since 2026-05-14
 * @modified 2026-05-19 7단계: 사용자 관리·통계·활동 로그 API 함수 추가
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

// ===================== 알림 API =====================

/** 내 알림 목록 조회 — 성공 시 data: NotificationVO[] */
export const getNotifications = () => api.get('/notifications');

/**
 * 알림 발송 (MANAGER 이상)
 * @param {{ userId: number, projectId: number|null, message: string }} data
 * 성공 시 data: notificationId (Long)
 */
export const sendNotification = (data) => api.post('/notifications/send', data);

// ===================== 사용자 관리 API =====================

/**
 * 사용자 목록 조회 (ADMIN 전용)
 * @param {Object} params - { keyword, role, isVerified, page, size }
 * @returns {Promise} res.data.data = PageResponse { items: UserVO[], totalCount, page, size, totalPages }
 */
export const getUsers = (params) => api.get('/users', { params });

/**
 * 사용자 역할 변경 (ADMIN 전용)
 * @param {number} id - 대상 사용자 ID
 * @param {string} role - 변경할 역할 (VIEWER / RESEARCHER / MANAGER / ADMIN)
 * @returns {Promise} res.data.data = null (메시지만 반환)
 */
export const updateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role });

/**
 * 사용자 연구자 인증 처리 (ADMIN 전용)
 * @param {number} id - 대상 사용자 ID
 * @returns {Promise} res.data.data = null (메시지만 반환)
 */
export const verifyUser = (id) => api.patch(`/users/${id}/verify`);

/**
 * 사용자 삭제 (ADMIN 전용)
 * @param {number} id - 삭제할 사용자 ID
 * @returns {Promise} res.data.data = null (메시지만 반환)
 */
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ===================== 통계 API =====================

/**
 * 과제 상태별 건수 조회 (ADMIN 전용)
 * @returns {Promise} res.data.data = Map { "DRAFT": N, "SUBMITTED": N, ... }
 */
export const getProjectStatusStats = () => api.get('/stats/projects/status');

/**
 * 연구비 카테고리별 집계 조회 (ADMIN 전용)
 * @returns {Promise} res.data.data = Map { "PERSONNEL": N, "TRAVEL": N, "RESEARCH_ACTIVITY": N, "ETC": N, "total": N }
 */
export const getBudgetCategoryStats = () => api.get('/stats/budget/category');

/**
 * 과제별 연구비 소진율 목록 조회 (ADMIN 전용)
 * @returns {Promise} res.data.data = List [{ projectId, title, budgetTotal, budgetUsed, burnRate }]
 */
export const getBudgetBurnRate = () => api.get('/stats/budget/burnrate');

/**
 * 월별 알림 발송 건수 조회 (ADMIN 전용)
 * @returns {Promise} res.data.data = List [{ month: "2026-04", count: 12 }]
 */
export const getMonthlyNotificationStats = () => api.get('/stats/notifications/monthly');

// ===================== 활동 로그 API =====================

/**
 * 전체 활동 로그 목록 조회 (ADMIN 전용)
 * @returns {Promise} res.data.data = List<ActivityLogVO> [{ logId, userId, action, targetType, targetId, description, ipAddress, createdAt }]
 */
export const getActivityLogs = () => api.get('/logs');

/**
 * 특정 사용자의 활동 로그 목록 조회 (ADMIN 전용)
 * @param {number} id - 조회할 사용자 ID
 * @returns {Promise} res.data.data = List<ActivityLogVO>
 */
export const getUserActivityLogs = (id) => api.get(`/logs/users/${id}`);

export default api;
