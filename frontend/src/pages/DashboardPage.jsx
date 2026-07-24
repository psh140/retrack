/**
 * 대시보드 페이지
 * GET /api/dashboard 결과를 역할별로 표시
 * - 공통: 과제 상태별 통계 카드 + 상태별 현황 바 차트 + 최근 알림
 * - ADMIN/MANAGER/RESEARCHER: 연구비 합계 추가
 * - ADMIN: 전체 사용자 수 추가
 *
 * @since 2026-05-18
 * @modified 2026-07-24 UI 일관성 1단계: 상태 레이블·색상·원화 포맷을 공통 상수로 이동
 */
import { useEffect, useState } from 'react';
import { Card, Typography, Tag, Spin, Empty, Grid } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDashboard } from '../api/index';
import { STATUS_MAP, STATUS_VALUES } from '../constants/project';
import { won } from '../utils/format';
import { COLORS } from '../theme';

const { Text } = Typography;
const { useBreakpoint } = Grid;  // 화면 크기 감지 훅 (Java의 request.getHeader("User-Agent") 분기와 유사)

function DashboardPage() {
  // useBreakpoint: 현재 뷰포트 크기를 객체로 반환
  // screens.md = true → 768px 이상(데스크탑), false → 모바일
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // data: 백엔드 /api/dashboard 응답의 data 필드 (역할별로 구조 상이)
  // Java로 치면: Map<String, Object> data = (Map) response.get("data");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);  // private boolean loading = true;
  const [error, setError] = useState(null);

  // useEffect: 컴포넌트 최초 렌더링 시 1회 실행 — JSP의 <%@ page ... %> 초기화 블록과 유사
  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => setError('대시보드 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card style={{ borderRadius: 6 }}>
        <Empty description={error || '데이터가 없습니다.'} />
      </Card>
    );
  }

  // projectsByStatus: { DRAFT: 1, IN_PROGRESS: 3, ... }
  // 없는 상태 키는 0으로 처리
  const byStatus = data.projectsByStatus || {};
  const totalProjects = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const inProgress    = byStatus.IN_PROGRESS || 0;
  const pending       = (byStatus.SUBMITTED || 0) + (byStatus.REVIEWING || 0);
  const completed     = byStatus.COMPLETED || 0;
  const maxCount      = Math.max(...STATUS_VALUES.map((s) => byStatus[s] || 0), 1);

  // 상단 통계 카드 4개 데이터 — 색상은 대응하는 과제 상태 색을 사용
  const statCards = [
    { label: '전체 과제',  value: totalProjects, hint: '등록된 과제 수',        color: COLORS.fg },
    { label: '진행 중',    value: inProgress,    hint: '활성 과제',             color: COLORS.brand },
    { label: '검토 대기',  value: pending,       hint: 'SUBMITTED · REVIEWING', color: STATUS_MAP.REVIEWING.fg },
    { label: '완료',       value: completed,     hint: '종료된 과제',           color: STATUS_MAP.COMPLETED.fg },
  ];

  // 반응형 컬럼 — lg+: 4열, sm+/모바일: 2열
  const statGridCols   = screens.lg ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)';
  const bottomGridCols = screens.lg ? '1fr 1fr' : '1fr';
  const gap            = isMobile ? 12 : 16;

  return (
    <div>
      {/* 페이지 제목 */}
      <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 600, marginBottom: isMobile ? 16 : 24, color: 'rgba(0,0,0,0.88)' }}>
        대시보드
      </div>

      {/* 통계 카드 4개 */}
      <div style={{ display: 'grid', gridTemplateColumns: statGridCols, gap, marginBottom: gap }}>
        {statCards.map(({ label, value, hint, color }) => (
          <Card key={label} size="small" style={{ borderRadius: 6 }}>
            <div style={{ color: 'rgba(0,0,0,0.65)', fontSize: 14 }}>{label}</div>
            <div style={{
              fontSize: isMobile ? 24 : 30,
              fontWeight: 600,
              color,
              marginTop: 8,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {value}
            </div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12, marginTop: 4 }}>{hint}</div>
          </Card>
        ))}
      </div>

      {/* 상태별 현황 + 연구비/사용자 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: bottomGridCols, gap, marginBottom: gap }}>

        {/* 상태별 과제 현황 바 차트 */}
        <Card title="상태별 과제 현황" size="small" style={{ borderRadius: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STATUS_VALUES.map((st) => {
              const count = byStatus[st] || 0;
              const pct   = (count / maxCount) * 100;
              const col   = STATUS_MAP[st];
              return (
                <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* 상태 태그 */}
                  <div style={{ width: 60, flexShrink: 0 }}>
                    <Tag style={{
                      color: col.fg, background: col.bg, borderColor: col.border,
                      fontSize: 11, margin: 0, borderRadius: 2,
                    }}>
                      {col.label}
                    </Tag>
                  </div>
                  {/* 바 */}
                  <div style={{ flex: 1, height: 8, background: COLORS.fillTertiary, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: col.fg, borderRadius: 4,
                      transition: 'width 400ms ease',
                    }} />
                  </div>
                  {/* 건수 */}
                  <div style={{ width: 30, textAlign: 'right', fontSize: 13, fontVariantNumeric: 'tabular-nums', color: 'rgba(0,0,0,0.88)' }}>
                    {count}건
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 우측: 연구비 합계 + ADMIN 사용자 수 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap }}>
          {/* 연구비 합계 — VIEWER는 totalBudget 없음 */}
          {data.totalBudget !== undefined && (
            <Card size="small" style={{ borderRadius: 6 }}>
              <div style={{ color: 'rgba(0,0,0,0.65)', fontSize: 14 }}>
                {data.role === 'ADMIN' ? '전체 연구비 합계' : '담당 연구비 합계'}
              </div>
              <div style={{
                fontSize: isMobile ? 22 : 28,
                fontWeight: 600,
                color: COLORS.brand,
                marginTop: 8,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {won(data.totalBudget)}
              </div>
            </Card>
          )}

          {/* 전체 사용자 수 — ADMIN 전용 */}
          {data.totalUsers !== undefined && (
            <Card size="small" style={{ borderRadius: 6 }}>
              <div style={{ color: 'rgba(0,0,0,0.65)', fontSize: 14 }}>전체 사용자 수</div>
              <div style={{
                fontSize: isMobile ? 24 : 30,
                fontWeight: 600,
                color: 'rgba(0,0,0,0.88)',
                marginTop: 8,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {data.totalUsers}명
              </div>
            </Card>
          )}

          {/* VIEWER: 우측 카드 없음 — 빈 영역 방지 */}
          {data.totalBudget === undefined && data.totalUsers === undefined && (
            <Card size="small" style={{ borderRadius: 6, height: '100%' }}>
              <Empty description="추가 집계 정보 없음" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>
          )}
        </div>
      </div>

      {/* 최근 알림 */}
      <Card
        title={<><BellOutlined style={{ marginRight: 6 }} />최근 알림</>}
        size="small"
        style={{ borderRadius: 6 }}
      >
        {!data.recentNotifications?.length ? (
          <Empty description="최근 알림이 없습니다." image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.recentNotifications.map((n, i) => (
              <div
                key={n.notificationId ?? i}
                style={{
                  padding: '12px 0',
                  borderBottom: i < data.recentNotifications.length - 1 ? '1px solid #f0f0f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.88)', marginBottom: 2 }}>{n.title}</div>
                  {n.message && (
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{n.message}</div>
                  )}
                </div>
                <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
                  {n.createdAt ? dayjs(n.createdAt).format('MM.DD HH:mm') : ''}
                </Text>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default DashboardPage;
