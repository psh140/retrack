/**
 * 알림 목록 페이지
 * - 로그인 사용자의 알림 목록 테이블 (메시지, 상태, 생성일시)
 * - 과제 연결 알림: 행 클릭 시 /projects/:id 이동
 * - MANAGER 이상: "알림 발송" 버튼 (수신자 Select·과제 Select·메시지 입력 Modal)
 *
 * @since 2026-05-18
 * @modified 2026-05-19 수신자·과제 ID 직접 입력 → Select 드롭다운으로 개선
 * @modified 2026-07-24 UI 일관성 1단계: 권한·포맷 상수를 공통 모듈로 이동
 * @modified 2026-07-24 UI 일관성 4단계: PageHeader·EmptyState 공통 컴포넌트 적용
 */
import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, message, Modal, Form, Input, Select, Grid } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // response.sendRedirect() 역할
import { getNotifications, sendNotification, getUsers, getProjects } from '../api/index';
import useAuthStore from '../store/authStore';   // session.getAttribute() 역할
import { hasRole } from '../constants/role';
import { formatDateTime } from '../utils/format';
import { COLORS, SPACING } from '../theme';
import { PageHeader, EmptyState } from '../components/common';

const { TextArea } = Input;
const { useBreakpoint } = Grid;

// 알림 발송 상태 레이블 + 색상 (알림 도메인 전용 — 과제 상태와 별개이므로 StatusTag를 쓰지 않는다)
const STATUS_MAP = {
  PENDING: { label: '대기',    color: 'gold'  },
  SENT:    { label: '발송완료', color: 'green' },
  FAILED:  { label: '실패',    color: 'red'   },
};

function NotificationPage() {
  const screens    = useBreakpoint();            // 반응형 브레이크포인트 감지
  const isMobile   = !screens.md;               // private boolean isMobile;
  const navigate   = useNavigate();              // response.sendRedirect() 역할
  const { userRole } = useAuthStore();           // session.getAttribute("userRole") 역할

  const [notifications, setNotifications] = useState([]); // List<NotificationVO>
  const [loading, setLoading]             = useState(false); // private boolean loading = false;

  // 알림 발송 Modal
  const [sendModal, setSendModal]         = useState(false); // private boolean sendModal = false;
  const [sendForm]                        = Form.useForm();  // BindingResult 역할
  const [sendLoading, setSendLoading]     = useState(false); // private boolean sendLoading = false;

  // Modal용 사용자·과제 목록 (Select 옵션)
  const [userOptions, setUserOptions]     = useState([]); // List<UserVO> — 수신자 선택용 (전체 캐시)
  const [projectOptions, setProjectOptions] = useState([]); // List<ProjectVO> — 과제 선택용
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [userSearch, setUserSearch]       = useState(''); // 수신자 검색어 — 검색어 있을 때만 옵션 표시

  /** 내 알림 목록 조회 */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data.data || []);
    } catch {
      message.error('알림 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 최초 렌더링 시 목록 조회
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /** Modal 열릴 때 사용자·과제 목록 로드 */
  const handleOpenSendModal = async () => {
    setSendModal(true);
    setOptionsLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        getUsers({ size: 50 }),
        getProjects({ size: 50 }),
      ]);
      setUserOptions(usersRes.data.data.items || []);
      setProjectOptions(projectsRes.data.data.items || []);
    } catch {
      message.error('목록을 불러오지 못했습니다.');
    } finally {
      setOptionsLoading(false);
    }
  };

  /** 알림 발송 처리 (MANAGER 이상) */
  const handleSend = async (values) => {
    setSendLoading(true);
    try {
      await sendNotification({
        userId:    values.userId,
        projectId: values.projectId || null,
        message:   values.message,
      });
      message.success('알림 발송 요청이 완료됐습니다.');
      setSendModal(false);
      sendForm.resetFields();
      setUserSearch('');
      fetchNotifications();
    } catch (err) {
      message.error(err.response?.data?.message || '알림 발송에 실패했습니다.');
    } finally {
      setSendLoading(false);
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      title: '메시지',
      dataIndex: 'message',
      key: 'message',
      render: (v, record) =>
        record.projectId ? (
          <span style={{ color: COLORS.brand, cursor: 'pointer' }}>{v}</span>
        ) : v,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (v) => {
        const s = STATUS_MAP[v];
        return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>;
      },
    },
    ...(!isMobile ? [
      {
        title: '생성일시',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 150,
        render: (v) => formatDateTime(v),
      },
      {
        title: '발송일시',
        dataIndex: 'sentAt',
        key: 'sentAt',
        width: 150,
        render: (v) => formatDateTime(v),
      },
    ] : []),
  ];

  return (
    <div>
      {/* 페이지 헤더 — MANAGER 이상만 발송 버튼 표시 (JSP의 <c:if> 역할) */}
      <PageHeader
        title="알림"
        extra={
          hasRole(userRole, 'MANAGER') && (
            <Button
              type="primary"
              icon={<BellOutlined />}
              onClick={handleOpenSendModal}
            >
              알림 발송
            </Button>
          )
        }
      />

      {/* 알림 목록 테이블 */}
      <Table
        rowKey="notificationId"
        columns={columns}
        dataSource={notifications}
        loading={loading}
        size="middle"
        onRow={(record) => ({
          // 과제 연결 알림이면 클릭 시 해당 과제 상세로 이동
          onClick: () => record.projectId && navigate(`/projects/${record.projectId}`),
          style: { cursor: record.projectId ? 'pointer' : 'default' },
        })}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
          showTotal: (t) => `총 ${t}건`,
        }}
        locale={{ emptyText: <EmptyState description="알림이 없습니다." /> }}
        scroll={isMobile ? { x: true } : undefined}
      />

      {/* 알림 발송 Modal (MANAGER 이상) */}
      <Modal
        title="알림 발송"
        open={sendModal}
        onCancel={() => { setSendModal(false); sendForm.resetFields(); setUserSearch(''); }}
        footer={null}
        destroyOnClose
      >
        <Form form={sendForm} layout="vertical" onFinish={handleSend}>
          <Form.Item
            name="userId"
            label="수신자"
            rules={[{ required: true, message: '수신자를 선택해 주세요.' }]}
          >
            {/* 사용자 이름+이메일로 검색·선택 — JSP의 <select> 역할 */}
            {/* 검색어가 있을 때만 옵션 표시 (초기 빈 드롭다운 방지) */}
            <Select
              showSearch
              placeholder="이름 또는 이메일로 검색"
              loading={optionsLoading}
              filterOption={false}
              onSearch={(val) => setUserSearch(val)}
              notFoundContent={userSearch ? '검색 결과 없음' : null}
              options={userSearch
                ? userOptions
                    .filter((u) =>
                      `${u.username} ${u.email}`
                        .toLowerCase()
                        .includes(userSearch.toLowerCase())
                    )
                    .map((u) => ({ value: u.userId, label: `${u.username} (${u.email})` }))
                : []
              }
            />
          </Form.Item>

          <Form.Item name="projectId" label="관련 과제 (선택)">
            {/* 과제명으로 검색·선택 */}
            <Select
              showSearch
              allowClear
              placeholder="과제명으로 검색 (선택사항)"
              loading={optionsLoading}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              options={projectOptions.map((p) => ({
                value: p.projectId,
                label: p.title,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label="메시지"
            rules={[{ required: true, message: '메시지를 입력해 주세요.' }]}
          >
            <TextArea rows={4} placeholder="발송할 메시지를 입력해 주세요." maxLength={500} showCount />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => { setSendModal(false); sendForm.resetFields(); }} style={{ marginRight: SPACING.xs }}>
              취소
            </Button>
            <Button type="primary" htmlType="submit" loading={sendLoading}>
              발송
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default NotificationPage;
