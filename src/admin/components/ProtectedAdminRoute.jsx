import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function ProtectedAdminRoute({ children, title }) {
  const [authorized, setAuthorized] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const navigate = useNavigate();

  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Reset body classes for admin panel
    document.body.className = 'admin-body';
    document.title = `${title} | Wedding CMS`;

    const verifyToken = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setVerifying(false);
        navigate('/admin/login');
        return;
      }

      try {
        const res = await fetch(`${apiURL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setAuthorized(true);
        } else {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      } catch (err) {
        console.error('Token verification error:', err);
        // On connection errors, allow user to stay in session but show warning
        setAuthorized(true);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [navigate, title]);

  if (verifying) {
    return (
      <div style={loadingContainerStyle}>
        <i className="fa-solid fa-spinner fa-spin fa-3x" style={{ color: 'var(--admin-accent)' }}></i>
        <p style={{ marginTop: '15px', fontWeight: 600 }}>Verifying credentials...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div className="admin-main" style={{ flexGrow: 1, marginLeft: '260px' }}>
        <AdminHeader title={title} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: '#1e1e2d',
  color: '#fff'
};
