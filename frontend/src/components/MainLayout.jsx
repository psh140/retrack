/**
 * 인증 페이지 공통 레이아웃
 * 데스크탑(md 이상): Sider 고정 + Header + Content
 * 모바일(md 미만): Header + Content, 햄버거 버튼으로 Drawer 열기
 *
 * [사용 방법] App.jsx에서 로그인이 필요한 페이지를 이 컴포넌트로 감싼다.
 *   <MainLayout><DashboardPage /></MainLayout>
 * JSP로 치면 <%@ include file="header.jsp" %> + <%@ include file="sidebar.jsp" %>를
 * 매 페이지마다 넣는 대신, 한 번에 처리하는 공통 레이아웃 역할이다.
 *
 * @since 2026-05-14
 * @modified 2026-07-24 UI 일관성 2단계: 본문 패딩·배경·최대폭을 이 컴포넌트에서 단일 관리
 */
import { useState } from 'react';       // React 상태 관리 훅 (Java의 인스턴스 변수 역할)
import { Layout, Drawer, Grid } from 'antd';
import Header from './Header';
import Sidebar from './Sidebar';
import { COLORS, LAYOUT } from '../theme';

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;        // 현재 화면 크기를 감지하는 Ant Design 훅

/**
 * @param {React.ReactNode} children - 이 레이아웃 안에 들어올 페이지 컴포넌트
 *   JSP의 <body> 안에 실제 콘텐츠가 들어오는 것과 같은 개념
 */
function MainLayout({ children }) {
  // useBreakpoint: 현재 브라우저 창 크기를 객체로 반환
  // screens.md가 true면 화면 너비 768px 이상(데스크탑), false면 모바일
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // drawerOpen: 모바일에서 사이드바 Drawer가 열려있는지 여부
  // useState(false): 초기값 false (닫힌 상태)
  // setDrawerOpen: drawerOpen 값을 바꾸는 함수 → 값이 바뀌면 화면이 자동으로 다시 그려짐
  // Java로 치면: private boolean drawerOpen = false; + setter
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    // style={{ minHeight: '100vh' }}: 페이지 높이를 브라우저 전체 높이로 설정
    <Layout style={{ minHeight: '100vh' }}>

      {/* 데스크탑에서만 고정 사이드바 표시 */}
      {/* JSX에서 조건부 렌더링: {조건 && <컴포넌트/>} → 조건이 true일 때만 렌더링 */}
      {!isMobile && (
        <Sider
          width={LAYOUT.siderWidth}
          // 배경색은 theme.js의 Layout.siderBg가 처리 — 여기서는 구분선만 지정
          style={{ borderRight: `1px solid ${COLORS.borderSecondary}` }}
        >
          <Sidebar />
        </Sider>
      )}

      {/* Header + Content 영역 */}
      <Layout>
        {/* onMenuClick: 햄버거 버튼 클릭 시 drawerOpen을 true로 변경 */}
        <Header onMenuClick={() => setDrawerOpen(true)} isMobile={isMobile} />

        {/*
          모든 페이지의 바깥 여백·배경·최소 높이를 이 한 곳에서 관리한다.
          페이지 컴포넌트는 자체적으로 padding/background/minHeight를 지정하지 않는다.
          (JSP로 치면 공통 레이아웃의 <div class="container">를 매 페이지가 다시 선언하지 않는 것과 같다)
        */}
        <Content
          style={{
            padding: isMobile ? LAYOUT.contentPaddingMobile : LAYOUT.contentPadding,
            minHeight: `calc(100vh - ${LAYOUT.headerHeight}px)`,
          }}
        >
          {/* 본문 최대폭 제한 — 대형 모니터에서 표가 화면 끝까지 늘어나지 않도록 가운데 정렬 */}
          <div style={{ maxWidth: LAYOUT.contentMaxWidth, margin: '0 auto' }}>
            {children}
          </div>
        </Content>
      </Layout>

      {/* 모바일에서만 Drawer 사이드바 표시 */}
      {/* Drawer: 화면 옆에서 슬라이드로 나타나는 패널 */}
      {isMobile && (
        <Drawer
          placement="left"                          // 왼쪽에서 슬라이드
          open={drawerOpen}                         // drawerOpen 값에 따라 열고 닫힘
          onClose={() => setDrawerOpen(false)}      // 외부 클릭 시 닫기
          width={LAYOUT.siderWidth}
          title="Retrack"
          styles={{ body: { padding: 0 } }}
        >
          {/* onClose: 메뉴 항목 클릭 시 Drawer도 함께 닫힘 */}
          <Sidebar onClose={() => setDrawerOpen(false)} />
        </Drawer>
      )}
    </Layout>
  );
}

export default MainLayout;
