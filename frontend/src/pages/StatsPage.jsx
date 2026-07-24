/**
 * 통계 페이지 (ADMIN 전용)
 * - 과제 상태별 현황 (BarChart)
 * - 연구비 카테고리별 합계 (BarChart)
 * - 연구비 소진 현황 번레이트 (Table + Progress)
 * - 월별 알림 발송 건수 (LineChart)
 *
 * @since 2026-05-19
 * @modified 2026-07-24 UI 일관성 1단계: 상태·카테고리 레이블을 공통 상수로 통일 (초안→작성중, 출장비→여비)
 * @modified 2026-07-24 UI 일관성 2단계: 페이지 자체 padding/background/minHeight 제거 (MainLayout이 관리)
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
import { STATUS_LABELS, CATEGORY_LABELS, STATUS_MAP } from '../constants/project';
import { won } from '../utils/format';
import { COLORS, SPACING } from '../theme';

const { Title } = Typography;

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

  // 마운트 시 1회 조회 — fetchAll은 아래에서 선언되지만 호출 시점에는 이미 정의되어 있다
  useEffect(() => {
    fetchAll();
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
          name: STATUS_LABELS[key] || key,
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
            name: CATEGORY_LABELS[key] || key,
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
      align: 'right',
      render: (value) => won(value),
    },
    {
      title: '집행액',
      dataIndex: 'budgetUsed',
      key: 'budgetUsed',
      align: 'right',
      render: (value) => won(value),
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
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  // 바깥 여백·배경은 MainLayout의 Content가 관리하므로 여기서 지정하지 않는다
  return (
    <div>
      <Title level={4} style={{ marginBottom: SPACING.md }}>
        통계
      </Title>

      <Row gutter={[16, 16]}>
        {/* 과제 상태별 현황 — BarChart */}
        <Col xs={24} lg={12}>
          <Card title="과제 상태별 현황">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}건`, '건수']} />
                <Bar dataKey="건수" fill={COLORS.brand} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 연구비 카테고리별 합계 — BarChart */}
        <Col xs={24} lg={12}>
          <Card title="연구비 카테고리별 합계">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => [won(value), '금액']} />
                <Bar dataKey="금액" fill={STATUS_MAP.APPROVED.fg} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 연구비 소진 현황 (번레이트) — Table */}
        <Col xs={24}>
          <Card title="연구비 소진 현황 (번레이트)">
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
          <Card title="월별 알림 발송 건수">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}건`, '발송 건수']} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={STATUS_MAP.COMPLETED.fg}
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
