/**
 * 공통 헤더
 * 좌측: 모바일 햄버거 버튼(조건부) + 로고 마크 + 앱명
 * 우측: 사용자명(데스크탑) + 역할 태그 + 로그아웃 버튼
 *
 * @since 2026-05-14
 * @modified 2026-05-18 로고 마크 추가, 사용자명 표시, 모바일 패딩 조정
 * @modified 2026-07-24 UI 일관성 1단계: ROLE_COLOR를 constants/role로 이동, 색상 토큰 적용
 */
import { Layout, Button, Space, Typography, Tag } from 'antd';
import { MenuOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';  // 페이지 이동 함수 제공 (response.sendRedirect 역할)
import useAuthStore from '../store/authStore';    // 전역 로그인 상태 (HttpSession 역할)
import { ROLE_COLOR } from '../constants/role';
import { COLORS, SPACING } from '../theme';

// Ant Design Layout.Header를 AntHeader로 별칭 지정
// (이 파일의 함수명 Header와 충돌 방지)
const { Header: AntHeader } = Layout;
const { Text } = Typography;

/**
 * @param {function} onMenuClick - 햄버거 버튼 클릭 시 MainLayout의 setDrawerOpen(true) 호출
 * @param {boolean} isMobile - true면 햄버거 버튼 표시 / 모바일 레이아웃 적용
 */
function Header({ onMenuClick, isMobile }) {
  // useNavigate: 페이지 이동 함수를 반환하는 훅
  // navigate('/login') → response.sendRedirect("/login")과 동일
  const navigate = useNavigate();

  // authStore에서 현재 로그인한 사용자 정보와 로그아웃 함수를 꺼냄
  // Java로 치면: session.getAttribute("userRole"), session.invalidate()
  const { userName, userRole, logout } = useAuthStore();

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
        padding: isMobile ? `0 ${SPACING.sm}px` : `0 ${SPACING.lg}px`,
        background: COLORS.bgContainer,
        borderBottom: `1px solid ${COLORS.borderSecondary}`,
        flexShrink: 0,
      }}
    >
      {/* 좌측: 햄버거(모바일) + 로고 마크 + 앱명 */}
      <Space size={isMobile ? 6 : 12} style={{ minWidth: 0 }}>
        {/* 모바일일 때만 햄버거 버튼 렌더링 — JSP의 <c:if> 역할 */}
        {isMobile && (
          <Button type="text" icon={<MenuOutlined />} onClick={onMenuClick} />
        )}
        <img
          src="/logo-mark.svg"
          width={isMobile ? 24 : 26}
          height={isMobile ? 24 : 26}
          alt="Retrack"
          style={{ display: 'block', flexShrink: 0 }}
        />
        <Text strong style={{ fontSize: isMobile ? 16 : 18 }}>Retrack</Text>
      </Space>

      {/* 우측: 사용자명(데스크탑) + 역할 태그 + 로그아웃 */}
      <Space size={isMobile ? 6 : 12}>
        {/* 데스크탑에서만 사용자명 표시 */}
        {!isMobile && userName && (
          <Text type="secondary" style={{ fontSize: 14 }}>{userName}</Text>
        )}
        {/* 역할 태그: ROLE_COLOR에 없는 값이면 'default'(회색) 적용 */}
        <Tag color={ROLE_COLOR[userRole] ?? 'default'}>{userRole}</Tag>
        {isMobile
          ? <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} />
          : <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>로그아웃</Button>
        }
      </Space>
    </AntHeader>
  );
}

export default Header;
