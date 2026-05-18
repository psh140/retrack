/* ProjectDetail — title + tabs (기본정보 / 연구비), responsive */
const { useState: useStatePD } = React;

function ProjectDetail({ projectId, onBack }) {
  const T = window.RT;
  const D = window.RT_DATA;
  const F = window.RT_FMT;
  const bp = useBreakpoint();
  const isMobile = !bp.md;
  const isNarrow = !bp.lg;
  const p = D.projects.find(x => x.id === projectId) || D.projects[0];
  const [tab, setTab] = useStatePD('info');

  // 2-col grid on lg+, stack below
  const infoLayout  = bp.lg ? '2fr 1fr' : '1fr';
  const budgetLayout = bp.lg ? '1fr 320px' : '1fr';
  // info-table inner grid: 4-col (label/value/label/value) on md+, 2-col on mobile
  const infoTblCols = isMobile ? '100px 1fr' : '120px 1fr 120px 1fr';
  // when 2-col, the "과제명" full-width row spans 1 value column; when 4-col, spans 3
  const nameSpan    = isMobile ? 'span 1' : 'span 3';

  const InfoTab = (
    <div style={{ display: 'grid', gridTemplateColumns: infoLayout, gap: isMobile ? 12 : 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
        <Card title="과제 정보">
          <div style={{ display: 'grid', gridTemplateColumns: infoTblCols, rowGap: 14, columnGap: 16, fontSize: 14 }}>
            <div style={{ color: T.fgSecondary }}>과제번호</div>
            <div style={{ fontFamily: "'SFMono-Regular', monospace" }}>{p.code}</div>
            <div style={{ color: T.fgSecondary }}>상태</div>
            <div><StatusTag status={p.status} showLabel /></div>

            <div style={{ color: T.fgSecondary }}>과제명</div>
            <div style={{ gridColumn: nameSpan }}>{p.name}</div>

            <div style={{ color: T.fgSecondary }}>분류</div>
            <div><Tag color="default">{p.category}</Tag></div>
            <div style={{ color: T.fgSecondary }}>예산</div>
            <div style={{ fontVariantNumeric: 'tabular-nums' }}>{F.won(p.budget)}</div>

            <div style={{ color: T.fgSecondary }}>신청자</div>
            <div>{p.owner}</div>
            <div style={{ color: T.fgSecondary }}>담당자</div>
            <div>{p.manager}</div>

            <div style={{ color: T.fgSecondary }}>시작일</div>
            <div style={{ fontVariantNumeric: 'tabular-nums' }}>{p.start}</div>
            <div style={{ color: T.fgSecondary }}>종료일</div>
            <div style={{ fontVariantNumeric: 'tabular-nums' }}>{p.end}</div>
          </div>
        </Card>

        <Card title="첨부파일" extra={<Button icon={<Icon name="upload" />}>업로드</Button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {D.files.map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                padding: '10px 12px', borderRadius: T.radius,
                border: `1px solid ${T.borderSecondary}`,
              }}>
                <Icon name="paper-clip" size={16} color="tertiary" />
                <div style={{ flex: '1 1 200px', fontSize: 14, minWidth: 0 }}>{f.name}</div>
                <div style={{ color: T.fgTertiary, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{f.size} · {f.uploadedBy} · {f.at}</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  <Button type="text" icon={<Icon name="download" size={14} />} />
                  <Button type="text" icon={<Icon name="delete" size={14} />} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="상태 변경 이력">
        <div style={{ position: 'relative', paddingLeft: 16 }}>
          <div style={{ position: 'absolute', left: 6, top: 6, bottom: 6, width: 1, background: T.borderSecondary }} />
          {D.history.map(h => (
            <div key={h.id} style={{ position: 'relative', paddingBottom: 16 }}>
              <div style={{ position: 'absolute', left: -14, top: 4, width: 10, height: 10, borderRadius: '50%', background: T.statusColor[h.status]?.fg || T.brand, border: '2px solid #fff', boxShadow: `0 0 0 1px ${T.statusColor[h.status]?.fg || T.brand}` }} />
              <div style={{ fontSize: 13, fontFamily: "'SFMono-Regular', monospace", color: T.fgTertiary, marginBottom: 2 }}>{h.at}</div>
              <div style={{ fontSize: 14, marginBottom: 2 }}><StatusTag status={h.status} /> <span style={{ marginLeft: 6, color: T.fgSecondary }}>{h.user}</span></div>
              <div style={{ fontSize: 13, color: T.fgSecondary }}>{h.note}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const BudgetTab = (
    <div style={{ display: 'grid', gridTemplateColumns: budgetLayout, gap: isMobile ? 12 : 16 }}>
      <Card title="연구비 사용 내역" extra={<Button type="primary" icon={<Icon name="plus" />}>연구비 등록</Button>}>
        <Table
          columns={[
            { key: 'date', dataIndex: 'date', title: '일자', width: 110, render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', color: T.fgSecondary }}>{v}</span> },
            { key: 'category', dataIndex: 'category', title: '카테고리', width: 140, render: (v) => <Tag color={{ bg: '#fff', border: T.budgetColor[v], fg: T.budgetColor[v] }}>{T.budgetLabel[v]}</Tag> },
            { key: 'desc', dataIndex: 'desc', title: '내역' },
            { key: 'amount', dataIndex: 'amount', title: '금액', width: 130, render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{F.won(v)}</span> },
          ]}
          dataSource={D.budget}
        />
      </Card>

      <Card title="집계">
        <div style={{ fontSize: 12, color: T.fgSecondary, marginBottom: 4 }}>총 집행</div>
        <div style={{ fontSize: 28, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: T.brand }}>{F.won(p.spent)}</div>
        <div style={{ fontSize: 12, color: T.fgTertiary, marginBottom: 16, fontVariantNumeric: 'tabular-nums' }}>예산 {F.won(p.budget)} 중 {Math.round(p.spent / p.budget * 100)}% 소진</div>
        <div style={{ height: 8, background: T.fillTertiary, borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ width: `${p.spent / p.budget * 100}%`, height: '100%', background: T.brand }} />
        </div>
        <div style={{ borderTop: `1px solid ${T.borderSecondary}`, paddingTop: 12 }}>
          {Object.entries(D.budgetSummary).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: T.budgetColor[k] }} />
                {T.budgetLabel[k]}
              </span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{F.won(v)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Button type="text" icon={<Icon name="left" size={14} />} onClick={onBack}>목록</Button>
        <span style={{ color: T.fgTertiary, fontSize: 13, fontFamily: "'SFMono-Regular', monospace" }}>{p.code}</span>
      </div>
      <div style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        marginBottom: isMobile ? 16 : 24,
        gap: 12,
        flexDirection: isMobile ? 'column' : 'row',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 600 }}>{p.name}</div>
          <StatusTag status={p.status} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Button icon={<Icon name="edit" size={14} />}>수정</Button>
          <Button danger icon={<Icon name="delete" size={14} />}>삭제</Button>
        </div>
      </div>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: 'info',   label: '기본정보', children: InfoTab },
          { key: 'budget', label: '연구비',   children: BudgetTab },
        ]}
      />
    </div>
  );
}

Object.assign(window, { ProjectDetail });
