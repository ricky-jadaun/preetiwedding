export default function AdminHeader({ title }) {
  const username = 'admin'; // Or dynamic from local storage if needed

  return (
    <header className="admin-header">
      <div className="admin-header-title">
        <h2>{title}</h2>
      </div>
      <div className="admin-header-user">
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="admin-btn admin-btn-secondary admin-btn-sm"
        >
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
          <span>View Public Site</span>
        </a>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--admin-border-color)' }}></div>
        <div className="admin-header-user">
          <i className="fa-solid fa-user-shield" style={{ fontSize: '1.2rem', color: 'var(--admin-accent)' }}></i>
          <div className="admin-user-info">
            <div className="admin-user-name">{username}</div>
            <div className="admin-user-role">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
