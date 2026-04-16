import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Terminal, Lock, User } from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'student' | 'instructor' | 'admin'>('student');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || 'System User',
              role: activeTab,
            }
          }
        });
        if (error) throw error;
        setSuccess('REGISTRATION_COMPLETE. You may now initialize a session.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  /* colours per role for the tab boxes */
  const tabColors: Record<string, { active: string; border: string; glow: string }> = {
    student:    { active: '#9d9bf2', border: '#9d9bf2', glow: 'rgba(157,155,242,0.25)' },
    instructor: { active: '#2dd4bf', border: '#2dd4bf', glow: 'rgba(45,212,191,0.25)' },
    admin:      { active: '#f87171', border: '#f87171', glow: 'rgba(248,113,113,0.25)' },
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

      {/* ──── LEFT BRANDING ──── */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '3rem 3rem 3rem 6rem',
        borderRight: '1px solid var(--border-color)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent-primary)', textTransform: 'uppercase' as const, fontSize: '0.85rem' }}>
          <Terminal size={22} />
          SKILL_CORE_OS
        </div>

        {/* Hero text */}
        <div style={{ maxWidth: 520, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -20, background: 'var(--accent-primary)', opacity: 0.04, filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' as const }} />
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 0.95, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 12 }}>
            DECODE_<br/>POTENTIAL
          </h1>
          <div style={{ width: 80, height: 3, background: '#fff', marginBottom: 28 }} />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.2em', lineHeight: 2, textTransform: 'uppercase' as const }}>
            SYSTEMIC TALENT ASSESSMENT &amp;<br/>
            OPERATIONAL INTELLIGENCE PROTOCOL V4.0.2
          </p>
        </div>

        {/* Status footer */}
        <div style={{ display: 'flex', gap: 48, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
          <div>
            <div style={{ marginBottom: 4 }}>SYSTEM_STATUS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-secondary)', fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-secondary)', boxShadow: '0 0 8px var(--accent-secondary)' }} />
              OPERATIONAL
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 4 }}>UPTIME</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>99.998%</div>
          </div>
        </div>
      </div>

      {/* ──── RIGHT LOGIN ──── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
        background: 'rgba(18,18,22,0.3)',
      }}>
        {/* decorative coords */}
        <div style={{ position: 'absolute', top: 24, right: 24, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', opacity: 0.4, whiteSpace: 'nowrap' as const }}>
          LAT: 37.7749 N<br/>LON: 122.4194 W
        </div>
        <div style={{ position: 'absolute', top: 24, left: 24, fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', opacity: 0.4, whiteSpace: 'nowrap' as const }}>
          NODE: US-WEST-01<br/>ENC: TLS_1.3_AES_256
        </div>

        {/* ─── LOGIN CARD ─── */}
        <div style={{
          width: '100%', maxWidth: 380,
          background: 'var(--card-bg)', backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-color)', padding: '2rem',
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>ACCESS PORTAL</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {isSignUp ? 'Register new operator credentials.' : 'Verify credentials to initialize terminal.'}
              </p>
            </div>
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700,
                color: isSignUp ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                background: isSignUp ? 'rgba(45,212,191,0.1)' : 'rgba(157,155,242,0.1)',
                border: `1px solid ${isSignUp ? 'rgba(45,212,191,0.3)' : 'rgba(157,155,242,0.3)'}`,
                padding: '4px 10px', cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {isSignUp ? '← LOGIN' : 'SIGNUP →'}
            </button>
          </div>

          {/* Role tabs – coloured boxes */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {(['student', 'instructor', 'admin'] as const).map(role => {
              const isActive = activeTab === role;
              const c = tabColors[role];
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setActiveTab(role); setError(''); setSuccess(''); }}
                  style={{
                    flex: 1, padding: '10px 0',
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em', cursor: 'pointer',
                    border: `1px solid ${isActive ? c.border : 'var(--border-color)'}`,
                    background: isActive ? `${c.active}15` : 'var(--bg-secondary)',
                    color: isActive ? c.active : 'var(--text-muted)',
                    boxShadow: isActive ? `inset 0 0 12px ${c.glow}, 0 0 8px ${c.glow}` : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {role.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleAuth}>
            {isSignUp && (
              <div style={{ marginBottom: 20 }}>
                <label className="input-label">FULL NAME</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="os-input"
                    placeholder="JANE DOE"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{ paddingRight: 36 }}
                  />
                  <Terminal size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label className="input-label">EMAIL</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="os-input"
                  placeholder={`operator@${activeTab}.sys`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingRight: 36 }}
                />
                <User size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="input-label" style={{ margin: 0 }}>ACCESS_KEY</label>
                {!isSignUp && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', cursor: 'pointer' }}>RESET_KEY</span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="os-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 36 }}
                />
                <Lock size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {!isSignUp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <input type="checkbox" id="persistent" />
                <label htmlFor="persistent" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Keep session persistent</label>
              </div>
            )}

            {error && (
              <div style={{ marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '10px 14px', color: 'var(--accent-danger)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', wordBreak: 'break-word' as const }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '10px 14px', color: 'var(--accent-secondary)', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.25)', wordBreak: 'break-word' as const }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 0', marginBottom: 24,
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase' as const, cursor: loading ? 'wait' : 'pointer',
                background: 'var(--accent-primary)', color: 'var(--bg-primary)',
                border: '1px solid var(--accent-primary)', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'PROCESSING...' : (isSignUp ? 'REGISTER_OPERATOR' : 'INITIALIZE_SESSION')}
            </button>

            {/* Divider */}
            <div style={{ position: 'relative', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border-color)' }} />
              <span style={{ position: 'relative', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, background: 'var(--card-bg)', padding: '0 12px', letterSpacing: '0.1em' }}>
                EXTERNAL_AUTH
              </span>
            </div>

            {/* Social */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button type="button" className="os-btn" style={{ fontSize: '0.6rem', padding: '8px 0', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.21 3.31v2.77h3.57a10.78 10.78 0 003.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09a6.97 6.97 0 010-4.18V7.07H2.18A11 11 0 001 12c0 1.78.43 3.45 1.18 4.93l3.85-2.84z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.82 10.82 0 0012 1 11 11 0 002.18 7.07l3.66 2.84A6.55 6.55 0 0112 5.38z"/></svg>
                GOOGLE
              </button>
              <button type="button" className="os-btn" style={{ fontSize: '0.6rem', padding: '8px 0', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2" fill="none"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
                GITHUB
              </button>
            </div>
          </form>
        </div>

        {/* bottom notice */}
        <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-muted)', opacity: 0.4, letterSpacing: '0.18em', lineHeight: 1.8 }}>
          AUTHORIZED ACCESS ONLY. ALL CONNECTIONS ARE LOGGED AND MONITORED.<br/>
          © 2024 PRECISION_INSTRUMENT_SYSTEMS
        </div>
      </div>
    </div>
  );
}
