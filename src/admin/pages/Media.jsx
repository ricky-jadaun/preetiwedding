import { useState, useEffect, useRef } from 'react';

export default function Media() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${apiURL}/api/media`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setImages(data.media);
      } else {
        setError(data.message || 'Failed to load media files');
      }
    } catch (err) {
      setError('Connection error retrieving media files.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setError(null);
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${apiURL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Image uploaded and registered successfully!');
        setImages((prev) => [data.media, ...prev]);
      } else {
        setError(data.message || 'Image upload failed.');
      }
    } catch (err) {
      setError('Connection error uploading image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this image from the server? This will break any content blocks currently pointing to this image URL.')) return;

    setError(null);
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${apiURL}/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Image deleted successfully from server.');
        setImages((prev) => prev.filter((img) => img._id !== id));
      } else {
        setError(data.message || 'Failed to delete image.');
      }
    } catch (err) {
      setError('Connection error deleting image.');
    }
  };

  const copyPath = (path, e) => {
    navigator.clipboard.writeText(path).then(() => {
      const btn = e.currentTarget;
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 1500);
    });
  };

  return (
    <div>
      {error && <div className="admin-alert admin-alert-danger">{error}</div>}
      {success && <div className="admin-alert admin-alert-success">{success}</div>}

      {/* Upload card */}
      <div className="admin-card">
        <div className="admin-card-title">Upload Image Asset</div>
        <div style={uploaderAreaStyle}>
          <i className="fa-solid fa-cloud-arrow-up fa-3x" style={{ color: 'var(--admin-accent)', marginBottom: '15px' }}></i>
          <h5>Drag & Drop or Browse files</h5>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', margin: '5px 0 20px 0' }}>
            Supports JPG, JPEG, PNG, GIF, WebP. Recommended maximum width: 1920px. Limit 5MB.
          </p>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: 'none' }}
            id="gallery-file-upload"
          />
          <label htmlFor="gallery-file-upload" className="admin-btn admin-btn-accent" style={{ cursor: 'pointer' }}>
            {uploading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Uploading Image...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-images"></i>
                <span>Select & Upload Image</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Gallery list */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>Image Gallery Library</span>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={fetchImages}>
            <i className="fa-solid fa-arrows-rotate"></i> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: 'var(--admin-accent)' }}></i>
            <p style={{ marginTop: '10px' }}>Loading gallery...</p>
          </div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
            <i className="fa-regular fa-image fa-3x" style={{ marginBottom: '15px' }}></i>
            <p>No uploaded files in library. Upload files using the card above.</p>
          </div>
        ) : (
          <div style={galleryGridStyle}>
            {images.map((img) => (
              <div key={img._id} className="admin-card" style={galleryCardStyle}>
                <div style={imgWrapStyle}>
                  <img src={`${apiURL}${img.url}`} alt={img.originalname} style={imgStyle} />
                </div>
                <div style={infoContainerStyle}>
                  <div style={nameStyle} title={img.originalname}>
                    {img.originalname}
                  </div>
                  <div style={sizeStyle}>
                    {(img.size / 1024).toFixed(1)} KB | {new Date(img.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                    <button
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      style={{ flex: 1, padding: '4px 6px', fontSize: '0.75rem' }}
                      onClick={(e) => copyPath(img.url, e)}
                    >
                      <i className="fa-regular fa-copy"></i> Copy Path
                    </button>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      style={{ padding: '4px 8px' }}
                      onClick={() => handleDelete(img._id)}
                      title="Delete Image"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const uploaderAreaStyle = {
  border: '2px dashed var(--admin-border-color)',
  borderRadius: '8px',
  padding: '40px 20px',
  textAlign: 'center',
  backgroundColor: 'var(--admin-bg-light)',
  cursor: 'pointer'
};

const galleryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '20px'
};

const galleryCardStyle = {
  padding: 0,
  margin: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

const imgWrapStyle = {
  width: '100%',
  aspectRatio: '4/3',
  overflow: 'hidden',
  backgroundColor: '#f1f5f9',
  borderBottom: '1px solid var(--admin-border-color)'
};

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const infoContainerStyle = {
  padding: '12px'
};

const nameStyle = {
  fontSize: '0.8rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: 'var(--admin-primary)'
};

const sizeStyle = {
  fontSize: '0.72rem',
  color: 'var(--admin-text-muted)',
  marginTop: '4px'
};
