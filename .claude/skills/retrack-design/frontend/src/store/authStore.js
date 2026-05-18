/**
 * Zustand 인증 전역 상태 스토어
 * token, userId, userRole을 localStorage와 동기화하여 관리
 *
 * @since 2026-05-14
 */
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  userId: localStorage.getItem('userId') || null,
  userRole: localStorage.getItem('userRole') || null,

  /** 로그인 성공 시 토큰·사용자 정보 저장 */
  setAuth: (token, userId, userRole) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', String(userId));
    localStorage.setItem('userRole', userRole);
    set({ token, userId: String(userId), userRole });
  },

  /** 로그아웃 — localStorage 및 스토어 초기화 */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    set({ token: null, userId: null, userRole: null });
  },
}));

export default useAuthStore;
