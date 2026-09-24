import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: 'fa-solid fa-chart-line', label: 'Dashboard' },
    { path: '/admin/home-editor', icon: 'fa-solid fa-house-chimney', label: 'Home Editor' },
    { path: '/admin/attire-editor', icon: 'fa-solid fa-shirt', label: 'Attire Editor' },
    { path: '/admin/travel-editor', icon: 'fa-solid fa-plane', label: 'Travel Editor' },
    { path: '/admin/vijayran-editor', icon: 'fa-solid fa-hotel', label: 'Vijayran Editor' },
    { path: '/admin/rsvp', icon: 'fa-solid fa-envelope-open-text', label: 'RSVP Submissions' },
    // { path: '/admin/media', icon: 'fa-solid fa-images', label: 'Media Library' },
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <img src="/assets/images/p-h-logo.png" alt="Preeti & Harpreet Logo" />
        <div>
          <h4>Wedding CMS</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Admin Panel</span>
        </div>
      </div>
      
      <ul className="admin-sidebar-menu">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path} className={`admin-menu-item ${isActive ? 'active' : ''}`}>
              <Link to={item.path}>
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div className="admin-sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
