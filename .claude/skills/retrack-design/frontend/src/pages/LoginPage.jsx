/**
 * 로그인 페이지
 * 공개 페이지 — MainLayout(사이드바/헤더) 없이 단독 표시
 * 로그인 성공 시 authStore에 토큰·사용자 정보 저장 후 /dashboard 이동
 *
 * @since 2026-05-14
 */
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/index';          // POST /api/auth/login
import useAuthStore from '../store/authStore'; // 전역 로그인 상태 (HttpSession 역할)

const { Title, Text } = Typography;

function LoginPage() {
  // Form 인스턴스: Ant Design 폼 제어 객체 (Java의 @ModelAttribute 바인딩과 유사)
  const [form] = Form.useForm();

  // loading: API 호출 중 버튼 비활성화 상태
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();              // 페이지 이동 (response.sendRedirect 역할)
  const { setAuth } = useAuthStore();          // 로그인 성공 시 전역 상태 저장 함수

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
      const { token, userId, role } = res.data.data;
      setAuth(token, userId, role);  // localStorage + 전역 스토어 저장
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
      <Card style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Retrack</Title>
          <Text type="secondary">연구과제 관리 시스템</Text>
        </div>

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

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">계정이 없으신가요? </Text>
          <Link to="/register">회원가입</Link>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
