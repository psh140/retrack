/* Primitives — minimal AntD-look-alikes for the Retrack UI kit. */
const { useState } = React;
const T = window.RT;

// ============ Button ============
function Button({ type = 'default', size = 'middle', danger, block, loading, icon, children, onClick, htmlType, disabled, style }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const h = size === 'large' ? 40 : size === 'small' ? 24 : 32;
  const padX = size === 'large' ? 15 : size === 'small' ? 7 : 15;

  let bg = '#fff', fg = T.fg, border = T.border, shadow = '0 2px 0 rgba(0,0,0,0.02)';
  if (type === 'primary') {
    bg = danger ? '#ff4d4f' : T.brand;
    fg = '#fff'; border = 'transparent';
    if (hover) bg = danger ? '#ff7875' : T.brandHover;
    if (active) bg = danger ? '#d9363e' : T.brandActive;
  } else if (type === 'text') {
    bg = 'transparent'; border = 'transparent'; shadow = 'none';
    if (hover) bg = T.fillSecondary;
    if (active) bg = 'rgba(0,0,0,0.15)';
  } else if (type === 'link') {
    bg = 'transparent'; border = 'transparent'; fg = T.brand; shadow = 'none';
    if (hover) fg = T.brandHover;
  } else {
    if (danger) { fg = '#ff4d4f'; border = '#ff4d4f'; if (hover) { fg = '#ff7875'; border = '#ff7875'; } }
    else if (hover) { fg = T.brandHover; border = T.brandHover; }
  }
  if (disabled) {
    bg = T.fillTertiary; fg = T.fgQuaternary; border = T.border; shadow = 'none';
  }
  return (
    <button
      type={htmlType || 'button'}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)} onMouseUp={() => setActive(false)}
      style={{
        height: h, padding: `0 ${padX}px`, fontSize: 14, lineHeight: 1.5715,
        background: bg, color: fg, border: `1px solid ${border}`, borderRadius: T.radius,
        display: block ? 'flex' : 'inline-flex', width: block ? '100%' : undefined,
        alignItems: 'center', justifyContent: 'center', gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', boxShadow: shadow,
        transition: 'all 200ms cubic-bezier(0.645,0.045,0.355,1)',
        ...(style || {}),
      }}
    >
      {loading && <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'rt-spin 1s linear infinite' }} />}
      {icon}
      {children}
    </button>
  );
}

// ============ Input ============
function Input({ value, onChange, placeholder, type = 'text', disabled, prefix, suffix, status, style }) {
  const [focus, setFocus] = useState(false);
  const [hover, setHover] = useState(false);
  const isError = status === 'error';
  let border = T.border;
  if (isError) border = '#ff4d4f';
  else if (focus) border = T.brand;
  else if (hover) border = T.brandHover;
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 11px', height: 32,
        border: `1px solid ${border}`, borderRadius: T.radius,
        background: disabled ? T.fillTertiary : '#fff',
        boxShadow: focus ? `0 0 0 2px ${isError ? 'rgba(255,77,79,0.1)' : 'rgba(5,145,255,0.1)'}` : 'none',
        transition: 'all 200ms', ...style,
      }}
    >
      {prefix && <span style={{ color: T.fgTertiary, display: 'flex' }}>{prefix}</span>}
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          border: 'none', outline: 'none', flex: 1, background: 'transparent',
          font: 'inherit', color: disabled ? T.fgQuaternary : T.fg,
          minWidth: 0,
        }}
      />
      {suffix && <span style={{ color: T.fgTertiary, display: 'flex' }}>{suffix}</span>}
    </div>
  );
}

// ============ FormItem ============
function FormItem({ label, required, error, optional, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {label && (
        <div style={{ marginBottom: 8, fontSize: 14, color: T.fg, lineHeight: '22px' }}>
          {required && <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>}
          {label}
          {optional && <span style={{ color: T.fgTertiary, marginLeft: 4 }}>(선택)</span>}
        </div>
      )}
      {children}
      {error && <div style={{ marginTop: 4, fontSize: 14, color: '#ff4d4f', lineHeight: '22px' }}>{error}</div>}
    </div>
  );
}

// ============ Card ============
function Card({ title, extra, children, bordered = true, style, bodyStyle }) {
  return (
    <div style={{
      background: '#fff', borderRadius: T.radius,
      border: bordered ? `1px solid ${T.borderSecondary}` : 'none',
      boxShadow: T.shadowTertiary, ...style,
    }}>
      {title && (
        <div style={{
          padding: '12px 24px', borderBottom: `1px solid ${T.borderSecondary}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          minHeight: 56,
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.fg }}>{title}</div>
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div style={{ padding: 24, ...bodyStyle }}>{children}</div>
    </div>
  );
}

// ============ Tag ============
function Tag({ color, children, style }) {
  // color can be 'red'/'blue'/etc (preset) or hex
  const presets = {
    red:    { bg: '#fff1f0', border: '#ffa39e', fg: '#cf1322' },
    orange: { bg: '#fff7e6', border: '#ffd591', fg: '#d46b08' },
    gold:   { bg: '#fffbe6', border: '#ffe58f', fg: '#d48806' },
    yellow: { bg: '#feffe6', border: '#fffb8f', fg: '#d4b106' },
    green:  { bg: '#f6ffed', border: '#b7eb8f', fg: '#389e0d' },
    cyan:   { bg: '#e6fffb', border: '#87e8de', fg: '#08979c' },
    blue:   { bg: '#e6f4ff', border: '#91caff', fg: '#0958d9' },
    geekblue:{bg: '#f0f5ff', border: '#adc6ff', fg: '#1d39c4' },
    purple: { bg: '#f9f0ff', border: '#d3adf7', fg: '#531dab' },
    magenta:{ bg: '#fff0f6', border: '#ffadd2', fg: '#c41d7f' },
    default:{ bg: '#fafafa', border: '#d9d9d9', fg: 'rgba(0,0,0,0.88)' },
  };
  let style2 = presets[color] || presets.default;
  if (color && color.startsWith && color.startsWith('#')) {
    style2 = { bg: '#fff', border: color, fg: color };
  } else if (typeof color === 'object' && color) {
    style2 = color;
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0 7px', borderRadius: 4,
      background: style2.bg, border: `1px solid ${style2.border}`, color: style2.fg,
      fontSize: 12, lineHeight: '20px', fontFamily: 'inherit',
      ...style,
    }}>{children}</span>
  );
}

// ============ StatusTag ============
function StatusTag({ status, showLabel }) {
  const s = T.statusColor[status];
  if (!s) return <Tag>{status}</Tag>;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0 7px', borderRadius: 4,
      background: s.bg, border: `1px solid ${s.border}`, color: s.fg,
      fontSize: 12, lineHeight: '20px',
      fontFamily: "'SFMono-Regular', Consolas, monospace",
    }}>{showLabel ? `${status} · ${s.label}` : status}</span>
  );
}

// ============ Tabs ============
function Tabs({ items, activeKey, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 32, borderBottom: `1px solid ${T.borderSecondary}` }}>
        {items.map((it) => {
          const active = it.key === activeKey;
          return (
            <div key={it.key} onClick={() => onChange(it.key)} style={{
              padding: '12px 0', cursor: 'pointer',
              color: active ? T.brand : T.fg, fontSize: 14, fontWeight: active ? 500 : 400,
              borderBottom: `2px solid ${active ? T.brand : 'transparent'}`,
              marginBottom: -1, transition: 'color 200ms',
            }}>{it.label}</div>
          );
        })}
      </div>
      <div style={{ paddingTop: 16 }}>
        {items.find((i) => i.key === activeKey)?.children}
      </div>
    </div>
  );
}

// ============ Table ============
function Table({ columns, dataSource, onRowClick, rowKey = 'id' }) {
  return (
    <div style={{ background: '#fff', borderRadius: T.radius, overflowX: 'auto', maxWidth: '100%' }}>
      <div style={{ minWidth: 600 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{
                padding: '12px 16px', textAlign: 'left',
                background: '#fafafa', fontWeight: 500, color: T.fg,
                borderBottom: `1px solid ${T.borderSecondary}`, fontSize: 13,
                width: c.width,
              }}>{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((row) => (
            <tr key={row[rowKey]} onClick={() => onRowClick && onRowClick(row)} style={{
              cursor: onRowClick ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => onRowClick && (e.currentTarget.style.background = '#fafafa')}
            onMouseLeave={(e) => onRowClick && (e.currentTarget.style.background = '#fff')}
            >
              {columns.map((c) => (
                <td key={c.key} style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${T.borderSecondary}`,
                  color: T.fg, verticalAlign: 'middle',
                }}>{c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ============ useBreakpoint ============
// Returns { xs, sm, md, lg, xl, xxl } booleans for the current viewport width.
// Matches Ant Design's breakpoint thresholds.
const RT_BPS = { xs: 480, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1600 };
function useBreakpoint() {
  const get = () => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    return {
      xs: w >= 0,
      sm: w >= RT_BPS.sm,
      md: w >= RT_BPS.md,
      lg: w >= RT_BPS.lg,
      xl: w >= RT_BPS.xl,
      xxl: w >= RT_BPS.xxl,
      width: w,
    };
  };
  const [bp, setBp] = useState(get);
  React.useEffect(() => {
    const onResize = () => setBp(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return bp;
}

// ============ Drawer ============
// Slide-in panel from the left edge. Used as the mobile sidebar replacement.
function Drawer({ open, onClose, width = 280, title, children, placement = 'left' }) {
  const isLeft = placement === 'left';
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 999, opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms cubic-bezier(0.645,0.045,0.355,1)',
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, bottom: 0,
        [isLeft ? 'left' : 'right']: 0,
        width, maxWidth: '85vw', background: '#fff', zIndex: 1000,
        boxShadow: T.shadowSecondary,
        transform: open ? 'translateX(0)' : `translateX(${isLeft ? '-100%' : '100%'})`,
        transition: 'transform 250ms cubic-bezier(0.645,0.045,0.355,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {title && (
          <div style={{
            padding: '16px 24px', borderBottom: `1px solid ${T.borderSecondary}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 16, fontWeight: 600, flexShrink: 0,
          }}>
            <span>{title}</span>
            <span onClick={onClose} style={{ cursor: 'pointer', color: T.fgTertiary, padding: 4, lineHeight: 1 }}>✕</span>
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>
    </>
  );
}

// ============ Modal ============
function Modal({ open, title, onCancel, onOk, okText = '확인', cancelText = '취소', children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 100,
    }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 8, width, boxShadow: T.shadowSecondary,
      }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.borderSecondary}`, fontSize: 16, fontWeight: 600 }}>{title}</div>
        <div style={{ padding: 24 }}>{children}</div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.borderSecondary}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onCancel}>{cancelText}</Button>
          <Button type="primary" onClick={onOk}>{okText}</Button>
        </div>
      </div>
    </div>
  );
}

// ============ Icon ============
function Icon({ name, size = 16, color, style }) {
  const def = (window.RT_ICONS || {})[name];
  if (!def) return null;
  const fill = color === 'brand' ? T.brand
             : color === 'tertiary' ? T.fgTertiary
             : color === 'fade' ? 'rgba(0,0,0,0.65)'
             : color === 'inherit' ? 'currentColor'
             : color || T.fg;
  return (
    <svg viewBox={def.viewBox} width={size} height={size} fill={fill} style={{ display: 'inline-block', flexShrink: 0, verticalAlign: '-0.125em', ...style }}>
      {def.paths.map((attrs, i) => {
        // attrs is the inner attribute string of the original <path ...>; parse out `d="..."`
        const m = attrs.match(/d="([^"]+)"/);
        return m ? <path key={i} d={m[1]} /> : null;
      })}
    </svg>
  );
}

// keyframes once
if (!document.getElementById('__rt_keyframes')) {
  const s = document.createElement('style');
  s.id = '__rt_keyframes';
  s.textContent = `
    @keyframes rt-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { Button, Input, FormItem, Card, Tag, StatusTag, Tabs, Table, Modal, Icon, useBreakpoint, Drawer });
