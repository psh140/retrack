/**
 * 사용자 관리 페이지 (ADMIN 전용)
 * - 키워드 / 역할 / 인증 여부 필터 검색
 * - 인라인 권한 변경 (Select)
 * - 인증 승인 버튼 (미승인 사용자만 활성화)
 * - 삭제 버튼 (Popconfirm)
 * - 페이지네이션
 *
 * @since 2026-05-19
 */
import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Popconfirm,
  Space,
  Row,
  Col,
  message,
  Typography,
} from 'antd';
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getUsers,
  updateUserRole,
  verifyUser,
  deleteUser,
} from '../api/index';

const { Title } = Typography;
const { Option } = Select;

/** 역할 선택지 */
const ROLE_OPTIONS = ['VIEWER', 'RESEARCHER', 'MANAGER', 'ADMIN'];

function UserManagePage() {
  // private List<UserVO> users = new ArrayList<>();
  const [users, setUsers] = useState([]);
  // private int totalCount = 0;
  const [totalCount, setTotalCount] = useState(0);
  // private boolean loading = false;
  const [loading, setLoading] = useState(false);

  // 검색 파라미터 — request.getParameter() 역할
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [isVerifiedFilter, setIsVerifiedFilter] = useState(undefined);
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  /**
   * 사용자 목록 조회
   * res.data.data = PageResponse { items: UserVO[], totalCount, page, size, totalPages }
   */
  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await getUsers({
        keyword: params.keyword !== undefined ? params.keyword : keyword,
        role: params.role !== undefined ? params.role : roleFilter,
        isVerified:
          params.isVerified !== undefined ? params.isVerified : isVerifiedFilter,
        page: params.page !== undefined ? params.page : page,
        size,
      });
      const data = res.data.data; // PageResponse
      setUsers(data.items || []);
      setTotalCount(data.totalCount || 0);
    } catch {
      message.error('사용자 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [keyword, roleFilter, isVerifiedFilter, page, size]);

  // 마운트 시 최초 조회
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /** 검색 실행 — page를 1로 초기화 후 API 호출 (page 이미 1이면 useEffect 미실행이므로 직접 호출) */
  const handleSearch = () => {
    if (page !== 1) {
      setPage(1); // useEffect [page] 의존성이 fetchUsers를 호출
    } else {
      fetchUsers({ page: 1 });
    }
  };

  /** 역할 필터 변경 */
  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
  };

  /** 인증 여부 필터 변경 */
  const handleVerifiedFilterChange = (value) => {
    setIsVerifiedFilter(value);
  };

  /**
   * 인라인 역할 변경
   * @param {number} userId - 대상 사용자 ID
   * @param {string} newRole - 변경할 역할
   */
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      message.success('역할이 변경되었습니다.');
      fetchUsers();
    } catch {
      message.error('역할 변경에 실패했습니다.');
    }
  };

  /**
   * 인증 승인
   * @param {number} userId - 대상 사용자 ID
   */
  const handleVerify = async (userId) => {
    try {
      await verifyUser(userId);
      message.success('인증이 승인되었습니다.');
      fetchUsers();
    } catch {
      message.error('인증 승인에 실패했습니다.');
    }
  };

  /**
   * 사용자 삭제
   * @param {number} userId - 삭제할 사용자 ID
   */
  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      message.success('사용자가 삭제되었습니다.');
      fetchUsers();
    } catch {
      message.error('사용자 삭제에 실패했습니다.');
    }
  };

  /** Ant Design Table 컬럼 정의 */
  const columns = [
    {
      title: '이름',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '권한',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        /* 인라인 역할 변경 — JSP의 <select> onChange 역할 */
        <Select
          value={role}
          size="small"
          style={{ width: 130 }}
          onChange={(newRole) => handleRoleChange(record.userId, newRole)}
        >
          {ROLE_OPTIONS.map((r) => (
            <Option key={r} value={r}>
              {r}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: '인증',
      dataIndex: 'verified',
      key: 'verified',
      render: (verified) =>
        verified ? (
          <Tag color="green">승인됨</Tag>
        ) : (
          <Tag color="default">미승인</Tag>
        ),
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '액션',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {/* 미승인 사용자만 인증 버튼 활성화 — JSP의 <c:if test="!verified"> 역할 */}
          <Button
            type="link"
            size="small"
            icon={<CheckCircleOutlined />}
            disabled={record.verified}
            onClick={() => handleVerify(record.userId)}
          >
            인증 승인
          </Button>
          <Popconfirm
            title="정말 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.userId)}
            okText="삭제"
            cancelText="취소"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={4} style={{ marginBottom: 16 }}>
        사용자 관리
      </Title>

      {/* 검색 바 */}
      <Card style={{ marginBottom: 16, background: '#fff' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col flex="auto">
            <Input.Search
              placeholder="이름 또는 이메일 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="권한 필터"
              allowClear
              style={{ width: 140 }}
              value={roleFilter}
              onChange={handleRoleFilterChange}
            >
              <Option value={undefined}>전체</Option>
              {ROLE_OPTIONS.map((r) => (
                <Option key={r} value={r}>
                  {r}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="인증 여부"
              allowClear
              style={{ width: 120 }}
              value={isVerifiedFilter}
              onChange={handleVerifiedFilterChange}
            >
              <Option value={undefined}>전체</Option>
              <Option value={true}>승인됨</Option>
              <Option value={false}>미승인</Option>
            </Select>
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch}>
              검색
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 사용자 테이블 */}
      <Card style={{ background: '#fff' }}>
        <Table
          rowKey="userId"
          columns={columns}
          dataSource={users}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize: size,
            total: totalCount,
            showSizeChanger: false,
            onChange: (newPage) => setPage(newPage),
          }}
        />
      </Card>
    </div>
  );
}

export default UserManagePage;
