import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function StudentHome({ session, onNavigate }: { session: any; onNavigate: (page: string) => void }) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    // Fetch assignments for this student
    const { data: myAssignments } = await supabase
      .from('assignments')
      .select('*, assessments(title, duration_minutes, passing_score)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    setAssignments(myAssignments || []);

    // Fetch completed attempts
    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'completed');

    const completed = attempts || [];
    setCompletedCount(completed.length);
    if (completed.length > 0) {
      setAvgScore(Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length));
    }
  }

  const pending = assignments.filter(a => a.status === 'pending' || a.status === 'in_progress');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <StatCard label="ASSIGNED" value={assignments.length.toString()} color="var(--accent-primary)" />
        <StatCard label="COMPLETED" value={completedCount.toString()} color="var(--accent-secondary)" />
        <StatCard label="AVG SCORE" value={avgScore > 0 ? `${avgScore}%` : '—'} color="var(--accent-warning)" />
      </div>

      {/* Active Assessments */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
          ACTIVE_ASSESSMENTS
        </div>
        {pending.length === 0 ? (
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>NO_ACTIVE_ASSESSMENTS</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You have no pending assessments. Check back later.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pending.map(a => (
              <div key={a.id} style={{
                background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1rem 1.25rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{(a.assessments as any)?.title || 'Unknown'}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)' }}>
                    {(a.assessments as any)?.duration_minutes}MIN · PASS: {(a.assessments as any)?.passing_score}%
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700, padding: '2px 8px',
                    border: `1px solid ${a.status === 'in_progress' ? 'rgba(157,155,242,0.3)' : 'rgba(45,212,191,0.3)'}`,
                    color: a.status === 'in_progress' ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                    textTransform: 'uppercase',
                  }}>{a.status}</span>
                  <button
                    onClick={() => onNavigate('assessments')}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700, padding: '6px 14px', cursor: 'pointer',
                      background: 'var(--accent-primary)', color: 'var(--bg-primary)', border: 'none', letterSpacing: '0.05em',
                    }}
                  >START</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button onClick={() => onNavigate('assessments')} style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderLeft: '3px solid var(--accent-primary)',
          padding: '1.25rem', cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 4 }}>VIEW ALL ASSESSMENTS</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Browse and take assigned tests</div>
        </button>
        <button onClick={() => onNavigate('analytics')} style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderLeft: '3px solid var(--accent-secondary)',
          padding: '1.25rem', cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 4 }}>VIEW ANALYTICS</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Track your scores and progress</div>
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderBottom: `2px solid ${color}`, padding: '1.25rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
    </div>
  );
}
