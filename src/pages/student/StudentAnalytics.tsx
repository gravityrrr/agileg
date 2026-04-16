import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function StudentAnalytics({ session }: { session: any }) {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase
      .from('assessment_attempts')
      .select('*, assessments(title, passing_score)')
      .eq('user_id', session.user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });
    setAttempts(data || []);
    setLoading(false);
  }

  const scores = attempts.map(a => a.score || 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
  const passCount = attempts.filter(a => a.passed).length;
  const passRate = attempts.length > 0 ? Math.round((passCount / attempts.length) * 100) : 0;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
        LOADING_ANALYTICS...
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>MY PERFORMANCE</h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 24 }}>
        HISTORICAL SCORE ANALYSIS
      </p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderBottom: '2px solid var(--accent-primary)', padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--accent-primary)', marginBottom: 8, letterSpacing: '0.1em' }}>TESTS TAKEN</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{attempts.length}</div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderBottom: '2px solid var(--accent-secondary)', padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--accent-secondary)', marginBottom: 8, letterSpacing: '0.1em' }}>AVG SCORE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{avgScore > 0 ? `${avgScore}%` : '—'}</div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderBottom: `2px solid ${passRate >= 70 ? 'var(--accent-secondary)' : 'var(--accent-danger)'}`, padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: passRate >= 70 ? 'var(--accent-secondary)' : 'var(--accent-danger)', marginBottom: 8, letterSpacing: '0.1em' }}>PASS RATE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{passRate > 0 ? `${passRate}%` : '—'}</div>
        </div>
      </div>

      {/* History */}
      {attempts.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>NO_HISTORY</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Complete assessments to see your performance data.</div>
        </div>
      ) : (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['ASSESSMENT', 'SCORE', 'STATUS', 'DATE'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attempts.map((a, i) => (
                <tr key={i}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {(a.assessments as any)?.title || 'Unknown'}
                  </td>
                  <td style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: (a.score || 0) >= 70 ? 'var(--accent-secondary)' : 'var(--accent-danger)' }}>
                    {a.score ?? 0}%
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700, padding: '2px 8px',
                      border: `1px solid ${a.passed ? 'rgba(45,212,191,0.3)' : 'rgba(248,113,113,0.3)'}`,
                      color: a.passed ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                      textTransform: 'uppercase',
                    }}>{a.passed ? 'PASSED' : 'FAILED'}</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {a.completed_at ? new Date(a.completed_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
