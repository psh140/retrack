/**
 * 과제 등록/수정 공용 폼 페이지
 * - /projects/new       → id 없음 → 신규 등록 (POST /api/projects)
 * - /projects/:id/edit  → id 있음 → 수정     (PUT  /api/projects/:id)
 * RESEARCHER 이상만 접근 가능 (백엔드에서도 권한 검증)
 *
 * @since 2026-05-18
 */
import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, DatePicker, Button, Card, Typography, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom'; // response.sendRedirect() 역할
import dayjs from 'dayjs';
import { getProject, createProject, updateProject } from '../api/index';

const { Title } = Typography;
const { TextArea } = Input;

function ProjectFormPage() {
  const { id } = useParams();       // id 있으면 수정 모드
  const isEdit = Boolean(id);       // private boolean isEdit = id != null;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading]               = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit); // 수정 모드: 기존 데이터 로딩 여부

  // 수정 모드: 기존 과제 데이터 로딩하여 폼에 세팅
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await getProject(id);
        const p = res.data.data;
        form.setFieldsValue({
          title:       p.title,
          description: p.description,
          startDate:   p.startDate ? dayjs(p.startDate) : null,
          endDate:     p.endDate   ? dayjs(p.endDate)   : null,
          budgetTotal: p.budgetTotal,
        });
      } catch {
        message.error('과제 정보를 불러오지 못했습니다.');
        navigate('/projects');
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [id, isEdit, form, navigate]);

  /** 폼 제출 — 등록 또는 수정 분기 */
  const handleSubmit = async (values) => {
    setLoading(true);
    const data = {
      title:       values.title,
      description: values.description || '',
      startDate:   values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
      endDate:     values.endDate   ? values.endDate.format('YYYY-MM-DD')   : null,
      budgetTotal: values.budgetTotal || 0,
    };
    try {
      if (isEdit) {
        await updateProject(id, data);
        message.success('과제가 수정되었습니다.');
        navigate(`/projects/${id}`);
      } else {
        const res = await createProject(data);
        message.success('과제가 등록되었습니다.');
        navigate(`/projects/${res.data.data}`); // 백엔드가 projectId(Long) 단일값 반환
      }
    } catch (err) {
      message.error(err.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        {isEdit ? '과제 수정' : '과제 등록'}
      </Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={initialLoading}
        >
          <Form.Item
            name="title"
            label="과제명"
            rules={[{ required: true, message: '과제명을 입력해 주세요.' }]}
          >
            <Input placeholder="과제명을 입력해 주세요." maxLength={100} showCount />
          </Form.Item>

          <Form.Item name="description" label="과제 설명">
            <TextArea rows={5} placeholder="과제 내용을 입력해 주세요." maxLength={500} showCount />
          </Form.Item>

          <Form.Item name="startDate" label="시작일">
            <DatePicker style={{ width: '100%' }} placeholder="시작일 선택" />
          </Form.Item>

          <Form.Item name="endDate" label="종료일">
            <DatePicker style={{ width: '100%' }} placeholder="종료일 선택" />
          </Form.Item>

          <Form.Item name="budgetTotal" label="총 연구비 (원)">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => v.replace(/,/g, '')}
              placeholder="0"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? '수정 완료' : '등록'}
              </Button>
              <Button onClick={() => navigate(isEdit ? `/projects/${id}` : '/projects')}>
                취소
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ProjectFormPage;
