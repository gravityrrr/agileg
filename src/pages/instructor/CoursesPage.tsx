import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export default function CoursesPage({ session }: { session: any }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', session.user.id)
      .order('created_at', { ascending: false });
    setCourses(data || []);
  }

  async function createCourse() {
    if (!title.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('courses').insert({
      title: title.trim(),
      description: description.trim(),
      instructor_id: session.user.id,
      status: 'published',
    });
    if (!error) {
      setTitle('');
      setDescription('');
      setShowCreate(false);
      fetchCourses();
    }
    setLoading(false);
  }

  async function deleteCourse(id: string) {
    if (!confirm('Delete this course and all its assessments?')) return;
    await supabase.from('courses').delete().eq('id', id);
    fetchCourses();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>COURSES</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            {courses.length} MODULE{courses.length !== 1 ? 'S' : ''} REGISTERED
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
            padding: '8px 16px', cursor: 'pointer',
            background: 'var(--accent-secondary)', color: 'var(--bg-primary)',
            border: '1px solid var(--accent-secondary)', letterSpacing: '0.05em',
          }}
        >
          <Plus size={14} />
          {showCreate ? 'CANCEL' : 'NEW_COURSE'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: 24, borderLeft: '3px solid var(--accent-secondary)' }}>
          <div style={{ marginBottom: 16 }}>
            <label className="input-label">COURSE TITLE</label>
            <input className="os-input" placeholder="e.g. Advanced Systems Architecture" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="input-label">DESCRIPTION</label>
            <textarea
              className="os-input"
              placeholder="Course description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', minHeight: 80, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
            />
          </div>
          <button
            onClick={createCourse}
            disabled={loading || !title.trim()}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, padding: '8px 20px',
              background: 'var(--accent-secondary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer',
              opacity: loading || !title.trim() ? 0.5 : 1, letterSpacing: '0.05em',
            }}
          >
            {loading ? 'CREATING...' : 'CREATE_COURSE'}
          </button>
        </div>
      )}

      {/* Course list */}
      {courses.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>NO_COURSES_FOUND</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Create your first course to start building assessments.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {courses.map(c => (
            <div key={c.id} style={{
              background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1rem 1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'border-color 0.15s',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.description || 'No description'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700, padding: '2px 8px',
                  border: '1px solid rgba(45,212,191,0.3)', color: 'var(--accent-secondary)', textTransform: 'uppercase',
                }}>{c.status}</span>
                <button
                  onClick={() => deleteCourse(c.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-danger)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
