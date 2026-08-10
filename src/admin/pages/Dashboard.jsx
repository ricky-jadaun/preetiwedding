import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRsvps: 0,
    attending: 0,
    declined: 0,
    mediaCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        // Fetch RSVPs
        const rsvpRes = await fetch(`${apiURL}/api/rsvp`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const rsvpData = await rsvpRes.json();

        // Fetch Media count
        const mediaRes = await fetch(`${apiURL}/api/media`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const mediaData = await mediaRes.json();

        if (rsvpData.success && mediaData.success) {
          const rsvps = rsvpData.rsvps;
          const attending = rsvps.filter((r) => r.attending === 'accept').length;
          const declined = rsvps.filter((r) => r.attending === 'decline').length;

          setStats({
            totalRsvps: rsvps.length,
            attending,
            declined,
            mediaCount: mediaData.count
          });
        } else {
          setError('Failed to fetch dashboard statistics.');
        }
      } catch (err) {
        console.error(err);
        setError('Error connecting to backend API.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: 'var(--admin-accent)' }}></i>
        <p>Loading Dashboard stats...</p>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="admin-alert admin-alert-danger">{error}</div>}

      <div style={welcomeBannerStyle}>
        <h1 style={{ margin: 0, fontFamily: 'Playfair Display, serif', color: 'var(--admin-accent)' }}>Welcome, Administrator</h1>
        <p style={{ margin: '8px 0 0 0', color: 'var(--admin-text-muted)', fontSize: '0.95rem' }}>
          Manage your wedding website content, images, and track RSVPs in real time.
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={statsGridStyle}>
        <div className="admin-card" style={statCardStyle}>
          <div style={statIconWrapStyle('#d1fae5')}>
            <i className="fa-regular fa-envelope-open" style={{ color: 'var(--admin-success)' }}></i>
          </div>
          <div>
            <div style={statValStyle}>{stats.totalRsvps}</div>
            <div style={statLabelStyle}>Total RSVPs</div>
          </div>
        </div>

        <div className="admin-card" style={statCardStyle}>
          <div style={statIconWrapStyle('#e0f2fe')}>
            <i className="fa-solid fa-user-check" style={{ color: '#0284c7' }}></i>
          </div>
          <div>
            <div style={statValStyle}>{stats.attending}</div>
            <div style={statLabelStyle}>Joyfully Accepting</div>
          </div>
        </div>

        <div className="admin-card" style={statCardStyle}>
          <div style={statIconWrapStyle('#fee2e2')}>
            <i className="fa-solid fa-user-slash" style={{ color: 'var(--admin-danger)' }}></i>
          </div>
          <div>
            <div style={statValStyle}>{stats.declined}</div>
            <div style={statLabelStyle}>Regretfully Declining</div>
          </div>
        </div>

        <div className="admin-card" style={statCardStyle}>
          <div style={statIconWrapStyle('#fef3c7')}>
            <i className="fa-regular fa-images" style={{ color: '#d97706' }}></i>
          </div>
          <div>
            <div style={statValStyle}>{stats.mediaCount}</div>
            <div style={statLabelStyle}>Images in Library</div>
          </div>
        </div>
      </div>

      {/* Pages Content Management */}
      <h3 style={{ margin: '20px 0 15px 0', fontFamily: 'Playfair Display, serif', color: 'var(--admin-primary)' }}>Manage Pages</h3>
      
      <div style={pagesGridStyle}>
        {/* Home Page Edit Card */}
        <div className="admin-card" style={pageManagerCardStyle}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
            <i className="fa-solid fa-house-chimney" style={{ fontSize: '1.8rem', color: 'var(--admin-accent)' }}></i>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Home Page</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-main)', margin: '0 0 20px 0', minHeight: '40px' }}>
            Edit Hero titles, Story, Timeline/Itinerary events, RSVP labels, FAQ lists, Contacts, and Gift banks.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/home-editor" className="admin-btn admin-btn-primary admin-btn-sm" style={{ flexGrow: 1 }}>
              <i className="fa-solid fa-pen-to-square"></i> Edit Content
            </Link>
          </div>
        </div>

        {/* Attire Page Edit Card */}
        <div className="admin-card" style={pageManagerCardStyle}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
            <i className="fa-solid fa-shirt" style={{ fontSize: '1.8rem', color: 'var(--admin-accent)' }}></i>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Attire Guide</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-main)', margin: '0 0 20px 0', minHeight: '40px' }}>
            Manage style guides, outfit cards (Lehenga, Saree, Sherwani), shopping lists in Delhi, and styling tips.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/attire-editor" className="admin-btn admin-btn-primary admin-btn-sm" style={{ flexGrow: 1 }}>
              <i className="fa-solid fa-pen-to-square"></i> Edit Content
            </Link>
          </div>
        </div>

        {/* Travel Page Edit Card */}
        <div className="admin-card" style={pageManagerCardStyle}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
            <i className="fa-solid fa-plane" style={{ fontSize: '1.8rem', color: 'var(--admin-accent)' }}></i>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Travel Guide</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-main)', margin: '0 0 20px 0', minHeight: '40px' }}>
            Configure Visa info, travel cards, hotel bookings (Delhi & Jaipur rates), transport, and explore areas.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/travel-editor" className="admin-btn admin-btn-primary admin-btn-sm" style={{ flexGrow: 1 }}>
              <i className="fa-solid fa-pen-to-square"></i> Edit Content
            </Link>
          </div>
        </div>

        {/* Book Vijayran Palace Edit Card */}
        <div className="admin-card" style={pageManagerCardStyle}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
            <i className="fa-solid fa-hotel" style={{ fontSize: '1.8rem', color: 'var(--admin-accent)' }}></i>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Vijayran Palace</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-main)', margin: '0 0 20px 0', minHeight: '40px' }}>
            Configure venue booking descriptions, room rates (per adult/child), payment bank accounts, and booking policies.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/vijayran-editor" className="admin-btn admin-btn-primary admin-btn-sm" style={{ flexGrow: 1 }}>
              <i className="fa-solid fa-pen-to-square"></i> Edit Content
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const welcomeBannerStyle = {
  background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))',
  padding: '30px',
  borderRadius: '8px',
  color: '#fff',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
  marginBottom: '30px'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
};

const statCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  margin: 0,
  padding: '24px'
};

const statIconWrapStyle = (bgColor) => ({
  width: '50px',
  height: '50px',
  borderRadius: '10px',
  backgroundColor: bgColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem'
});

const statValStyle = {
  fontSize: '1.8rem',
  fontWeight: 700,
  color: 'var(--admin-primary)',
  lineHeight: 1.1
};

const statLabelStyle = {
  fontSize: '0.82rem',
  color: 'var(--admin-text-muted)',
  fontWeight: 600,
  textTransform: 'uppercase',
  marginTop: '4px'
};

const pagesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px'
};

const pageManagerCardStyle = {
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};
