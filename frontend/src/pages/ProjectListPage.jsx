/**
 * 과제 목록 페이지
 * - 과제 목록 테이블 (keyword + status 검색, 페이지네이션)
 * - RESEARCHER 이상: "과제 등록" 버튼 표시
 * - 행 클릭 시 /projects/:id 이동
 *
 * @since 2026-05-18
 * @modified 2026-07-24 UI 일관성 1단계: 상태·권한·포맷 상수를 공통 모듈로 이동
 */
import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Select, Button, Tag, Typography, message, Grid } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';  // response.sendRedirect() 역할
import { getProjects } from '../api/index';
import useAuthStore from '../store/authStore';    // session.getAttribute() 역할
import { PROJECT_STATUSES, STATUS_MAP } from '../constants/project';
import { hasRole } from '../constants/role';
import { won, formatDate } from '../utils/format';
import { COLORS } from '../theme';

const { Title } = Typography;
const { useBreakpoint } = Grid;

function ProjectListPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();

  // authStore: session.getAttribute("userRole") 역할
  const { userRole } = useAuthStore();

  // 검색 조건 상태
  const [keyword, setKeyword]   = useState('');         // private String keyword = '';
  const [status, setStatus]     = useState(undefined);  // private String status = null;

  // 테이블 데이터 상태
  const [projects, setProjects] = useState([]);  // List<ProjectVO> projects
  const [total, setTotal]       = useState(0);   // 전체 건수 (페이지네이션용)
  const [page, setPage]         = useState(1);   // 현재 페이지 번호
  const [size] = useState(10);                   // 페이지당 건수
  const [loading, setLoading]   = useState(false);

  /**
   * 과제 목록 API 호출
   * useCallback: 함수 재생성 방지 — Java의 static 메서드처럼 동일 참조 유지
   */
  const fetchProjects = useCallback(
    async (kw, st, pg) => {
      setLoading(true);
      try {
        const params = { page: pg, size };
        if (kw) params.keyword = kw;
        if (st) params.status = st;
        const res = await getProjects(params);
        // 백엔드 PageResponse: { items, totalCount, page, size, totalPages }
        const data = res.data.data;
        setProjects(data.items || []);
        setTotal(data.totalCount || 0);
      } catch {
        message.error('과제 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [size]
  );

  // 최초 렌더링 시 목록 조회
  useEffect(() => {
    fetchProjects(keyword, status, page);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** 검색 버튼 클릭 — page를 1로 초기화하고 재조회 */
  const handleSearch = () => {
    setPage(1);
    fetchProjects(keyword, status, 1);
  };

  /** 상태 필터 변경 — 즉시 검색 */
  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
    fetchProjects(keyword, val, 1);
  };

  /** 페이지네이션 변경 */
  const handlePageChange = (pg) => {
    setPage(pg);
    fetchProjects(keyword, status, pg);
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      title: '과제명',
      dataIndex: 'title',
      key: 'title',
      render: (v) => <span style={{ color: COLORS.brand, cursor: 'pointer' }}>{v}</span>,
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
        title: '시작일',
        dataIndex: 'startDate',
        key: 'startDate',
        width: 110,
        render: (v) => formatDate(v),
      },
      {
        title: '종료일',
        dataIndex: 'endDate',
        key: 'endDate',
        width: 110,
        render: (v) => formatDate(v),
      },
      {
        title: '예산',
        dataIndex: 'budgetTotal',
        key: 'budgetTotal',
        width: 140,
        align: 'right',
        render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{won(v)}</span>,
      },
      {
        title: '등록일',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 110,
        render: (v) => formatDate(v),
      },
    ] : []),
  ];

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <Title level={4} style={{ margin: 0 }}>과제 목록</Title>

        {/* RESEARCHER 이상만 과제 등록 버튼 표시 — JSP의 <c:if> 역할 */}
        {hasRole(userRole, 'RESEARCHER') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/projects/new')}
          >
            과제 등록
          </Button>
        )}
      </div>

      {/* 검색 영역 */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}>
        <Input.Search
          placeholder="과제명 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={handleSearch}
          onPressEnter={handleSearch}
          style={{ width: isMobile ? '100%' : 260 }}
          allowClear
          onClear={() => { setKeyword(''); setPage(1); fetchProjects('', status, 1); }}
        />
        <Select
          placeholder="상태 전체"
          value={status}
          onChange={handleStatusChange}
          allowClear
          onClear={() => handleStatusChange(undefined)}
          style={{ width: isMobile ? '100%' : 140 }}
          options={PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />
        {!isMobile && (
          <Button onClick={handleSearch}>검색</Button>
        )}
      </div>

      {/* 과제 목록 테이블 */}
      <Table
        rowKey="projectId"
        columns={columns}
        dataSource={projects}
        loading={loading}
        size="middle"
        onRow={(record) => ({
          onClick: () => navigate(`/projects/${record.projectId}`),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          current: page,
          pageSize: size,
          total,
          onChange: handlePageChange,
          showTotal: (t) => `총 ${t}건`,
          showSizeChanger: false,
        }}
        locale={{ emptyText: '등록된 과제가 없습니다.' }}
        scroll={isMobile ? { x: true } : undefined}
      />
    </div>
  );
}

export default ProjectListPage;
