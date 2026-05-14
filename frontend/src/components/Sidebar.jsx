/**
 * 사이드바 내비게이션 메뉴
 * ADMIN 역할일 때만 관리자 메뉴 그룹 노출
 * 현재 URL 기준으로 활성 메뉴 자동 표시
 *
 * @since 2026-05-14
 */
import { Menu } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  BellOutlined,
  UserOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
// useNavigate: 페이지 이동 (sendRedirect 역할)
// useLocation: 현재 URL 경로 확인 (request.getRequestURI() 역할)

// 모든 사용자에게 보이는 기본 메뉴 항목
// key: 클릭 시 이동할 URL 경로 (selectedKeys 비교에도 사용)
const BASE_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '대시보드' },
  { key: '/projects', icon: <ProjectOutlined />, label: '과제 목록' },
  { key: '/notifications', icon: <BellOutlined />, label: '알림' },
];

// ADMIN 전용 메뉴 그룹
const ADMIN_ITEMS = {
  key: 'admin',
  type: 'group',   // 클릭 불가한 그룹 헤더로 표시
  label: '관리자',
  children: [
    { key: '/admin/users', icon: <UserOutlined />, label: '사용자 관리' },
    { key: '/admin/stats', icon: <BarChartOutlined />, label: '통계' },
    { key: '/admin/logs', icon: <FileTextOutlined />, label: '활동 로그' },
  ],
};

/**
 * @param {function} onClose - 모바일 Drawer에서 메뉴 선택 후 Drawer 닫기 콜백
 *   데스크탑에서는 전달되지 않으므로 undefined 체크 후 호출
 */
function Sidebar({ onClose }) {
  const navigate = useNavigate();

  // useLocation: 현재 브라우저 URL 경로를 반환
  // 예: '/dashboard' → selectedKeys에 전달 → 해당 메뉴 항목 활성화(파란색 표시)
  const location = useLocation();

  const userRole = localStorage.getItem('userRole');

  // ADMIN이면 기본 메뉴 + 관리자 그룹, 아니면 기본 메뉴만
  // 스프레드 연산자(...): Java의 addAll()처럼 배열을 펼쳐서 합침
  const items = userRole === 'ADMIN' ? [...BASE_ITEMS, ADMIN_ITEMS] : BASE_ITEMS;

  // 메뉴 항목 클릭 시 호출
  // key: 클릭된 메뉴의 key값(URL 경로)
  const handleClick = ({ key }) => {
    navigate(key);          // 해당 URL로 페이지 이동
    if (onClose) onClose(); // 모바일 Drawer일 경우 닫기
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}  // 현재 URL과 일치하는 메뉴 항목 활성화
      items={items}
      onClick={handleClick}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
}

export default Sidebar;
