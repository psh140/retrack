/**
 * 회원가입 페이지
 * 공개 페이지 — MainLayout 없이 단독 표시
 * 가입 성공 시 /login으로 이동
 * 기본 권한은 VIEWER로 설정됨 (백엔드 DB 기본값)
 *
 * @since 2026-05-14
 */
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/index'; // POST /api/auth/register

const { Title, Text } = Typography;

function RegisterPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await register(values.username, values.email, values.password, values.phone);
      message.success('회원가입이 완료됐습니다. 로그인해 주세요.');
      navigate('/login');
    } catch (err) {
      message.error(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <Text type="secondary">회원가입</Text>
        </div>

        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="username"
            label="이름"
            rules={[{ required: true, message: '이름을 입력하세요.' }]}
          >
            <Input placeholder="이름을 입력하세요" />
          </Form.Item>

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

          {/* phone은 선택 입력 */}
          <Form.Item name="phone" label="연락처">
            <Input placeholder="연락처를 입력하세요 (선택)" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            가입하기
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">이미 계정이 있으신가요? </Text>
          <Link to="/login">로그인</Link>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;
