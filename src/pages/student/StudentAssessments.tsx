import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AssessmentItem {
  assignment_id: string;
  assessment_id: string;
  title: string;
  duration_minutes: number;
  passing_score: number;
  status: string;
  questions: { id: string; text: string; options: { id: string; text: string }[] }[];
}

export default function StudentAssessments({ session }: { session: any }) {
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [activeTest, setActiveTest] = useState<AssessmentItem | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; total: number } | null>(null);

  useEffect(() => { fetchAssessments(); }, []);

  async function fetchAssessments() {
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, assessment_id, status, assessments(id, title, duration_minutes, passing_score)')
      .eq('user_id', session.user.id);

    const list: AssessmentItem[] = [];
    for (const a of (assignments || [])) {
      const assessment = a.assessments as any;
      if (!assessment) continue;
      // Fetch questions
      const { data: qs } = await supabase.from('questions').select('id, text').eq('assessment_id', assessment.id).order('order_index');
      const questionsWithOpts = [];
      for (const q of (qs || [])) {
        const { data: opts } = await supabase.from('question_options').select('id, text').eq('question_id', q.id);
        questionsWithOpts.push({ ...q, options: opts || [] });
      }
      list.push({
        assignment_id: a.id,
        assessment_id: assessment.id,
        title: assessment.title,
        duration_minutes: assessment.duration_minutes,
        passing_score: assessment.passing_score,
        status: a.status,
        questions: questionsWithOpts,
      });
    }
    setItems(list);
  }

  async function startTest(item: AssessmentItem) {
    setActiveTest(item);
    setAnswers({});
    setResult(null);
    // Update assignment status
    await supabase.from('assignments').update({ status: 'in_progress' }).eq('id', item.assignment_id);
  }

  async function submitTest() {
    if (!activeTest) return;
    setSubmitting(true);

    // Create attempt
    const { data: attempt, error: attemptError } = await supabase.from('assessment_attempts').insert({
      user_id: session.user.id,
      assessment_id: activeTest.assessment_id,
      assignment_id: activeTest.assignment_id,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    }).select().single();

    if (attemptError || !attempt) { setSubmitting(false); return; }

    // Check answers and save
    let correctCount = 0;
    let totalPoints = 0;
    for (const q of activeTest.questions) {
      const selectedOptionId = answers[q.id];
      if (!selectedOptionId) continue;

      // Check if correct
      const { data: optionData } = await supabase.from('question_options').select('is_correct').eq('id', selectedOptionId).single();
      const isCorrect = optionData?.is_correct || false;
      if (isCorrect) correctCount++;
      totalPoints++;
      
      await supabase.from('attempt_answers').insert({
        attempt_id: attempt.id,
        question_id: q.id,
        option_id: selectedOptionId,
        is_correct: isCorrect,
        points_awarded: isCorrect ? 1 : 0,
      });
    }

    const score = totalPoints > 0 ? Math.round((correctCount / totalPoints) * 100) : 0;
    const passed = score >= activeTest.passing_score;

    // Update attempt with score
    await supabase.from('assessment_attempts').update({ score, passed }).eq('id', attempt.id);

    // Update assignment status to completed
    await supabase.from('assignments').update({ status: 'completed' }).eq('id', activeTest.assignment_id);

    setResult({ score, passed, total: totalPoints });
    setSubmitting(false);
    fetchAssessments();
  }

  // Taking a test
  if (activeTest && !result) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{activeTest.title}</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              {activeTest.questions.length} QUESTIONS · PASS: {activeTest.passing_score}%
            </p>
          </div>
          <button onClick={() => { setActiveTest(null); setResult(null); }} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700, padding: '6px 14px', cursor: 'pointer',
            background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)',
          }}>CANCEL</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeTest.questions.map((q, qi) => (
            <div key={q.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', marginRight: 8 }}>Q{qi + 1}.</span>
                {q.text}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {q.options.map(o => (
                  <label key={o.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer',
                    background: answers[q.id] === o.id ? 'rgba(157,155,242,0.1)' : 'var(--bg-secondary)',
                    border: `1px solid ${answers[q.id] === o.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    transition: 'all 0.15s',
                  }}>
                    <input type="radio" name={`q-${q.id}`} value={o.id}
                      checked={answers[q.id] === o.id}
                      onChange={() => setAnswers({ ...answers, [q.id]: o.id })}
                      style={{ accentColor: 'var(--accent-primary)' }}
                    />
                    <span style={{ fontSize: '0.8rem' }}>{o.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={submitTest} disabled={submitting} style={{
          width: '100%', padding: '14px 0', marginTop: 24,
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
          background: 'var(--accent-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer',
          opacity: submitting ? 0.6 : 1,
        }}>
          {submitting ? 'SUBMITTING...' : 'SUBMIT_ASSESSMENT'}
        </button>
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          border: `4px solid ${result.passed ? 'var(--accent-secondary)' : 'var(--accent-danger)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          boxShadow: `0 0 30px ${result.passed ? 'rgba(45,212,191,0.3)' : 'rgba(248,113,113,0.3)'}`,
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{result.score}%</div>
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, padding: '6px 16px', marginBottom: 16,
          color: result.passed ? 'var(--accent-secondary)' : 'var(--accent-danger)',
          border: `1px solid ${result.passed ? 'rgba(45,212,191,0.3)' : 'rgba(248,113,113,0.3)'}`,
          letterSpacing: '0.1em',
        }}>
          {result.passed ? 'ASSESSMENT_PASSED' : 'ASSESSMENT_FAILED'}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
          Score: {result.score}% · Passing threshold: {activeTest?.passing_score}%
        </p>
        <button onClick={() => { setActiveTest(null); setResult(null); }} style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, padding: '8px 20px', cursor: 'pointer',
          background: 'var(--accent-primary)', color: 'var(--bg-primary)', border: 'none', letterSpacing: '0.05em',
        }}>RETURN_TO_DASHBOARD</button>
      </div>
    );
  }

  // Assessment list
  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>MY ASSESSMENTS</h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 24 }}>
        {items.length} ASSIGNED
      </p>

      {items.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>NO_ASSESSMENTS_ASSIGNED</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wait for your instructor to assign assessments to you.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <div key={item.assignment_id} style={{
              background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1rem 1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)' }}>
                  {item.questions.length} Qs · {item.duration_minutes}MIN · PASS: {item.passing_score}%
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700, padding: '2px 8px',
                  border: `1px solid ${item.status === 'completed' ? 'rgba(45,212,191,0.3)' : item.status === 'in_progress' ? 'rgba(157,155,242,0.3)' : 'rgba(251,191,36,0.3)'}`,
                  color: item.status === 'completed' ? 'var(--accent-secondary)' : item.status === 'in_progress' ? 'var(--accent-primary)' : 'var(--accent-warning)',
                  textTransform: 'uppercase',
                }}>{item.status}</span>
                {item.status !== 'completed' && item.questions.length > 0 && (
                  <button onClick={() => startTest(item)} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700, padding: '6px 14px', cursor: 'pointer',
                    background: 'var(--accent-primary)', color: 'var(--bg-primary)', border: 'none', letterSpacing: '0.05em',
                  }}>
                    {item.status === 'in_progress' ? 'RESUME' : 'START'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
