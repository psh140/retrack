/**
 * 활동 로그 페이지 (ADMIN 전용)
 * - 사용자 ID 필터로 특정 사용자 로그 조회
 * - 초기화 버튼으로 전체 로그 복귀
 * - 로그 테이블 (logId, userId, action, targetType, targetId, description, createdAt)
 * - createdAt 내림차순 정렬 (최신 순)
 *
 * @since 2026-05-19
 */
import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  InputNumber,
  Button,
  Tag,
  Space,
  Row,
  Col,
  Typography,
  message,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getActivityLogs, getUserActivityLogs } from '../api/index';

const { Title } = Typography;

/**
 * 액션 태그 색상 매핑
 * action 값에 따라 Tag 색상을 구분하여 시각적 가독성 향상
 */
const ACTION_COLOR = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  LOGIN: 'purple',
  LOGOUT: 'default',
  VERIFY: 'cyan',
  ROLE_CHANGE: 'orange',
};

function ActivityLogPage() {
  // private List<ActivityLogVO> logs = new ArrayList<>();
  const [logs, setLogs] = useState([]);
  // private boolean loading = false;
  const [loading, setLoading] = useState(false);
  // private Long filterUserId = null; — 사용자 ID 필터 입력값
  const [filterUserId, setFilterUserId] = useState(null);

  // 마운트 시 전체 로그 조회
  useEffect(() => {
    fetchAllLogs();
  }, []);

  /**
   * 전체 활동 로그 조회
   * res.data.data = List<ActivityLogVO>
   */
  const fetchAllLogs = async () => {
    setLoading(true);
    try {
      const res = await getActivityLogs();
      setLogs(res.data.data || []);
    } catch {
      message.error('활동 로그를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 특정 사용자 활동 로그 조회
   * res.data.data = List<ActivityLogVO>
   */
  const fetchUserLogs = async () => {
    if (!filterUserId) {
      message.warning('사용자 ID를 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await getUserActivityLogs(filterUserId);
      setLogs(res.data.data || []);
    } catch {
      message.error('사용자 로그를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /** 초기화 — 전체 로그로 복귀 */
  const handleReset = () => {
    setFilterUserId(null);
    fetchAllLogs();
  };

  /** 로그 테이블 컬럼 정의 */
  const columns = [
    {
      title: '로그 ID',
      dataIndex: 'logId',
      key: 'logId',
      width: 80,
    },
    {
      title: '사용자 ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 90,
    },
    {
      title: '액션',
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (action) => (
        <Tag color={ACTION_COLOR[action] || 'default'}>{action}</Tag>
      ),
    },
    {
      title: '대상 타입',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 110,
    },
    {
      title: '대상 ID',
      dataIndex: 'targetId',
      key: 'targetId',
      width: 80,
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      // createdAt 내림차순 정렬 — 최신 순
      defaultSortOrder: 'descend',
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={4} style={{ marginBottom: 16 }}>
        활동 로그
      </Title>

      {/* 사용자 ID 필터 */}
      <Card style={{ marginBottom: 16, background: '#fff' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col>
            {/* InputNumber — private Long filterUserId 입력 폼 역할 */}
            <InputNumber
              placeholder="사용자 ID 입력"
              value={filterUserId}
              onChange={(value) => setFilterUserId(value)}
              min={1}
              style={{ width: 160 }}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={fetchUserLogs}
            >
              조회
            </Button>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              초기화
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 로그 테이블 */}
      <Card style={{ background: '#fff' }}>
        <Table
          rowKey="logId"
          columns={columns}
          dataSource={logs}
          loading={loading}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          size="small"
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}

export default ActivityLogPage;
