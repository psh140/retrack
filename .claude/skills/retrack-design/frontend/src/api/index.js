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

export default api;
