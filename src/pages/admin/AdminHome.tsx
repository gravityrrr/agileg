import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, BookOpen, FileText, BarChart2 } from 'lucide-react';

export default function AdminHome({ session: _session, onNavigate }: { session: any; onNavigate: (page: string) => void }) {
  const [stats, setStats] = useState({ users: 0, instructors: 0, students: 0, courses: 0, assessments: 0 });

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    const { data: profiles } = await supabase.from('profiles').select('role');
    const { data: courses } = await supabase.from('courses').select('id');
    const { data: assessments } = await supabase.from('assessments').select('id');

    const p = profiles || [];
    setStats({
      users: p.length,
      instructors: p.filter(u => u.role === 'instructor').length,
      students: p.filter(u => u.role === 'student').length,
      courses: courses?.length || 0,
      assessments: assessments?.length || 0,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>COMMAND CENTER</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>PLATFORM OVERVIEW & MANAGEMENT</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="TOTAL USERS" value={stats.users} icon={<Users size={16} />} color="var(--accent-primary)" />
        <StatCard label="INSTRUCTORS" value={stats.instructors} icon={<Users size={16} />} color="var(--accent-secondary)" />
        <StatCard label="STUDENTS" value={stats.students} icon={<Users size={16} />} color="var(--accent-warning)" />
        <StatCard label="COURSES" value={stats.courses} icon={<BookOpen size={16} />} color="var(--accent-danger)" />
      </div>

      {/* Quick actions */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>COMMAND_MODULES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <ActionCard title="DIRECTORY" desc="Manage users, roles, and access" color="var(--accent-primary)" icon={<Users size={20} />} onClick={() => onNavigate('roles')} />
          <ActionCard title="ANALYTICS" desc="Platform-wide performance data" color="var(--accent-secondary)" icon={<BarChart2 size={20} />} onClick={() => onNavigate('analytics')} />
          <ActionCard title="ASSESSMENTS" desc="View all deployed assessments" color="var(--accent-warning)" icon={<FileText size={20} />} onClick={() => onNavigate('assessments')} />
        </div>
      </div>

      {/* Empty state for activity log */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>PLATFORM_ACTIVITY</div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
            {stats.users > 0 ? `${stats.users} USERS REGISTERED · ${stats.assessments} ASSESSMENTS DEPLOYED` : 'NO_ACTIVITY_YET'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {stats.users > 0 ? 'System operational. All nodes active.' : 'Platform activity will appear here as users interact with the system.'}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderTop: `2px solid ${color}`, padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function ActionCard({ title, desc, color, icon, onClick }: { title: string; desc: string; color: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.5rem',
      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', borderLeft: `3px solid ${color}`,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 15px ${color}25`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.borderLeftColor = color; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ color, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4, color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
    </button>
  );
}
