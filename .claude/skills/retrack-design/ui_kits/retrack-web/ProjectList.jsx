/* ProjectList — table view with filters */
const { useState: useStatePL } = React;

function ProjectList({ onOpenProject, onCreate }) {
  const T = window.RT;
  const D = window.RT_DATA;
  const F = window.RT_FMT;
  const bp = useBreakpoint();
  const isMobile = !bp.md;
  const [q, setQ] = useStatePL('');
  const [status, setStatus] = useStatePL('ALL');

  const rows = D.projects.filter(p =>
    (status === 'ALL' || p.status === status) &&
    (q === '' || p.name.includes(q) || p.code.includes(q) || p.owner.includes(q))
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 16 : 24, gap: 12 }}>
        <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 600 }}>과제 목록</div>
        <Button type="primary" icon={<Icon name="plus" />} onClick={onCreate}>
          {isMobile ? '등록' : '과제 등록'}
        </Button>
      </div>

      <Card bodyStyle={{ padding: isMobile ? 12 : 16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', minWidth: 200, maxWidth: 320 }}>
            <Input prefix={<Icon name="search" size={14} color="tertiary" />} value={q} onChange={setQ} placeholder="과제명, 과제번호, 담당자 검색" />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              ['ALL', '전체'],
              ['IN_PROGRESS', '진행중'],
              ['REVIEWING', '검토중'],
              ['APPROVED', '승인'],
              ['COMPLETED', '완료'],
            ].map(([k, l]) => (
              <Button key={k} type={status === k ? 'primary' : 'default'} size="middle" onClick={() => setStatus(k)}>{l}</Button>
            ))}
          </div>
        </div>

        <Table
          columns={[
            { key: 'code', dataIndex: 'code', title: '과제번호', width: 130, render: (v) => <span style={{ fontFamily: "'SFMono-Regular', monospace", color: T.fgSecondary, fontSize: 13 }}>{v}</span> },
            { key: 'name', dataIndex: 'name', title: '과제명' },
            { key: 'status', dataIndex: 'status', title: '상태', width: 130, render: (v) => <StatusTag status={v} /> },
            { key: 'owner', dataIndex: 'owner', title: '담당자', width: 90 },
            { key: 'category', dataIndex: 'category', title: '분류', width: 120, render: (v) => <Tag color="default">{v}</Tag> },
            { key: 'budget', dataIndex: 'budget', title: '예산', width: 130, render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{F.won(v)}</span> },
            { key: 'end', dataIndex: 'end', title: '마감', width: 110, render: (v) => <span style={{ color: T.fgSecondary, fontVariantNumeric: 'tabular-nums' }}>{v}</span> },
          ]}
          dataSource={rows}
          onRowClick={(r) => onOpenProject(r.id)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 13, color: T.fgSecondary, flexWrap: 'wrap' }}>
          <span>총 {rows.length}건</span>
          <span style={{ marginLeft: 16, display: 'inline-flex', gap: 4 }}>
            <span style={{ width: 28, height: 28, borderRadius: T.radius, border: `1px solid ${T.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.fgTertiary }}>‹</span>
            <span style={{ width: 28, height: 28, borderRadius: T.radius, border: `1px solid ${T.brand}`, background: '#fff', color: T.brand, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>1</span>
            <span style={{ width: 28, height: 28, borderRadius: T.radius, border: `1px solid ${T.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>2</span>
            <span style={{ width: 28, height: 28, borderRadius: T.radius, border: `1px solid ${T.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>›</span>
          </span>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { ProjectList });
