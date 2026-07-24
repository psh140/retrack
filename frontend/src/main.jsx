/**
 * 애플리케이션 진입점
 * index.html의 #root 엘리먼트에 React 앱을 마운트
 *
 * ConfigProvider로 전역 디자인 토큰(theme.js)과 한국어 로케일을 적용한다.
 * JSP로 치면 모든 페이지가 include하는 공통 CSS + 메시지 프로퍼티 설정에 해당한다.
 *
 * @since 2026-05-14
 * @modified 2026-07-24 UI 일관성 1단계: ConfigProvider(전역 테마 + ko_KR 로케일) 적용
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';   // 페이지네이션·DatePicker·Empty 등의 기본 문구 한국어화
import dayjs from 'dayjs';
import 'dayjs/locale/ko';               // DatePicker의 요일·월 표기 한국어화
import App from './App';
import theme from './theme';

dayjs.locale('ko');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme} locale={koKR}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
