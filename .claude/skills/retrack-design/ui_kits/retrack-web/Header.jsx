/* Header — Retrack top bar. On mobile hides user name and shows hamburger. */
function Header({ userRole = 'RESEARCHER', userName = '김연구', onLogout, onMenu, isMobile }) {
  const T = window.RT;
  const role = T.roleColor[userRole] || T.roleColor.VIEWER;
  return (
    <header style={{
      height: T.headerH, background: '#fff',
      borderBottom: `1px solid ${T.borderSecondary}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isMobile ? '0 12px' : '0 24px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12, minWidth: 0 }}>
        {isMobile && <Button type="text" icon={<Icon name="menu" size={18} />} onClick={onMenu} />}
        <img src="../../assets/logo-mark.svg" width={isMobile ? 24 : 26} height={isMobile ? 24 : 26} alt="" style={{ display: 'block', flexShrink: 0 }} />
        <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, color: T.fg }}>Retrack</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12 }}>
        {!isMobile && <span style={{ color: T.fgSecondary, fontSize: 14 }}>{userName}</span>}
        <Tag color={role}>{userRole}</Tag>
        {isMobile
          ? <Button type="text" icon={<Icon name="logout" size={16} />} onClick={onLogout} />
          : <Button type="text" icon={<Icon name="logout" />} onClick={onLogout}>로그아웃</Button>}
      </div>
    </header>
  );
}

Object.assign(window, { Header });
