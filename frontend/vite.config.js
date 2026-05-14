/**
 * Vite 설정
 * proxy: 개발 서버(5173)의 /api 요청을 백엔드(8080)로 전달하여 CORS 우회
 *
 * @since 2026-05-14
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 백엔드 CORS가 localhost:3000만 허용하므로 Origin 헤더를 덮어써서 통과
        headers: { Origin: 'http://localhost:3000' },
      },
    },
  },
});
