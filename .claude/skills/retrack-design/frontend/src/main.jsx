/**
 * 애플리케이션 진입점
 * index.html의 #root 엘리먼트에 React 앱을 마운트
 *
 * @since 2026-05-14
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
