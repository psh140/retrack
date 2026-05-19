/**
 * 통계 페이지 (ADMIN 전용)
 * - 과제 상태별 현황 (BarChart)
 * - 연구비 카테고리별 합계 (BarChart)
 * - 연구비 소진 현황 번레이트 (Table + Progress)
 * - 월별 알림 발송 건수 (LineChart)
 *
 * @since 2026-05-19
 */
import { useEffect, useState } from 'react';
import { Card, Col, Row, Table, Progress, Space, Typography, Spin, message } from 'antd';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import {
  getProjectStatusStats,
  getBudgetCategoryStats,
  getBudgetBurnRate,
  getMonthlyNotificationStats,
} from '../api/index';

const { Title } = Typography;

/** 과제 상태 한글 레이블 매핑 */
const STATUS_LABEL = {
  DRAFT: '초안',
  SUBMITTED: '제출됨',
  REVIEWING: '검토중',
  APPROVED: '승인됨',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  REJECTED: '반려',
};

/** 연구비 카테고리 한글 레이블 매핑 */
const CATEGORY_LABEL = {
  PERSONNEL: '인건비',
  TRAVEL: '출장비',
  RESEARCH_ACTIVITY: '연구활동비',
  ETC: '기타',
};

function StatsPage() {
  // private List statusData = new ArrayList<>();  — 과제 상태별 차트 데이터
  const [statusData, setStatusData] = useState([]);
  // private List categoryData = new ArrayList<>(); — 카테고리별 차트 데이터
  const [categoryData, setCategoryData] = useState([]);
  // private List burnrateData = new ArrayList<>(); — 번레이트 테이블 데이터
  const [burnrateData, setBurnrateData] = useState([]);
  // private List monthlyData = new ArrayList<>();  — 월별 알림 차트 데이터
  const [monthlyData, setMonthlyData] = useState([]);
  // private boolean loading = false;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 4개 통계 API 병렬 호출 */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statusRes, categoryRes, burnrateRes, monthlyRes] = await Promise.all([
        getProjectStatusStats(),
        getBudgetCategoryStats(),
        getBudgetBurnRate(),
        getMonthlyNotificationStats(),
      ]);

      // res.data.data = Map { "DRAFT": N, "SUBMITTED": N, ... }
      const statusMap = statusRes.data.data || {};
      setStatusData(
        Object.entries(statusMap).map(([key, value]) => ({
          name: STATUS_LABEL[key] || key,
          건수: value,
        }))
      );

      // res.data.data = Map { "PERSONNEL": N, ..., "total": N }
      const categoryMap = categoryRes.data.data || {};
      setCategoryData(
        Object.entries(categoryMap)
          // total 항목은 차트에서 제외
          .filter(([key]) => key !== 'total')
          .map(([key, value]) => ({
            name: CATEGORY_LABEL[key] || key,
            금액: value,
          }))
      );

      // res.data.data = List [{ projectId, title, budgetTotal, budgetUsed, burnRate }]
      setBurnrateData(burnrateRes.data.data || []);

      // res.data.data = List [{ month: "2026-04", count: 12 }]
      setMonthlyData(monthlyRes.data.data || []);
    } catch {
      message.error('통계 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /** 번레이트 테이블 컬럼 정의 */
  const burnrateColumns = [
    {
      title: '과제명',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '총 예산',
      dataIndex: 'budgetTotal',
      key: 'budgetTotal',
      render: (value) => `${(value || 0).toLocaleString()}원`,
    },
    {
      title: '집행액',
      dataIndex: 'budgetUsed',
      key: 'budgetUsed',
      render: (value) => `${(value || 0).toLocaleString()}원`,
    },
    {
      title: '소진율',
      dataIndex: 'burnRate',
      key: 'burnRate',
      render: (value) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Progress
            percent={Math.round(value || 0)}
            size="small"
            status={value >= 100 ? 'exception' : 'normal'}
          />
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          background: '#f5f5f5',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={4} style={{ marginBottom: 16 }}>
        통계
      </Title>

      <Row gutter={[16, 16]}>
        {/* 과제 상태별 현황 — BarChart */}
        <Col xs={24} lg={12}>
          <Card title="과제 상태별 현황" style={{ background: '#fff' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}건`, '건수']} />
                <Bar dataKey="건수" fill="#1677ff" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 연구비 카테고리별 합계 — BarChart */}
        <Col xs={24} lg={12}>
          <Card title="연구비 카테고리별 합계" style={{ background: '#fff' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => [`${(value || 0).toLocaleString()}원`, '금액']} />
                <Bar dataKey="금액" fill="#52c41a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 연구비 소진 현황 (번레이트) — Table */}
        <Col xs={24}>
          <Card title="연구비 소진 현황 (번레이트)" style={{ background: '#fff' }}>
            <Table
              rowKey="projectId"
              columns={burnrateColumns}
              dataSource={burnrateData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 월별 알림 발송 건수 — LineChart */}
        <Col xs={24}>
          <Card title="월별 알림 발송 건수" style={{ background: '#fff' }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}건`, '발송 건수']} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#722ed1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default StatsPage;
