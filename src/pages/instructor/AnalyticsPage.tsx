import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AnalyticsPage({ session }: { session: any }) {
  const [assessmentStats, setAssessmentStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  async function fetchAnalytics() {
    setLoading(true);
    // Get instructor's courses
    const { data: courses } = await supabase.from('courses').select('id, title').eq('instructor_id', session.user.id);
    const courseIds = courses?.map(c => c.id) || [];
    if (courseIds.length === 0) { setLoading(false); return; }

    // Get assessments for those courses
    const { data: assessments } = await supabase.from('assessments').select('id, title, passing_score, course_id').in('course_id', courseIds);
    if (!assessments || assessments.length === 0) { setLoading(false); return; }

    const stats = [];
    for (const a of assessments) {
      const courseName = courses?.find(c => c.id === a.course_id)?.title || 'Unknown';
      const { data: attempts } = await supabase.from('assessment_attempts').select('*').eq('assessment_id', a.id);
      const { data: assignments } = await supabase.from('assignments').select('user_id').eq('assessment_id', a.id);
      const completed = (attempts || []).filter(t => t.status === 'completed');
      const scores = completed.map(t => t.score || 0);
      const avg = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
      const passed = completed.filter(t => t.passed).length;
      const passRate = completed.length > 0 ? Math.round((passed / completed.length) * 100) : 0;

      // Find hardest questions
      const { data: questions } = await supabase.from('questions').select('id, text').eq('assessment_id', a.id);
      const difficultQs: { text: string; wrongRate: number }[] = [];
      for (const q of (questions || [])) {
        const { data: answers } = await supabase.from('attempt_answers').select('is_correct').eq('question_id', q.id);
        if (answers && answers.length > 0) {
          const wrongCount = answers.filter(x => !x.is_correct).length;
          difficultQs.push({ text: q.text, wrongRate: Math.round((wrongCount / answers.length) * 100) });
        }
      }
      difficultQs.sort((a, b) => b.wrongRate - a.wrongRate);

      stats.push({
        id: a.id, title: a.title, courseName,
        totalAssigned: assignments?.length || 0,
        totalAttempts: (attempts || []).length,
        completed: completed.length,
        avgScore: avg,
        passRate,
        topDifficult: difficultQs.slice(0, 3),
      });
    }
    setAssessmentStats(stats);
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
        LOADING_ANALYTICS_DATA...
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>ANALYTICS</h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 24 }}>
        PERFORMANCE INSTRUMENTATION & WEAK AREA DETECTION
      </p>

      {assessmentStats.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>NO_ANALYTICS_DATA</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Analytics will appear here once students complete assessments.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {assessmentStats.map(a => (
            <div key={a.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{a.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)' }}>COURSE: {a.courseName}</div>
                </div>
              </div>
              
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <MiniStat label="ASSIGNED" value={a.totalAssigned} />
                <MiniStat label="ATTEMPTS" value={a.totalAttempts} />
                <MiniStat label="AVG SCORE" value={a.avgScore > 0 ? `${a.avgScore}%` : '—'} color="var(--accent-primary)" />
                <MiniStat label="PASS RATE" value={a.passRate > 0 ? `${a.passRate}%` : '—'} color={a.passRate >= 70 ? 'var(--accent-secondary)' : 'var(--accent-danger)'} />
              </div>

              {/* Difficult questions */}
              {a.topDifficult.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
                    MOST_DIFFICULT_QUESTIONS
                  </div>
                  {a.topDifficult.map((q: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{q.text}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-danger)', fontWeight: 700 }}>{q.wrongRate}% WRONG</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '0.75rem', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}
