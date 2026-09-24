export default function PageStatus({ loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: 'var(--bg-color)' }}>
        <div className="spinner-border" role="status" style={{ color: 'var(--accent-dark)', width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)', fontSize: '1.2rem' }}>
          Loading celebration details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center p-4" style={{ height: '100vh', backgroundColor: 'var(--bg-color)' }}>
        <i className="fa-solid fa-circle-exclamation fa-3x mb-3" style={{ color: 'var(--accent-dark)' }}></i>
        <h2 className="mb-2" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>Unable to Load Content</h2>
        <p className="text-muted mb-4" style={{ maxWidth: '500px' }}>
          {error || 'A connection issue occurred while fetching the latest page content.'}
        </p>
        <button 
          className="btn btn-custom" 
          onClick={onRetry || (() => window.location.reload())}
          style={{ padding: '10px 24px' }}
        >
          <i className="fa-solid fa-arrows-rotate"></i> Retry
        </button>
      </div>
    );
  }

  return null;
}
