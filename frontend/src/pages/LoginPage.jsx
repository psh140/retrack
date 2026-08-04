/**
 * 로그인 페이지
 * 공개 페이지 — MainLayout(사이드바/헤더) 없이 단독 표시
 * 로그인 성공 시 authStore에 토큰·사용자 정보 저장 후 /dashboard 이동
 *
 * @since 2026-05-14
 * @modified 2026-05-18 로고 마크 추가, authStore에 userName 저장
 * @modified 2026-08-03 데모 계정 안내 배너 추가 (랜딩을 건너뛰고 진입한 방문자용)
 * @modified 2026-08-04 메인(랜딩) 복귀 경로 추가 — 로고 블록 링크화 + 하단 「메인으로」 버튼
 */
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/index';          // POST /api/auth/login
import useAuthStore from '../store/authStore'; // 전역 로그인 상태 (HttpSession 역할)
import { DEMO_ACCOUNT } from '../constants/demo'; // 공개용 데모 계정
import { COLORS } from '../theme';             // 색상 토큰 — hex 직접 입력 금지

const { Text } = Typography;

function LoginPage() {
  // Form 인스턴스: Ant Design 폼 제어 객체 (Java의 @ModelAttribute 바인딩과 유사)
  const [form] = Form.useForm();

  // loading: API 호출 중 버튼 비활성화 상태
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();                    // 페이지 이동 (response.sendRedirect 역할)
  const { setAuth, token } = useAuthStore();         // 로그인 성공 시 전역 상태 저장 함수

  // 이미 로그인된 상태로 /login 진입 시 대시보드로 리다이렉트
  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  /**
   * 데모 계정 값을 폼에 채우고 즉시 제출한다.
   * 방문자가 이메일·비밀번호를 직접 옮겨 적는 수고를 없애기 위한 것이다.
   */
  const handleDemoFill = () => {
    form.setFieldsValue({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password });
    form.submit();   // onFinish(handleSubmit) 호출 — 유효성 검사도 함께 수행된다
  };

  /**
   * 폼 제출 핸들러
   * onFinish: Ant Design Form이 유효성 검사 통과 후 자동 호출
   * values: 폼 필드값 객체 { email, password }
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await login(values.email, values.password);
      // 백엔드 응답 구조: { success: true, data: { token, userId, username, role } }
      const { token, userId, username, role } = res.data.data;
      setAuth(token, userId, username, role);  // localStorage + 전역 스토어 저장
      navigate('/dashboard');
    } catch (err) {
      // err.response.data.message: 백엔드 ApiResponse의 message 필드
      message.error(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 화면 중앙 배치: JSP에서 style="display:flex; justify-content:center" 와 동일
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
      }}
    >
      <Card
        style={{
          width: 'min(400px, calc(100% - 32px))',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          borderRadius: 6,
        }}
      >
        {/* 로고 + 앱명 — 클릭 시 메인(랜딩)으로 이동. 웹 관례라 별도 안내 없이도 통한다.
            color:'inherit'로 링크 기본 파란색 상속을 끊어 기존 로고 모양을 유지한다. */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link to="/" style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
            <img
              src="/logo-mark.svg"
              width={48}
              height={48}
              alt="Retrack"
              style={{ display: 'block', margin: '0 auto 12px' }}
            />
            <div style={{ fontSize: 24, fontWeight: 600, color: COLORS.fg, lineHeight: 1.33 }}>
              Retrack
            </div>
          </Link>
          <Text type="secondary" style={{ fontSize: 14 }}>연구과제 관리 시스템</Text>
        </div>

        {/* 데모 계정 안내 — 랜딩을 건너뛰고 /login으로 바로 들어온 방문자를 위한 것 */}
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
          message="가입 없이 둘러보기"
          description={
            <div style={{ fontSize: 13 }}>
              <div style={{ marginBottom: 8, lineHeight: 1.7 }}>
                아이디 <Text code>{DEMO_ACCOUNT.email}</Text><br />
                비밀번호 <Text code>{DEMO_ACCOUNT.password}</Text>
              </div>
              <Button size="small" onClick={handleDemoFill} loading={loading}>
                바로 로그인
              </Button>
            </div>
          }
        />

        {/* layout="vertical": 라벨이 입력 필드 위에 표시 */}
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="email"
            label="이메일"
            rules={[
              { required: true, message: '이메일을 입력하세요.' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
            ]}
          >
            <Input placeholder="이메일을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="password"
            label="비밀번호"
            rules={[{ required: true, message: '비밀번호를 입력하세요.' }]}
          >
            <Input.Password placeholder="비밀번호를 입력하세요" />
          </Form.Item>

          {/* block: 버튼을 부모 너비 전체로 확장 */}
          <Button type="primary" htmlType="submit" loading={loading} block>
            로그인
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          <Text type="secondary">계정이 없으신가요? </Text>
          <Link to="/register">회원가입</Link>
        </div>

        {/* 메인(랜딩) 복귀 경로 — 브라우저 뒤로 가기(navigate(-1))가 아니라 목적지 고정 이동이다.
            /login 진입 경로가 ①랜딩 CTA ②URL 직접 입력 ③401 자동 로그아웃 리다이렉트
            (api/index.js의 응답 인터셉터) 세 가지인데, ③에서 뒤로 가면 보호 페이지로 돌아가
            다시 401 → /login으로 튕겨 나오는 순환이 생기고, ②는 히스토리가 없어 동작하지 않는다. */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Button
            type="text"
            size="small"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ color: COLORS.fgTertiary }}
          >
            메인으로
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
