/* Dashboard — overview screen (responsive) */
function Dashboard({ onOpenProject }) {
  const T = window.RT;
  const D = window.RT_DATA;
  const F = window.RT_FMT;
  const bp = useBreakpoint();
  const isMobile = !bp.md;
  const isNarrow = !bp.lg;

  const counts = {
    total: D.projects.length,
    inProgress: D.projects.filter(p => p.status === 'IN_PROGRESS').length,
    pending: D.projects.filter(p => ['SUBMITTED', 'REVIEWING'].includes(p.status)).length,
    completed: D.projects.filter(p => p.status === 'COMPLETED').length,
  };

  const stat = (label, value, hint, color) => (
    <Card>
      <div style={{ color: T.fgSecondary, fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: isMobile ? 24 : 30, fontWeight: 600, color: color || T.fg, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ color: T.fgTertiary, fontSize: 12, marginTop: 4 }}>{hint}</div>
    </Card>
  );

  const summary = D.budgetSummary;
  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  let acc = 0;
  const segments = Object.entries(summary).map(([k, v]) => {
    const start = acc / total * 360; acc += v;
    const end = acc / total * 360;
    return { k, v, start, end, color: T.budgetColor[k] };
  });
  const polar = (cx, cy, r, deg) => {
    const rad = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const arc = (cx, cy, r, a1, a2) => {
    const [x1, y1] = polar(cx, cy, r, a2);
    const [x2, y2] = polar(cx, cy, r, a1);
    const large = a2 - a1 <= 180 ? 0 : 1;
    return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 0 ${x2},${y2} Z`;
  };

  // 4-up stats: 4 cols (lg+), 2 cols (md), 2 cols (sm) for visual rhythm
  const statCols = bp.lg ? 'repeat(4, 1fr)'
                : bp.sm ? 'repeat(2, 1fr)'
                :         'repeat(2, 1fr)';
  // 2-up charts: 1fr 1fr on lg+, stack below
  const chartCols = bp.lg ? '1fr 1fr' : '1fr';

  return (
    <div>
      <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 600, marginBottom: isMobile ? 16 : 24 }}>대시보드</div>
      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: isMobile ? 12 : 16, marginBottom: isMobile ? 12 : 16 }}>
        {stat('전체 과제', counts.total, '등록된 과제 수')}
        {stat('진행 중', counts.inProgress, '활성 과제', T.brand)}
        {stat('검토 대기', counts.pending, 'SUBMITTED · REVIEWING')}
        {stat('완료', counts.completed, '종료된 과제', '#531dab')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: chartCols, gap: isMobile ? 12 : 16, marginBottom: isMobile ? 12 : 16 }}>
        <Card title="연구비 카테고리별 집행">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 16 : 24,
            flexDirection: isMobile ? 'column' : 'row',
          }}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
              {segments.map(s => (
                <path key={s.k} d={arc(80, 80, 70, s.start, s.end)} fill={s.color} />
              ))}
              <circle cx="80" cy="80" r="42" fill="#fff" />
              <text x="80" y="74" textAnchor="middle" fontSize="12" fill={T.fgSecondary}>합계</text>
              <text x="80" y="92" textAnchor="middle" fontSize="14" fontWeight="600" fill={T.fg}>{F.won(total)}</text>
            </svg>
            <div style={{ flex: 1, width: '100%' }}>
              {segments.map(s => (
                <div key={s.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px dashed ${T.borderSecondary}`, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                    <span>{T.budgetLabel[s.k]}</span>
                  </div>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{F.won(s.v)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="상태별 과제 현황">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['DRAFT','SUBMITTED','REVIEWING','APPROVED','IN_PROGRESS','COMPLETED','REJECTED'].map(st => {
              const n = D.projects.filter(p => p.status === st).length;
              const pct = n / D.projects.length * 100;
              const s = T.statusColor[st];
              return (
                <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: isMobile ? 90 : 110, fontSize: 12, fontFamily: "'SFMono-Regular', monospace", color: T.fgSecondary }}>{st}</div>
                  <div style={{ flex: 1, height: 8, background: T.fillTertiary, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: s.fg, transition: 'width 400ms' }} />
                  </div>
                  <div style={{ width: 28, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{n}건</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="최근 과제" extra={<Button type="link" onClick={() => null}>전체 보기</Button>}>
        <Table
          columns={[
            { key: 'code', dataIndex: 'code', title: '과제번호', width: 130, render: (v) => <span style={{ fontFamily: "'SFMono-Regular', monospace", color: T.fgSecondary, fontSize: 13 }}>{v}</span> },
            { key: 'name', dataIndex: 'name', title: '과제명' },
            { key: 'status', dataIndex: 'status', title: '상태', width: 140, render: (v) => <StatusTag status={v} /> },
            { key: 'owner', dataIndex: 'owner', title: '담당자', width: 80 },
            { key: 'budget', dataIndex: 'budget', title: '예산', width: 140, render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{F.won(v)}</span> },
          ]}
          dataSource={D.projects.slice(0, 4)}
          onRowClick={(r) => onOpenProject(r.id)}
        />
      </Card>
    </div>
  );
}

Object.assign(window, { Dashboard });
