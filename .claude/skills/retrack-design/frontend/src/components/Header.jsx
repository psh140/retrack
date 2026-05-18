/**
 * 공통 헤더
 * 좌측: 모바일 햄버거 버튼(조건부) + 앱명
 * 우측: 사용자 역할 태그 + 로그아웃 버튼
 *
 * @since 2026-05-14
 */
import { Layout, Button, Space, Typography, Tag } from 'antd';
import { MenuOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';  // 페이지 이동 함수 제공 (response.sendRedirect 역할)
import useAuthStore from '../store/authStore';    // 전역 로그인 상태 (HttpSession 역할)

// Ant Design Layout.Header를 AntHeader로 별칭 지정
// (이 파일의 함수명 Header와 충돌 방지)
const { Header: AntHeader } = Layout;
const { Text } = Typography;

// 역할별 태그 색상 매핑
const ROLE_COLOR = {
  ADMIN: 'red',
  MANAGER: 'orange',
  RESEARCHER: 'blue',
  VIEWER: 'default',
};

/**
 * @param {function} onMenuClick - 햄버거 버튼 클릭 시 MainLayout의 setDrawerOpen(true) 호출
 * @param {boolean} isMobile - true면 햄버거 버튼 표시, false면 숨김
 *
 * props: 부모 컴포넌트(MainLayout)가 자식(Header)에게 전달하는 값
 * Java 메서드의 매개변수와 같은 개념
 */
function Header({ onMenuClick, isMobile }) {
  // useNavigate: 페이지 이동 함수를 반환하는 훅
  // navigate('/login') → response.sendRedirect("/login")과 동일
  const navigate = useNavigate();

  // authStore에서 현재 로그인한 사용자의 역할과 로그아웃 함수를 꺼냄
  // Java로 치면: session.getAttribute("userRole"), session.invalidate()
  const { userRole, logout } = useAuthStore();

  const handleLogout = () => {
    logout();              // localStorage 초기화 + 스토어 초기화
    navigate('/login');    // 로그인 페이지로 이동
  };

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',  // 좌우 끝으로 배치
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      {/* 좌측 영역 */}
      <Space>
        {/* 모바일일 때만 햄버거 버튼 렌더링 */}
        {isMobile && (
          <Button type="text" icon={<MenuOutlined />} onClick={onMenuClick} />
        )}
        <Text strong style={{ fontSize: 18 }}>Retrack</Text>
      </Space>

      {/* 우측 영역 */}
      <Space>
        {/* 역할 태그: ROLE_COLOR에 없는 값이면 'default'(회색) 적용 */}
        <Tag color={ROLE_COLOR[userRole] ?? 'default'}>{userRole}</Tag>
        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
          로그아웃
        </Button>
      </Space>
    </AntHeader>
  );
}

export default Header;
