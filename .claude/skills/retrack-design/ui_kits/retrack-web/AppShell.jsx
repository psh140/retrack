/* AppShell — Header + Sidebar (desktop) / Drawer (mobile) + Content.
   Matches MainLayout.jsx: md+ shows fixed Sider; below md collapses to Drawer. */
const { useState: useStateShell } = React;

function AppShell({ currentPath, onNavigate, userRole, userName, onLogout, children }) {
  const T = window.RT;
  const bp = useBreakpoint();
  const isMobile = !bp.md;
  const [drawerOpen, setDrawerOpen] = useStateShell(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: T.bgPage, fontFamily: 'inherit', color: T.fg }}>
      {/* Desktop sidebar — only on md+ */}
      {!isMobile && (
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} userRole={userRole} />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          userRole={userRole}
          userName={userName}
          onLogout={onLogout}
          isMobile={isMobile}
          onMenu={() => setDrawerOpen(true)}
        />
        <main style={{
          padding: isMobile ? 16 : 24,
          background: T.bgPage,
          minHeight: `calc(100vh - ${T.headerH}px)`,
          flex: 1,
          minWidth: 0,
        }}>{children}</main>
      </div>

      {/* Mobile drawer sidebar */}
      {isMobile && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Retrack" width={260}>
          <Sidebar
            currentPath={currentPath}
            onNavigate={(p) => { onNavigate(p); setDrawerOpen(false); }}
            userRole={userRole}
          />
        </Drawer>
      )}
    </div>
  );
}

Object.assign(window, { AppShell });
