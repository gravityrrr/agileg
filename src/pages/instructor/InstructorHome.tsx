import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, BarChart2, CheckSquare } from 'lucide-react';

export default function InstructorHome({ session, onNavigate }: { session: any; onNavigate: (page: string) => void }) {
  const [stats, setStats] = useState({ students: 0, avgScore: 0, passRate: 0, assessments: 0 });
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    // Fetch assessments created by this instructor's courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('instructor_id', session.user.id);

    const courseIds = courses?.map(c => c.id) || [];

    if (courseIds.length > 0) {
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id')
        .in('course_id', courseIds);

      const assessmentIds = assessments?.map(a => a.id) || [];

      if (assessmentIds.length > 0) {
        // Get unique students assigned
        const { data: assignments } = await supabase
          .from('assignments')
          .select('user_id')
          .in('assessment_id', assessmentIds);
        const uniqueStudents = new Set(assignments?.map(a => a.user_id) || []);

        // Get completed attempts for analytics
        const { data: attempts } = await supabase
          .from('assessment_attempts')
          .select('*, profiles(full_name, email)')
          .in('assessment_id', assessmentIds)
          .order('started_at', { ascending: false })
          .limit(10);

        const completedAttempts = (attempts || []).filter(a => a.status === 'completed');
        const avgScore = completedAttempts.length > 0
          ? Math.round(completedAttempts.reduce((s, a) => s + (a.score || 0), 0) / completedAttempts.length)
          : 0;
        const passRate = completedAttempts.length > 0
          ? Math.round((completedAttempts.filter(a => a.passed).length / completedAttempts.length) * 100)
          : 0;

        setStats({
          students: uniqueStudents.size,
          avgScore,
          passRate,
          assessments: assessmentIds.length,
        });
        setRecentAttempts(attempts || []);
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <StatCard label="ACTIVE_STUDENTS" value={stats.students.toString()} sub={`${stats.assessments} ASSESSMENTS`} color="var(--accent-secondary)" icon={<Users size={16} />} />
        <StatCard label="AVG_SCORE" value={stats.avgScore > 0 ? `${stats.avgScore}` : '—'} sub="PTS_MEAN" color="var(--accent-primary)" icon={<BarChart2 size={16} />} />
        <StatCard label="PASS_RATE" value={stats.passRate > 0 ? `${stats.passRate}%` : '—'} sub="TH_MET" color="var(--accent-danger)" icon={<CheckSquare size={16} />} />
      </div>

      {/* Quick actions */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>QUICK_ACTIONS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <ActionCard label="NEW COURSE" sub="Create a course module" color="var(--accent-primary)" onClick={() => onNavigate('courses')} />
          <ActionCard label="NEW ASSESSMENT" sub="Author questions & deploy" color="var(--accent-secondary)" onClick={() => onNavigate('assessments')} />
          <ActionCard label="VIEW ANALYTICS" sub="Monitor student progress" color="var(--accent-warning)" onClick={() => onNavigate('analytics')} />
        </div>
      </div>

      {/* Recent attempts */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>RECENT_ACTIVITY</div>
        {recentAttempts.length === 0 ? (
          <EmptyState message="No student activity yet. Create assessments and assign them to students to see data here." />
        ) : (
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['STUDENT', 'STATUS', 'SCORE', 'DATE'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((a, i) => (
                  <tr key={i}>
                    <td style={{ padding: '10px 16px', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{(a.profiles as any)?.full_name || (a.profiles as any)?.email || 'Unknown'}</td>
                    <td style={{ padding: '10px 16px', fontSize: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700, padding: '2px 8px',
                        color: a.status === 'completed' ? 'var(--accent-secondary)' : a.status === 'in_progress' ? 'var(--accent-primary)' : 'var(--text-muted)',
                        border: `1px solid ${a.status === 'completed' ? 'rgba(45,212,191,0.3)' : a.status === 'in_progress' ? 'rgba(157,155,242,0.3)' : 'var(--border-color)'}`,
                        textTransform: 'uppercase',
                      }}>{a.status}</span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '0.8rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.score ?? '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.started_at ? new Date(a.started_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderBottom: `2px solid ${color}`, padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );
}

function ActionCard({ label, sub, color, onClick }: { label: string; sub: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem',
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
        borderLeft: `3px solid ${color}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 15px ${color}25`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.borderLeftColor = color; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sub}</div>
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '3rem 2rem',
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>NO_DATA_AVAILABLE</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>{message}</div>
    </div>
  );
}
