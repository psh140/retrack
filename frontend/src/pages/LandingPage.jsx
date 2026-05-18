/**
 * 메인(랜딩) 페이지
 * 공개 페이지 — 로그인 불필요
 * 구성: Hero(로고·소개·CTA) + 주요 기능 카드 4개
 * 이미 로그인된 경우 CTA를 "대시보드로 이동"으로 전환
 *
 * @since 2026-05-18
 * @modified 2026-05-18 로그인 상태 감지 후 CTA 분기
 */
import { Button, Card, Grid } from 'antd';
import {
  ProjectOutlined,
  DollarOutlined,
  BellOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';  // response.sendRedirect() 역할
import useAuthStore from '../store/authStore';    // session.getAttribute() 역할

const { useBreakpoint } = Grid;

// 주요 기능 소개 카드 데이터
const FEATURES = [
  {
    icon: <ProjectOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    title: '과제 관리',
    desc: '연구과제를 등록하고 상태 변경 이력을 추적합니다. 제출·검토·승인·진행 단계를 한눈에 파악할 수 있습니다.',
  },
  {
    icon: <DollarOutlined style={{ fontSize: 28, color: '#13c2c2' }} />,
    title: '연구비 집계',
    desc: '인건비·여비·연구활동비·기타 카테고리별로 집계하여 예산 집행 현황을 실시간으로 관리합니다.',
  },
  {
    icon: <BellOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
    title: '파일 및 알림',
    desc: '과제별 첨부파일을 업로드하고, 상태 변경 시 담당자에게 이메일 알림을 자동으로 발송합니다.',
  },
  {
    icon: <TeamOutlined style={{ fontSize: 28, color: '#722ed1' }} />,
    title: '권한 관리',
    desc: 'VIEWER · RESEARCHER · MANAGER · ADMIN 4단계 역할 구조로 기능별 접근 권한을 세밀하게 제어합니다.',
  },
];

function LandingPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate  = useNavigate();        // response.sendRedirect() 역할
  const { token } = useAuthStore();       // 로그인 여부 판단 — session.getAttribute("token") 역할
  const isLoggedIn = Boolean(token);

  // 반응형: lg+ 4열, md 2열, 모바일 1열
  const featureCols = screens.lg ? 'repeat(4, 1fr)'
                    : screens.md ? 'repeat(2, 1fr)'
                    :              'repeat(1, 1fr)';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'inherit' }}>

      {/* Hero 영역 */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '64px 24px' : '96px 24px',
        textAlign: 'center',
      }}>
        {/* 로고 */}
        <img
          src="/logo-mark.svg"
          width={isMobile ? 56 : 72}
          height={isMobile ? 56 : 72}
          alt="Retrack"
          style={{ display: 'block', marginBottom: 20 }}
        />

        {/* 앱명 */}
        <div style={{
          fontSize: isMobile ? 28 : 38,
          fontWeight: 700,
          color: 'rgba(0,0,0,0.88)',
          lineHeight: 1.21,
          marginBottom: 12,
          letterSpacing: '-0.5px',
        }}>
          Retrack
        </div>

        {/* 부제 */}
        <div style={{
          fontSize: isMobile ? 16 : 20,
          fontWeight: 500,
          color: 'rgba(0,0,0,0.65)',
          marginBottom: 16,
        }}>
          연구과제 관리 시스템
        </div>

        {/* 소개 문구 */}
        <div style={{
          fontSize: 15,
          color: 'rgba(0,0,0,0.45)',
          maxWidth: 480,
          lineHeight: 1.7,
          marginBottom: 36,
        }}>
          연구과제 등록부터 연구비 집계, 파일 관리, 이메일 알림까지<br />
          연구 행정 업무를 한 곳에서 처리합니다.
        </div>

        {/* CTA 버튼 — 로그인 여부에 따라 분기 (JSP의 <c:choose> 역할) */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {isLoggedIn ? (
            <Button
              type="primary"
              size="large"
              style={{ minWidth: 160 }}
              onClick={() => navigate('/dashboard')}
            >
              대시보드로 이동
            </Button>
          ) : (
            <>
              <Button
                type="primary"
                size="large"
                style={{ minWidth: 120 }}
                onClick={() => navigate('/login')}
              >
                로그인
              </Button>
              <Button
                size="large"
                style={{ minWidth: 120 }}
                onClick={() => navigate('/register')}
              >
                회원가입
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 기능 소개 카드 */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '40px 16px' : '64px 24px' }}>
        <div style={{
          textAlign: 'center',
          fontSize: isMobile ? 20 : 24,
          fontWeight: 600,
          color: 'rgba(0,0,0,0.88)',
          marginBottom: isMobile ? 24 : 40,
        }}>
          주요 기능
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: featureCols, gap: isMobile ? 16 : 20 }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <Card
              key={title}
              style={{ borderRadius: 6, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)' }}
            >
              <div style={{ marginBottom: 16 }}>{icon}</div>
              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'rgba(0,0,0,0.88)',
                marginBottom: 10,
              }}>
                {title}
              </div>
              <div style={{
                fontSize: 14,
                color: 'rgba(0,0,0,0.65)',
                lineHeight: 1.7,
              }}>
                {desc}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 푸터 */}
      <div style={{
        textAlign: 'center',
        padding: '24px 0',
        borderTop: '1px solid #f0f0f0',
        fontSize: 13,
        color: 'rgba(0,0,0,0.45)',
      }}>
        Retrack — 연구과제 관리 시스템
      </div>
    </div>
  );
}

export default LandingPage;
