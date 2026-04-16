import { Terminal, LayoutDashboard, FileText, Users, BarChart2, Archive, LogOut, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, userRole, userName, activePage, onNavigate }: LayoutProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'assessments', label: 'ASSESSMENTS', icon: FileText },
    ...(userRole === 'instructor' ? [{ id: 'courses', label: 'COURSES', icon: BookOpen }] : []),
    ...(userRole === 'admin' ? [{ id: 'roles', label: 'ROLES', icon: Users }] : []),
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart2 },
    { id: 'archive', label: 'ARCHIVE', icon: Archive },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={{
        width: 240, flexShrink: 0,
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', padding: '1.25rem 0',
      }}>
        {/* User info */}
        <div style={{ padding: '0 1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 36, height: 36,
              background: 'rgba(157,155,242,0.15)', border: '1px solid var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)',
            }}>
              <Terminal size={16} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {userName || 'OPERATOR'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                LEVEL_{userRole.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '10px 1.25rem', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 500,
                  textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '0 1.25rem', marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 0', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 500,
              color: 'var(--text-muted)', background: 'transparent',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              transition: 'color 0.15s', marginTop: 12,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={14} />
            LOGOUT_SESSION
          </button>
        </div>
      </div>

      {/* MAIN area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          height: 56, borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem', flexShrink: 0,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
            SKILL_CORE_OS
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700, padding: '4px 12px',
            border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            SYSTEM_ACTIVE
          </div>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
