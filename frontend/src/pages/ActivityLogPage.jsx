/**
 * 활동 로그 페이지 (ADMIN 전용)
 * - 사용자 ID 필터로 특정 사용자 로그 조회
 * - 초기화 버튼으로 전체 로그 복귀
 * - 로그 테이블 (logId, userId, action, targetType, targetId, description, createdAt)
 * - createdAt 내림차순 정렬 (최신 순)
 *
 * @since 2026-05-19
 * @modified 2026-05-26 ACTION_COLOR 실제 DB action 값으로 수정, 액션 컬럼 width 조정
 * @modified 2026-07-24 UI 일관성 1단계: 일시 포맷을 공통 유틸로 이동
 * @modified 2026-07-24 UI 일관성 2단계: 페이지 자체 padding/background/minHeight 제거 (MainLayout이 관리)
 * @modified 2026-07-24 UI 일관성 4단계: PageHeader·FilterToolbar·EmptyState 적용, 테이블 Card 래핑 제거
 */
import { useEffect, useState } from 'react';
import {
  Table,
  InputNumber,
  Button,
  Tag,
  message,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getActivityLogs, getUserActivityLogs } from '../api/index';
import { formatDateTime } from '../utils/format';
import { PageHeader, FilterToolbar, EmptyState } from '../components/common';

/**
 * 액션 태그 색상 매핑 (활동 로그 전용 — 과제 상태와 별개이므로 StatusTag를 쓰지 않는다)
 * action 값에 따라 Tag 색상을 구분하여 시각적 가독성 향상
 */
const ACTION_COLOR = {
  LOGIN: 'purple',
  CREATE_PROJECT: 'green',
  FILE_UPLOAD: 'blue',
  CHANGE_STATUS: 'blue',
  PROJECT_STATUS_CHANGE: 'blue',
  NOTIFICATION_SEND: 'cyan',
  USER_ROLE_CHANGE: 'orange',
  USER_VERIFY: 'cyan',
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
      width: 210,
      render: (action) => (
        <Tag color={ACTION_COLOR[action] || 'default'}>{action}</Tag>
      ),
    },
    {
      title: '대상 타입',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 120,
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
      render: (value) => formatDateTime(value),
    },
  ];

  // 바깥 여백·배경은 MainLayout의 Content가 관리하므로 여기서 지정하지 않는다
  return (
    <div>
      <PageHeader title="활동 로그" />

      {/* 사용자 ID 필터 — 배치·간격은 FilterToolbar가 관리 */}
      <FilterToolbar>
        {/* InputNumber — private Long filterUserId 입력 폼 역할 */}
        <InputNumber
          placeholder="사용자 ID 입력"
          value={filterUserId}
          onChange={(value) => setFilterUserId(value)}
          min={1}
          style={{ width: 160 }}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={fetchUserLogs}
        >
          조회
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          초기화
        </Button>
      </FilterToolbar>

      {/* 로그 테이블 — 다른 목록 화면과 동일하게 Card로 감싸지 않는다 */}
      <Table
        rowKey="logId"
        columns={columns}
        dataSource={logs}
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
          showTotal: (t) => `총 ${t}건`,
        }}
        size="small"
        scroll={{ x: 1000 }}
        locale={{ emptyText: <EmptyState description="활동 로그가 없습니다." /> }}
      />
    </div>
  );
}

export default ActivityLogPage;
