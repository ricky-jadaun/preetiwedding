import { useState, useEffect } from 'react';

export default function RsvpList() {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchRsvps();
  }, []);

  const fetchRsvps = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${apiURL}/api/rsvp`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setRsvps(data.rsvps);
      } else {
        setError(data.message || 'Failed to retrieve RSVPs');
      }
    } catch (err) {
      setError('Connection error retrieving RSVP data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this RSVP submission?')) return;

    setError(null);
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${apiURL}/api/rsvp/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('RSVP submission deleted successfully.');
        setRsvps((prev) => prev.filter((r) => r._id !== id));
      } else {
        setError(data.message || 'Failed to delete RSVP entry.');
      }
    } catch (err) {
      setError('Connection error deleting RSVP entry.');
    }
  };

  const accepts = rsvps.filter((r) => r.attending === 'accept').length;
  const declines = rsvps.filter((r) => r.attending === 'decline').length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: 'var(--admin-accent)' }}></i>
        <p>Loading RSVP submissions...</p>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="admin-alert admin-alert-danger">{error}</div>}
      {success && <div className="admin-alert admin-alert-success">{success}</div>}

      {/* Metrics Row */}
      <div style={summaryRowStyle}>
        <div className="admin-card" style={summaryCardStyle}>
          <strong>Total Submissions</strong>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, display: 'block', marginTop: '5px' }}>{rsvps.length}</span>
        </div>
        <div className="admin-card" style={{ ...summaryCardStyle, borderLeft: '4px solid var(--admin-success)' }}>
          <strong>Joyfully Attending</strong>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, display: 'block', marginTop: '5px', color: 'var(--admin-success)' }}>{accepts}</span>
        </div>
        <div className="admin-card" style={{ ...summaryCardStyle, borderLeft: '4px solid var(--admin-danger)' }}>
          <strong>Regretfully Declining</strong>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, display: 'block', marginTop: '5px', color: 'var(--admin-danger)' }}>{declines}</span>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>Guest RSVP Entries List</span>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={fetchRsvps}>
            <i className="fa-solid fa-arrows-rotate"></i> Refresh
          </button>
        </div>

        {rsvps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
            <i className="fa-regular fa-folder-open fa-3x" style={{ marginBottom: '15px' }}></i>
            <p>No RSVP submissions received yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="rsvp-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact Info</th>
                  <th>Attendance</th>
                  <th>Travel Dates (India)</th>
                  <th>Dietary Restrictions</th>
                  <th>Comments / Special Needs</th>
                  <th>Submitted At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((rsvp) => (
                  <tr key={rsvp._id}>
                    <td>
                      <strong>{rsvp.firstName} {rsvp.lastName}</strong>
                    </td>
                    <td>
                      <div>
                        <i className="fa-regular fa-envelope" style={{ marginRight: '6px', color: 'var(--admin-text-muted)' }}></i>
                        <a href={`mailto:${rsvp.email}`}>{rsvp.email}</a>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <i className="fa-brands fa-whatsapp" style={{ marginRight: '6px', color: '#25D366' }}></i>
                        {rsvp.whatsapp}
                      </div>
                    </td>
                    <td>
                      {rsvp.attending === 'accept' ? (
                        <span className="rsvp-badge rsvp-badge-accept">
                          <i className="fa-solid fa-circle-check"></i> Attending
                        </span>
                      ) : (
                        <span className="rsvp-badge rsvp-badge-decline">
                          <i className="fa-solid fa-circle-xmark"></i> Declined
                        </span>
                      )}
                    </td>
                    <td>{rsvp.datesInIndia || <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>N/A</span>}</td>
                    <td>{rsvp.dietary || <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>None</span>}</td>
                    <td>{rsvp.specialNeeds || <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>None</span>}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                      {new Date(rsvp.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => handleDelete(rsvp._id)}
                        title="Delete RSVP submission"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const summaryRowStyle = {
  display: 'flex',
  gap: '20px',
  marginBottom: '20px'
};

const summaryCardStyle = {
  flex: 1,
  margin: 0,
  padding: '16px'
};
