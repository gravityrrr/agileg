import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, ChevronDown, ChevronUp, UserPlus, Send } from 'lucide-react';

interface Assessment { id: string; title: string; description: string; duration_minutes: number; passing_score: number; status: string; course_id: string; }
interface Course { id: string; title: string; }
interface Question { id: string; text: string; points: number; order_index: number; options: Option[]; }
interface Option { id?: string; text: string; is_correct: boolean; }
interface Student { id: string; full_name: string; email: string; }

export default function AssessmentsPage({ session }: { session: any }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Create form
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingScore, setPassingScore] = useState(60);
  const [loading, setLoading] = useState(false);

  // Question form
  const [showAddQ, setShowAddQ] = useState(false);
  const [qText, setQText] = useState('');
  const [qPoints, setQPoints] = useState(1);
  const [qOptions, setQOptions] = useState<Option[]>([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ]);

  // Assign modal
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    fetchCourses();
    fetchAssessments();
  }, []);

  async function fetchCourses() {
    const { data } = await supabase.from('courses').select('id, title').eq('instructor_id', session.user.id);
    setCourses(data || []);
    if (data && data.length > 0 && !courseId) setCourseId(data[0].id);
  }

  async function fetchAssessments() {
    const { data: myCourses } = await supabase.from('courses').select('id').eq('instructor_id', session.user.id);
    const ids = myCourses?.map(c => c.id) || [];
    if (ids.length === 0) { setAssessments([]); return; }
    const { data } = await supabase.from('assessments').select('*').in('course_id', ids).order('created_at', { ascending: false });
    setAssessments(data || []);
  }

  async function createAssessment() {
    if (!title.trim() || !courseId) return;
    setLoading(true);
    const { error } = await supabase.from('assessments').insert({
      course_id: courseId, title: title.trim(), description: desc.trim(),
      duration_minutes: duration, passing_score: passingScore, status: 'published',
    });
    if (!error) {
      setTitle(''); setDesc(''); setDuration(60); setPassingScore(60);
      setShowCreate(false); fetchAssessments();
    }
    setLoading(false);
  }

  async function deleteAssessment(id: string) {
    if (!confirm('Delete this assessment?')) return;
    await supabase.from('assessments').delete().eq('id', id);
    fetchAssessments();
  }

  async function toggleExpand(id: string) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setShowAddQ(false);
    const { data: qs } = await supabase.from('questions').select('*').eq('assessment_id', id).order('order_index');
    const questionsWithOptions: Question[] = [];
    for (const q of (qs || [])) {
      const { data: opts } = await supabase.from('question_options').select('*').eq('question_id', q.id);
      questionsWithOptions.push({ ...q, options: opts || [] });
    }
    setQuestions(questionsWithOptions);
  }

  async function addQuestion(assessmentId: string) {
    if (!qText.trim()) return;
    setLoading(true);
    const { data: q, error } = await supabase.from('questions').insert({
      assessment_id: assessmentId, text: qText.trim(), points: qPoints,
      order_index: questions.length,
    }).select().single();
    if (q && !error) {
      const validOpts = qOptions.filter(o => o.text.trim());
      if (validOpts.length > 0) {
        await supabase.from('question_options').insert(
          validOpts.map(o => ({ question_id: q.id, text: o.text.trim(), is_correct: o.is_correct }))
        );
      }
      setQText(''); setQPoints(1);
      setQOptions([{ text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }]);
      setShowAddQ(false);
      toggleExpand(assessmentId);
    }
    setLoading(false);
  }

  async function deleteQuestion(qId: string, assessmentId: string) {
    await supabase.from('questions').delete().eq('id', qId);
    toggleExpand(assessmentId);
  }

  async function openAssign(assessmentId: string) {
    setShowAssign(assessmentId);
    const { data } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'student');
    setAllStudents(data || []);
    // Get already assigned
    const { data: existing } = await supabase.from('assignments').select('user_id').eq('assessment_id', assessmentId);
    setSelectedStudents(existing?.map(e => e.user_id) || []);
  }

  async function assignStudents() {
    if (!showAssign) return;
    setLoading(true);
    // Remove old and re-insert
    await supabase.from('assignments').delete().eq('assessment_id', showAssign);
    if (selectedStudents.length > 0) {
      await supabase.from('assignments').insert(
        selectedStudents.map(uid => ({ assessment_id: showAssign, user_id: uid, status: 'pending' }))
      );
    }
    setShowAssign(null);
    setLoading(false);
  }

  function toggleStudent(id: string) {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>ASSESSMENTS</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            {assessments.length} DEPLOYED
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, padding: '8px 16px', cursor: 'pointer',
          background: 'var(--accent-primary)', color: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', letterSpacing: '0.05em',
        }}>
          <Plus size={14} />
          {showCreate ? 'CANCEL' : 'NEW_ASSESSMENT'}
        </button>
      </div>

      {courses.length === 0 && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '2rem', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-warning)', letterSpacing: '0.1em', marginBottom: 8 }}>⚠ NO_COURSES_FOUND</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You must create a course first before creating assessments.</div>
        </div>
      )}

      {/* Create form */}
      {showCreate && courses.length > 0 && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: 24, borderLeft: '3px solid var(--accent-primary)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="input-label">COURSE</label>
              <select className="os-input" value={courseId} onChange={e => setCourseId(e.target.value)} style={{ cursor: 'pointer' }}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">TITLE</label>
              <input className="os-input" placeholder="Assessment title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="input-label">DESCRIPTION</label>
            <input className="os-input" placeholder="Brief description" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="input-label">DURATION (MINUTES)</label>
              <input className="os-input" type="number" value={duration} onChange={e => setDuration(+e.target.value)} min={1} />
            </div>
            <div>
              <label className="input-label">PASSING SCORE (%)</label>
              <input className="os-input" type="number" value={passingScore} onChange={e => setPassingScore(+e.target.value)} min={0} max={100} />
            </div>
          </div>
          <button onClick={createAssessment} disabled={loading || !title.trim()} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, padding: '8px 20px',
            background: 'var(--accent-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer',
            opacity: loading || !title.trim() ? 0.5 : 1, letterSpacing: '0.05em',
          }}>
            {loading ? 'CREATING...' : 'DEPLOY_ASSESSMENT'}
          </button>
        </div>
      )}

      {/* Assessment list */}
      {assessments.length === 0 && courses.length > 0 && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>NO_ASSESSMENTS</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Create your first assessment to get started.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {assessments.map(a => (
          <div key={a.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            {/* Header */}
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', cursor: 'pointer' }}
              onClick={() => toggleExpand(a.id)}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)' }}>
                  {a.duration_minutes}MIN · PASS: {a.passing_score}%
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={(e) => { e.stopPropagation(); openAssign(a.id); }} style={{
                  display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid rgba(45,212,191,0.3)',
                  padding: '4px 10px', cursor: 'pointer', color: 'var(--accent-secondary)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700,
                }} title="Assign to students">
                  <UserPlus size={12} /> ASSIGN
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteAssessment(a.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                  <Trash2 size={14} />
                </button>
                {expandedId === a.id ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
              </div>
            </div>

            {/* Expanded - questions */}
            {expandedId === a.id && (
              <div style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    {questions.length} QUESTION{questions.length !== 1 ? 'S' : ''}
                  </span>
                  <button onClick={() => setShowAddQ(!showAddQ)} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700, padding: '4px 12px', cursor: 'pointer',
                    background: showAddQ ? 'var(--bg-secondary)' : 'var(--accent-primary)', color: showAddQ ? 'var(--text-primary)' : 'var(--bg-primary)',
                    border: '1px solid var(--accent-primary)', letterSpacing: '0.05em',
                  }}>
                    {showAddQ ? 'CANCEL' : '+ ADD_QUESTION'}
                  </button>
                </div>

                {/* Add question form */}
                {showAddQ && (
                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1rem', marginBottom: 16 }}>
                    <div style={{ marginBottom: 12 }}>
                      <label className="input-label">QUESTION TEXT</label>
                      <textarea className="os-input" placeholder="Enter question..." value={qText} onChange={e => setQText(e.target.value)} rows={2} style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label className="input-label">POINTS</label>
                      <input className="os-input" type="number" value={qPoints} onChange={e => setQPoints(+e.target.value)} min={1} style={{ width: 100 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label className="input-label">OPTIONS (click radio to mark correct)</label>
                      {qOptions.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <input type="radio" name="correct" checked={opt.is_correct}
                            onChange={() => setQOptions(qOptions.map((o, j) => ({ ...o, is_correct: j === i })))}
                            style={{ accentColor: 'var(--accent-secondary)' }}
                          />
                          <input className="os-input" placeholder={`Option ${i + 1}`} value={opt.text}
                            onChange={e => setQOptions(qOptions.map((o, j) => j === i ? { ...o, text: e.target.value } : o))}
                            style={{ flex: 1 }}
                          />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addQuestion(a.id)} disabled={loading || !qText.trim()} style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700, padding: '6px 16px',
                      background: 'var(--accent-secondary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer',
                      opacity: loading || !qText.trim() ? 0.5 : 1,
                    }}>SAVE_QUESTION</button>
                  </div>
                )}

                {/* Questions list */}
                {questions.length === 0 && !showAddQ && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
                    NO_QUESTIONS_YET — Add questions to make this assessment functional.
                  </div>
                )}
                {questions.map((q, qi) => (
                  <div key={q.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginRight: 8 }}>Q{qi + 1}</span>
                          {q.text}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {q.options.map((o, oi) => (
                            <div key={oi} style={{ fontSize: '0.75rem', color: o.is_correct ? 'var(--accent-secondary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: o.is_correct ? 'var(--accent-secondary)' : 'var(--border-color)', display: 'inline-block' }} />
                              {o.text}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => deleteQuestion(q.id, a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Assign modal */}
      {showAssign && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowAssign(null)}
        >
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2rem', width: 420, maxHeight: '70vh', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>ASSIGN TO STUDENTS</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: 20, letterSpacing: '0.1em' }}>
              SELECT OPERATORS TO RECEIVE THIS ASSESSMENT
            </p>

            {allStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
                NO_STUDENTS_REGISTERED
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
                {allStudents.map(s => (
                  <label key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    background: selectedStudents.includes(s.id) ? 'rgba(45,212,191,0.08)' : 'var(--card-bg)',
                    border: `1px solid ${selectedStudents.includes(s.id) ? 'rgba(45,212,191,0.3)' : 'var(--border-color)'}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <input type="checkbox" checked={selectedStudents.includes(s.id)}
                      onChange={() => toggleStudent(s.id)}
                      style={{ accentColor: 'var(--accent-secondary)' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.full_name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={assignStudents} disabled={loading} style={{
                flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, padding: '8px',
                background: 'var(--accent-secondary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer',
              }}>
                <Send size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                CONFIRM ({selectedStudents.length})
              </button>
              <button onClick={() => setShowAssign(null)} style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, padding: '8px 16px',
                background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer',
              }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
