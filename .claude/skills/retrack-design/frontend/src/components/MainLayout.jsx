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
 */
import { useState } from 'react';       // React 상태 관리 훅 (Java의 인스턴스 변수 역할)
import { Layout, Drawer, Grid } from 'antd';
import Header from './Header';
import Sidebar from './Sidebar';

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;        // 현재 화면 크기를 감지하는 Ant Design 훅

const SIDER_WIDTH = 220;               // 사이드바 너비 (px)

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
          width={SIDER_WIDTH}
          style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
        >
          <Sidebar />
        </Sider>
      )}

      {/* Header + Content 영역 */}
      <Layout>
        {/* onMenuClick: 햄버거 버튼 클릭 시 drawerOpen을 true로 변경 */}
        <Header onMenuClick={() => setDrawerOpen(true)} isMobile={isMobile} />

        {/* 실제 페이지 컴포넌트가 여기에 삽입됨 */}
        <Content style={{ padding: 24, background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>

      {/* 모바일에서만 Drawer 사이드바 표시 */}
      {/* Drawer: 화면 옆에서 슬라이드로 나타나는 패널 */}
      {isMobile && (
        <Drawer
          placement="left"                          // 왼쪽에서 슬라이드
          open={drawerOpen}                         // drawerOpen 값에 따라 열고 닫힘
          onClose={() => setDrawerOpen(false)}      // 외부 클릭 시 닫기
          width={SIDER_WIDTH}
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
