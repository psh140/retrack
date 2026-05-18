/**
 * 과제 상세 페이지
 * - 기본정보 탭: 과제 정보 카드 + 상태 변경 + 상태 이력 + 첨부파일
 * - 연구비 탭: 카테고리별 집계 차트 + 연구비 집행 내역 테이블
 *
 * @since 2026-05-18
 */
import { useEffect, useState, useCallback } from 'react';
import {
  Tabs, Descriptions, Tag, Button, Table, Typography, message,
  Modal, Form, Input, InputNumber, Select, DatePicker, Upload,
  Spin, Space, Card, Grid, Popconfirm,
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined, DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom'; // response.sendRedirect() 역할
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  getProject, changeProjectStatus, getProjectHistory, deleteProject,
  getBudgets, createBudget, updateBudget, deleteBudget, getBudgetSummary,
  getFiles, uploadFile, deleteFile,
} from '../api/index';
import useAuthStore from '../store/authStore'; // session.getAttribute() 역할

const { Title } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

// 상태 레이블 + 색상
const STATUS_OPTIONS = [
  { value: 'DRAFT',       label: '작성중', color: 'default'  },
  { value: 'SUBMITTED',   label: '제출',   color: 'blue'     },
  { value: 'REVIEWING',   label: '검토중', color: 'cyan'     },
  { value: 'APPROVED',    label: '승인',   color: 'green'    },
  { value: 'IN_PROGRESS', label: '진행중', color: 'geekblue' },
  { value: 'COMPLETED',   label: '완료',   color: 'purple'   },
  { value: 'REJECTED',    label: '반려',   color: 'red'      },
];
const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]));

// 백엔드 ProjectService.VALID_TRANSITIONS 와 동일
const VALID_TRANSITIONS = {
  DRAFT:       ['SUBMITTED'],
  SUBMITTED:   ['REVIEWING'],
  REVIEWING:   ['APPROVED', 'REJECTED'],
  APPROVED:    ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED:   [],
  REJECTED:    [],
};

// 권한 계층
const ROLE_ORDER = ['VIEWER', 'RESEARCHER', 'MANAGER', 'ADMIN'];
const hasRole = (userRole, required) =>
  ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(required);

// 연구비 카테고리 — BudgetService.VALID_CATEGORIES 와 동일
const CATEGORY_LABELS = {
  PERSONNEL:        '인건비',
  TRAVEL:           '여비',
  RESEARCH_ACTIVITY:'연구활동비',
  ETC:              '기타',
};

const CATEGORY_COLORS = {
  PERSONNEL:         '#1677ff',
  TRAVEL:            '#13c2c2',
  RESEARCH_ACTIVITY: '#52c41a',
  ETC:               '#faad14',
};

// 원화 포맷
const won = (n) => (n ?? 0).toLocaleString('ko-KR') + '원';

function ProjectDetailPage() {
  const { id } = useParams();                    // req.getParameter("id") 역할
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { userRole, userId } = useAuthStore();   // session.getAttribute() 역할

  // 과제 정보 상태
  const [project, setProject]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [history, setHistory]   = useState([]);   // List<ProjectHistoryVO>
  const [files, setFiles]       = useState([]);   // List<FileVO>

  // 연구비 상태
  const [budgets, setBudgets]   = useState([]);   // List<BudgetVO>
  const [summary, setSummary]   = useState({});   // { PERSONNEL:..., total:... }

  // 상태 변경 Modal
  const [statusModal, setStatusModal]     = useState(false); // private boolean statusModal = false;
  const [statusForm]                      = Form.useForm();
  const [statusLoading, setStatusLoading] = useState(false);

  // 연구비 등록/수정 Modal
  const [budgetModal, setBudgetModal]     = useState(false);  // private boolean budgetModal = false;
  const [budgetTarget, setBudgetTarget]   = useState(null);   // null → 등록, VO → 수정
  const [budgetForm]                      = Form.useForm();
  const [budgetLoading, setBudgetLoading] = useState(false);

  // 파일 업로드 로딩
  const [uploadLoading, setUploadLoading] = useState(false);

  /** 과제 기본 정보 조회
   * @param {boolean} showSpinner - 초기 진입 시 true, 상태 변경 후 리프레시 시 false
   */
  const fetchProject = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await getProject(id);
      setProject(res.data.data);
    } catch {
      message.error('과제 정보를 불러오지 못했습니다.');
      navigate('/projects');
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [id, navigate]);

  /** 상태 변경 이력 조회 */
  const fetchHistory = useCallback(async () => {
    try {
      const res = await getProjectHistory(id);
      setHistory(res.data.data || []);
    } catch { /* 이력 조회 실패는 조용히 처리 */ }
  }, [id]);

  /** 첨부파일 목록 조회 */
  const fetchFiles = useCallback(async () => {
    try {
      const res = await getFiles(id);
      setFiles(res.data.data || []);
    } catch { /* 파일 조회 실패는 조용히 처리 */ }
  }, [id]);

  /** 연구비 목록 + 카테고리별 집계 조회 */
  const fetchBudgets = useCallback(async () => {
    try {
      const [listRes, sumRes] = await Promise.all([getBudgets(id), getBudgetSummary(id)]);
      setBudgets(listRes.data.data || []);
      setSummary(sumRes.data.data || {});
    } catch { /* 연구비 조회 실패는 조용히 처리 */ }
  }, [id]);

  // 최초 렌더링 시 전체 데이터 조회
  useEffect(() => {
    fetchProject();
    fetchHistory();
    fetchFiles();
    fetchBudgets();
  }, [fetchProject, fetchHistory, fetchFiles, fetchBudgets]);

  /** 상태 변경 처리 (MANAGER+) */
  const handleStatusSubmit = async (values) => {
    setStatusLoading(true);
    try {
      await changeProjectStatus(id, values.status, values.comment || '');
      message.success('상태가 변경되었습니다.');
      setStatusModal(false);
      statusForm.resetFields();
      fetchProject(false); // 스피너 없이 리프레시
      fetchHistory();
    } catch (err) {
      message.error(err.response?.data?.message || '상태 변경에 실패했습니다.');
    } finally {
      setStatusLoading(false);
    }
  };

  /** 과제 삭제 (ADMIN) */
  const handleDelete = async () => {
    try {
      await deleteProject(id);
      message.success('과제가 삭제되었습니다.');
      navigate('/projects');
    } catch (err) {
      message.error(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  /** 파일 업로드 (RESEARCHER+) */
  const handleUpload = async ({ file }) => {
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadFile(id, formData);
      message.success('파일이 업로드되었습니다.');
      fetchFiles();
    } catch (err) {
      message.error(err.response?.data?.message || '업로드에 실패했습니다.');
    } finally {
      setUploadLoading(false);
    }
  };

  /** 파일 삭제 */
  const handleDeleteFile = async (fileId) => {
    try {
      await deleteFile(id, fileId);
      message.success('파일이 삭제되었습니다.');
      fetchFiles();
    } catch (err) {
      message.error(err.response?.data?.message || '파일 삭제에 실패했습니다.');
    }
  };

  /** 파일 다운로드 — Authorization 헤더가 필요하므로 fetch 사용 */
  const handleDownload = (fileId, fileName) => {
    const token = localStorage.getItem('token');
    fetch(`/api/projects/${id}/files/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => message.error('파일 다운로드에 실패했습니다.'));
  };

  /** 연구비 등록/수정 Modal 열기 */
  const openBudgetModal = (record = null) => {
    setBudgetTarget(record);
    budgetForm.resetFields();
    if (record) {
      budgetForm.setFieldsValue({
        category:    record.category,
        description: record.description,
        amount:      record.amount,
        usedAt:      record.usedAt ? dayjs(record.usedAt) : null,
      });
    }
    setBudgetModal(true);
  };

  /** 연구비 저장 */
  const handleBudgetSubmit = async (values) => {
    setBudgetLoading(true);
    const data = {
      category:    values.category,
      description: values.description,
      amount:      values.amount,
      usedAt:      values.usedAt ? values.usedAt.format('YYYY-MM-DD HH:mm:ss') : null,
    };
    try {
      if (budgetTarget) {
        await updateBudget(id, budgetTarget.budgetId, data);
        message.success('연구비가 수정되었습니다.');
      } else {
        await createBudget(id, data);
        message.success('연구비가 등록되었습니다.');
      }
      setBudgetModal(false);
      budgetForm.resetFields();
      fetchBudgets();
    } catch (err) {
      message.error(err.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setBudgetLoading(false);
    }
  };

  /** 연구비 삭제 (ADMIN) */
  const handleDeleteBudget = async (budgetId) => {
    try {
      await deleteBudget(id, budgetId);
      message.success('연구비 내역이 삭제되었습니다.');
      fetchBudgets();
    } catch (err) {
      message.error(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  // 로딩 중 — JSP의 <c:if test="${loading}"> 역할
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) return null;

  const currentStatus = STATUS_MAP[project.status];
  // MANAGER 이상: 현재 상태 제외한 전체 상태 선택 가능 / 그 미만: 정해진 전이만 허용
  const nextStatuses = hasRole(userRole, 'MANAGER')
    ? STATUS_OPTIONS.map((s) => s.value).filter((v) => v !== project.status)
    : VALID_TRANSITIONS[project.status] || [];

  // recharts 차트 데이터
  const chartData = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    name:   label,
    amount: summary[key] || 0,
    key,
  }));

  /* ─────────────── 탭 1: 기본정보 ─────────────── */
  const infoTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 과제 기본 정보 카드 */}
      <Card>
        <Descriptions
          bordered
          size="small"
          column={isMobile ? 1 : 2}
          labelStyle={{ background: '#fafafa', whiteSpace: 'nowrap' }}
        >
          <Descriptions.Item label="과제명" span={isMobile ? 1 : 2}>{project.title}</Descriptions.Item>
          <Descriptions.Item label="설명"   span={isMobile ? 1 : 2}>{project.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="상태">
            {currentStatus
              ? <Tag color={currentStatus.color}>{currentStatus.label}</Tag>
              : <Tag>{project.status}</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="총 연구비">{won(project.budgetTotal)}</Descriptions.Item>
          <Descriptions.Item label="시작일">
            {project.startDate ? dayjs(project.startDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="종료일">
            {project.endDate ? dayjs(project.endDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="등록일">
            {project.createdAt ? dayjs(project.createdAt).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="수정일">
            {project.updatedAt ? dayjs(project.updatedAt).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
        </Descriptions>

        {/* 액션 버튼 — JSP의 <c:if> 역할로 권한별 표시 */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {hasRole(userRole, 'MANAGER') && nextStatuses.length > 0 && (
            <Button type="primary" onClick={() => setStatusModal(true)}>상태 변경</Button>
          )}
          {hasRole(userRole, 'RESEARCHER') && (
            <Button icon={<EditOutlined />} onClick={() => navigate(`/projects/${id}/edit`)}>
              수정
            </Button>
          )}
          {hasRole(userRole, 'ADMIN') && (
            <Popconfirm
              title="과제를 삭제하시겠습니까?"
              description="삭제된 과제는 복구할 수 없습니다."
              onConfirm={handleDelete}
              okText="삭제"
              cancelText="취소"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />}>삭제</Button>
            </Popconfirm>
          )}
        </div>
      </Card>

      {/* 상태 변경 이력 */}
      <Card title="상태 변경 이력">
        <Table
          rowKey="historyId"
          dataSource={history}
          size="small"
          pagination={false}
          locale={{ emptyText: '이력이 없습니다.' }}
          columns={[
            {
              title: '이전 상태',
              dataIndex: 'prevStatus',
              key: 'prevStatus',
              render: (v) => {
                if (!v) return '-';
                const s = STATUS_MAP[v];
                return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>;
              },
            },
            {
              title: '변경 상태',
              dataIndex: 'newStatus',
              key: 'newStatus',
              render: (v) => {
                const s = STATUS_MAP[v];
                return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>;
              },
            },
            {
              title: '코멘트',
              dataIndex: 'comment',
              key: 'comment',
              render: (v) => v || '-',
            },
            {
              title: '변경일시',
              dataIndex: 'changedAt',
              key: 'changedAt',
              width: 150,
              render: (v) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-',
            },
          ]}
        />
      </Card>

      {/* 첨부파일 */}
      <Card
        title="첨부파일"
        extra={
          hasRole(userRole, 'RESEARCHER') && (
            <Upload showUploadList={false} customRequest={handleUpload}>
              <Button icon={<UploadOutlined />} loading={uploadLoading} size="small">
                파일 업로드
              </Button>
            </Upload>
          )
        }
      >
        <Table
          rowKey="fileId"
          dataSource={files}
          size="small"
          pagination={false}
          locale={{ emptyText: '첨부파일이 없습니다.' }}
          columns={[
            {
              title: '파일명',
              dataIndex: 'fileName',
              key: 'fileName',
              render: (v, record) => (
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(record.fileId, v)}
                  style={{ padding: 0 }}
                >
                  {v}
                </Button>
              ),
            },
            {
              title: '파일 형식',
              dataIndex: 'fileType',
              key: 'fileType',
              width: 140,
              render: (v) => v || '-',
            },
            {
              title: '업로드일',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 110,
              render: (v) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
            },
            {
              title: '',
              key: 'action',
              width: 60,
              render: (_, record) =>
                (hasRole(userRole, 'ADMIN') || String(record.uploadedBy) === String(userId)) && (
                  <Popconfirm
                    title="파일을 삭제하시겠습니까?"
                    onConfirm={() => handleDeleteFile(record.fileId)}
                    okText="삭제"
                    cancelText="취소"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                ),
            },
          ]}
        />
      </Card>
    </div>
  );

  /* ─────────────── 탭 2: 연구비 ─────────────── */
  const budgetTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 카테고리별 집계 */}
      <Card title="카테고리별 연구비">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <div
              key={key}
              style={{
                flex: '1 1 110px',
                padding: '12px 16px',
                border: '1px solid #f0f0f0',
                borderRadius: 6,
                background: '#fafafa',
              }}
            >
              <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: CATEGORY_COLORS[key] }}>
                {won(summary[key] || 0)}
              </div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => v >= 10000 ? `${(v / 10000).toFixed(0)}만` : v}
            />
            <Tooltip formatter={(v) => [won(v), '금액']} />
            <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={CATEGORY_COLORS[entry.key] || '#1677ff'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ marginTop: 8, textAlign: 'right', fontWeight: 600 }}>
          합계: {won(summary.total || 0)}
        </div>
      </Card>

      {/* 연구비 집행 내역 */}
      <Card
        title="연구비 집행 내역"
        extra={
          hasRole(userRole, 'RESEARCHER') && (
            <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => openBudgetModal()}>
              연구비 등록
            </Button>
          )
        }
      >
        <Table
          rowKey="budgetId"
          dataSource={budgets}
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `총 ${t}건` }}
          locale={{ emptyText: '연구비 내역이 없습니다.' }}
          scroll={isMobile ? { x: true } : undefined}
          columns={[
            {
              title: '카테고리',
              dataIndex: 'category',
              key: 'category',
              width: 110,
              render: (v) => CATEGORY_LABELS[v] || v,
            },
            {
              title: '내역',
              dataIndex: 'description',
              key: 'description',
            },
            {
              title: '금액',
              dataIndex: 'amount',
              key: 'amount',
              width: 130,
              align: 'right',
              render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{won(v)}</span>,
            },
            {
              title: '사용일시',
              dataIndex: 'usedAt',
              key: 'usedAt',
              width: 150,
              render: (v) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-',
            },
            {
              title: '',
              key: 'action',
              width: 80,
              render: (_, record) => (
                <Space size={4}>
                  {hasRole(userRole, 'RESEARCHER') && (
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => openBudgetModal(record)}
                    />
                  )}
                  {hasRole(userRole, 'ADMIN') && (
                    <Popconfirm
                      title="삭제하시겠습니까?"
                      onConfirm={() => handleDeleteBudget(record.budgetId)}
                      okText="삭제"
                      cancelText="취소"
                      okButtonProps={{ danger: true }}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Button
          type="text"
          onClick={() => navigate('/projects')}
          style={{ padding: 0, height: 'auto', color: '#8c8c8c' }}
        >
          ← 목록으로
        </Button>
        <Title level={4} style={{ margin: 0 }}>{project.title}</Title>
        {currentStatus && <Tag color={currentStatus.color}>{currentStatus.label}</Tag>}
      </div>

      {/* 탭 — JSP의 jQuery UI Tabs 역할 */}
      <Tabs
        defaultActiveKey="info"
        items={[
          { key: 'info',   label: '기본정보', children: infoTab   },
          { key: 'budget', label: '연구비',   children: budgetTab },
        ]}
      />

      {/* 상태 변경 Modal */}
      <Modal
        title="과제 상태 변경"
        open={statusModal}
        onCancel={() => { setStatusModal(false); statusForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={statusForm} layout="vertical" onFinish={handleStatusSubmit}>
          <Form.Item
            name="status"
            label="변경할 상태"
            rules={[{ required: true, message: '상태를 선택해 주세요.' }]}
          >
            <Select
              placeholder="상태 선택"
              options={nextStatuses.map((s) => ({ value: s, label: STATUS_MAP[s]?.label || s }))}
            />
          </Form.Item>
          <Form.Item name="comment" label="코멘트">
            <TextArea rows={3} placeholder="변경 사유를 입력해 주세요." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setStatusModal(false); statusForm.resetFields(); }}>취소</Button>
              <Button type="primary" htmlType="submit" loading={statusLoading}>변경</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 연구비 등록/수정 Modal */}
      <Modal
        title={budgetTarget ? '연구비 수정' : '연구비 등록'}
        open={budgetModal}
        onCancel={() => { setBudgetModal(false); budgetForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={budgetForm} layout="vertical" onFinish={handleBudgetSubmit}>
          <Form.Item
            name="category"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택해 주세요.' }]}
          >
            <Select
              placeholder="카테고리 선택"
              options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="내역"
            rules={[{ required: true, message: '내역을 입력해 주세요.' }]}
          >
            <Input placeholder="사용 내역을 입력해 주세요." />
          </Form.Item>
          <Form.Item
            name="amount"
            label="금액 (원)"
            rules={[{ required: true, message: '금액을 입력해 주세요.' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => v.replace(/,/g, '')}
              placeholder="금액 입력"
            />
          </Form.Item>
          <Form.Item
            name="usedAt"
            label="사용일시"
            rules={[{ required: true, message: '사용일시를 선택해 주세요.' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} placeholder="사용일시 선택" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setBudgetModal(false); budgetForm.resetFields(); }}>취소</Button>
              <Button type="primary" htmlType="submit" loading={budgetLoading}>
                {budgetTarget ? '수정 완료' : '등록'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProjectDetailPage;
