/* LoginCard — centered auth card (matches LoginPage.jsx). */
const { useState: useStateLogin } = React;

function LoginCard({ onLogin, onGoRegister }) {
  const T = window.RT;
  const [email, setEmail] = useStateLogin('researcher@retrack.dev');
  const [password, setPassword] = useStateLogin('password');
  const [loading, setLoading] = useStateLogin(false);
  const [emailErr, setEmailErr] = useStateLogin(null);
  const [pwErr, setPwErr] = useStateLogin(null);

  const submit = (e) => {
    e && e.preventDefault();
    let ok = true;
    if (!email) { setEmailErr('이메일을 입력하세요.'); ok = false; } else setEmailErr(null);
    if (!password) { setPwErr('비밀번호를 입력하세요.'); ok = false; } else setPwErr(null);
    if (!ok) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin && onLogin({ email }); }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: T.bgPage, fontFamily: 'inherit',
    }}>
      <div style={{
        width: 'min(400px, 100% - 32px)',
        background: '#fff', borderRadius: T.radius,
        boxShadow: T.shadowCard, padding: 24,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="../../assets/logo-mark.svg" width="48" height="48" alt="Retrack" style={{ display: 'block', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 24, fontWeight: 600, color: T.fg, lineHeight: 1.33 }}>Retrack</div>
          <div style={{ color: T.fgSecondary, fontSize: 14, marginTop: 4 }}>연구과제 관리 시스템</div>
        </div>
        <form onSubmit={submit}>
          <FormItem label="이메일" required error={emailErr}>
            <Input value={email} onChange={setEmail} placeholder="이메일을 입력하세요" />
          </FormItem>
          <FormItem label="비밀번호" required error={pwErr}>
            <Input type="password" value={password} onChange={setPassword} placeholder="비밀번호를 입력하세요" />
          </FormItem>
          <Button type="primary" htmlType="submit" loading={loading} block onClick={submit}>로그인</Button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          <span style={{ color: T.fgSecondary }}>계정이 없으신가요? </span>
          <a onClick={onGoRegister} style={{ color: T.brand, cursor: 'pointer' }}>회원가입</a>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginCard });
