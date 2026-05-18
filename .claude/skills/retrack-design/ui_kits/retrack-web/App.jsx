/* App — top-level click-through router for the Retrack UI kit prototype */
const { useState: useStateApp } = React;

function App() {
  // null path = unauthenticated (show login)
  const [path, setPath] = useStateApp('/login');
  const [projectId, setProjectId] = useStateApp(null);
  const [userRole, setUserRole] = useStateApp('RESEARCHER');
  const [userName, setUserName] = useStateApp('김연구');
  // toggle for showing ADMIN nav
  const [demoAdmin, setDemoAdmin] = useStateApp(false);

  const T = window.RT;

  const handleLogin = () => { setPath('/dashboard'); };
  const handleLogout = () => { setPath('/login'); };
  const openProject = (id) => { setProjectId(id); setPath('/projects/detail'); };

  let content = null;
  if (path === '/dashboard') {
    content = <Dashboard onOpenProject={openProject} />;
  } else if (path === '/projects') {
    content = <ProjectList onOpenProject={openProject} onCreate={() => alert('과제 등록 폼 — 데모')} />;
  } else if (path === '/projects/detail') {
    content = <ProjectDetail projectId={projectId} onBack={() => setPath('/projects')} />;
  } else if (path === '/notifications') {
    content = <NotificationsPlaceholder />;
  } else if (path.startsWith('/admin/')) {
    content = <AdminPlaceholder path={path} />;
  }

  if (path === '/login') {
    return <LoginCard onLogin={handleLogin} onGoRegister={() => alert('회원가입 페이지 — 데모')} />;
  }

  return (
    <>
      <AppShell
        currentPath={path}
        onNavigate={(p) => { setPath(p); setProjectId(null); }}
        userRole={demoAdmin ? 'ADMIN' : userRole}
        userName={userName}
        onLogout={handleLogout}
      >
        {content}
      </AppShell>
      {/* Demo role toggle */}
      <div style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 100,
        background: '#fff', borderRadius: 8, boxShadow: T.shadowSecondary,
        padding: '10px 14px', fontSize: 12, color: T.fgSecondary,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span>데모:</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={demoAdmin} onChange={(e) => setDemoAdmin(e.target.checked)} />
          ADMIN 메뉴 표시
        </label>
      </div>
    </>
  );
}

function NotificationsPlaceholder() {
  const T = window.RT;
  const D = window.RT_DATA;
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>알림</div>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {D.notifications.map((n, i) => (
            <div key={n.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 0',
              borderBottom: i < D.notifications.length - 1 ? `1px solid ${T.borderSecondary}` : 'none',
            }}>
              <Icon name="bell" size={16} color={n.read ? 'tertiary' : 'brand'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: T.fg, fontWeight: n.read ? 400 : 500 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: T.fgTertiary, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{n.at}</div>
              </div>
              {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d4f' }} />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AdminPlaceholder({ path }) {
  const T = window.RT;
  const label = path === '/admin/users' ? '사용자 관리' : path === '/admin/stats' ? '통계' : '활동 로그';
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>{label}</div>
      <Card>
        <div style={{ padding: '60px 0', textAlign: 'center', color: T.fgTertiary }}>
          <div style={{ fontSize: 14 }}>이 화면은 UI 키트의 데모 범위에 포함되지 않습니다.</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>대시보드 / 과제 / 알림 화면을 확인해 주세요.</div>
        </div>
      </Card>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
