import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2 } from 'lucide-react';

interface Profile { id: string; email: string; full_name: string; role: string; status: string; created_at: string; }

export default function AdminRoles({ session }: { session: any }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { fetchProfiles(); }, []);

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setProfiles(data || []);
  }

  async function updateRole(id: string, newRole: string) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    fetchProfiles();
  }

  async function deleteUser(id: string) {
    if (id === session.user.id) { alert('Cannot delete your own account.'); return; }
    if (!confirm('Remove this user?')) return;
    await supabase.from('profiles').delete().eq('id', id);
    fetchProfiles();
  }

  const filtered = filter === 'all' ? profiles : profiles.filter(p => p.role === filter);

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>USER MANAGEMENT</h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 24 }}>
        {profiles.length} OPERATORS REGISTERED
      </p>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'admin', 'instructor', 'student'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700, padding: '6px 14px', cursor: 'pointer',
            border: `1px solid ${filter === f ? 'var(--accent-primary)' : 'var(--border-color)'}`,
            background: filter === f ? 'rgba(157,155,242,0.1)' : 'transparent',
            color: filter === f ? 'var(--accent-primary)' : 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>NO_USERS_FOUND</div>
        </div>
      ) : (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['NAME', 'EMAIL', 'ROLE', 'JOINED', 'ACTIONS'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{p.full_name}</td>
                  <td style={{ padding: '10px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{p.email}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <select
                      value={p.role}
                      onChange={e => updateRole(p.id, e.target.value)}
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700,
                        background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)', padding: '4px 8px', cursor: 'pointer',
                      }}
                    >
                      <option value="student">STUDENT</option>
                      <option value="instructor">INSTRUCTOR</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {p.id !== session.user.id && (
                      <button onClick={() => deleteUser(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-danger)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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
