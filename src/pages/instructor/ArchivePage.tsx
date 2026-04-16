export default function ArchivePage() {
  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>ARCHIVE</h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 24 }}>
        HISTORICAL RECORDS & COMPLETED MODULES
      </p>
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>ARCHIVE_EMPTY</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Archived assessments and historical data will appear here.</div>
      </div>
    </div>
  );
}
