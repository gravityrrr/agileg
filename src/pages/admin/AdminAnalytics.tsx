import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminAnalytics({ session: _session }: { session: any }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: assessments } = await supabase.from('assessments').select('id, title, passing_score, courses(title)');
    const stats = [];
    for (const a of (assessments || [])) {
      const { data: attempts } = await supabase.from('assessment_attempts').select('*').eq('assessment_id', a.id).eq('status', 'completed');
      const { data: assignments } = await supabase.from('assignments').select('user_id').eq('assessment_id', a.id);
      const completed = attempts || [];
      const scores = completed.map(t => t.score || 0);
      const avg = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
      const passed = completed.filter(t => t.passed).length;
      stats.push({
        id: a.id, title: a.title, course: (a.courses as any)?.title || '—',
        assigned: assignments?.length || 0,
        completed: completed.length,
        avgScore: avg,
        passRate: completed.length > 0 ? Math.round((passed / completed.length) * 100) : 0,
      });
    }
    setData(stats);
    setLoading(false);
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>LOADING...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>PLATFORM ANALYTICS</h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 24 }}>
        GLOBAL PERFORMANCE OVERVIEW
      </p>

      {data.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>NO_DATA</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Analytics will populate when assessments are deployed and completed.</div>
        </div>
      ) : (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['ASSESSMENT', 'COURSE', 'ASSIGNED', 'COMPLETED', 'AVG SCORE', 'PASS RATE'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(a => (
                <tr key={a.id}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.title}</td>
                  <td style={{ padding: '10px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.course}</td>
                  <td style={{ padding: '10px 16px', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.assigned}</td>
                  <td style={{ padding: '10px 16px', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.completed}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.8rem', color: a.avgScore >= 70 ? 'var(--accent-secondary)' : a.avgScore > 0 ? 'var(--accent-danger)' : 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.avgScore > 0 ? `${a.avgScore}%` : '—'}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.8rem', color: a.passRate >= 70 ? 'var(--accent-secondary)' : a.passRate > 0 ? 'var(--accent-danger)' : 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.passRate > 0 ? `${a.passRate}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
