/* Sidebar — Retrack left nav (matches frontend/src/components/Sidebar.jsx) */
function Sidebar({ currentPath, onNavigate, userRole = 'RESEARCHER' }) {
  const T = window.RT;
  const baseItems = [
    { key: '/dashboard',  icon: 'dashboard', label: '대시보드' },
    { key: '/projects',   icon: 'project',   label: '과제 목록' },
    { key: '/notifications', icon: 'bell',   label: '알림' },
  ];
  const adminItems = [
    { key: '/admin/users', icon: 'user',       label: '사용자 관리' },
    { key: '/admin/stats', icon: 'bar-chart',  label: '통계' },
    { key: '/admin/logs',  icon: 'file-text',  label: '활동 로그' },
  ];
  const isAdmin = userRole === 'ADMIN';

  const item = (it) => {
    const active = currentPath === it.key || (it.key === '/projects' && currentPath.startsWith('/projects'));
    return (
      <div
        key={it.key}
        onClick={() => onNavigate(it.key)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 40, padding: '0 16px', margin: '4px 8px',
          borderRadius: T.radius, cursor: 'pointer',
          background: active ? T.brandBg : 'transparent',
          color: active ? T.brand : T.fg,
          fontWeight: active ? 500 : 400,
          fontSize: 14,
          transition: 'background 200ms, color 200ms',
        }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = T.fillTertiary; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        <Icon name={it.icon} size={16} color={active ? 'brand' : 'fade'} />
        {it.label}
      </div>
    );
  };

  return (
    <aside style={{
      width: T.siderW, background: '#fff',
      borderRight: `1px solid ${T.borderSecondary}`,
      padding: '12px 0', overflowY: 'auto', flexShrink: 0,
    }}>
      {baseItems.map(item)}
      {isAdmin && (
        <>
          <div style={{ padding: '16px 16px 4px', fontSize: 12, color: T.fgTertiary }}>관리자</div>
          {adminItems.map(item)}
        </>
      )}
    </aside>
  );
}

Object.assign(window, { Sidebar });
