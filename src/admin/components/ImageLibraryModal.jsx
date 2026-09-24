import { useState, useEffect, useRef } from 'react';

export default function ImageLibraryModal({ isOpen, onClose, onSelect, currentValue }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isOpen) {
      fetchImages();
      setSelectedImage(currentValue);
    }
  }, [isOpen, currentValue]);

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
        setError(data.message || 'Failed to fetch media');
      }
    } catch (err) {
      setError('Connection error fetching media');
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
        setImages((prev) => [data.media, ...prev]);
        setSelectedImage(data.media.url);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Connection error uploading file');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id, filename, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this image from the server?')) return;

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
        setImages((prev) => prev.filter((img) => img._id !== id));
        if (selectedImage === `/uploads/${filename}`) {
          setSelectedImage(null);
        }
      } else {
        setError(data.message || 'Delete failed');
      }
    } catch (err) {
      setError('Connection error deleting file');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={modalBackdropStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h3 style={{ margin: 0, fontFamily: 'Playfair Display, serif' }}>Media Library</h3>
          <button onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>

        <div style={modalBodyStyle}>
          {error && <div className="admin-alert admin-alert-danger">{error}</div>}

          {/* Upload Controls */}
          <div style={uploadControlStyle}>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
              id="modal-file-upload"
            />
            <label
              htmlFor="modal-file-upload"
              className="admin-btn admin-btn-accent"
              style={{ cursor: 'pointer' }}
            >
              {uploading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Upload New Image</span>
                </>
              )}
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Supports JPG, PNG, GIF, WebP. Max size 5MB.
            </span>
          </div>

          {/* Image Selection Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: 'var(--admin-accent)' }}></i>
              <p style={{ marginTop: '10px' }}>Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
              <i className="fa-regular fa-image fa-3x" style={{ marginBottom: '15px' }}></i>
              <p>No uploaded images found. Upload a new image above.</p>
            </div>
          ) : (
            <div className="image-grid">
              {images.map((img) => {
                const isSelected = selectedImage === img.url;
                return (
                  <div
                    key={img._id}
                    className={`image-grid-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <img src={img.url.startsWith('http') ? img.url : `${apiURL}${img.url}`} alt={img.originalname} />
                    <button
                      onClick={(e) => handleDelete(img._id, img.filename, e)}
                      style={deleteImgBtnStyle}
                      title="Delete permanently"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Current Selection details */}
          <div style={selectionDetailsStyle}>
            <strong>Selected Image:</strong>{' '}
            <span style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
              {selectedImage || 'None'}
            </span>
          </div>
        </div>

        <div style={modalFooterStyle}>
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => {
              onSelect(selectedImage);
              onClose();
            }}
            disabled={!selectedImage}
          >
            Apply Image
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline styles for basic Modal Layout container
const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  animation: 'fadeIn 0.2s ease-out'
};

const modalContentStyle = {
  backgroundColor: '#fff',
  width: '90%',
  maxWidth: '600px',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
};

const modalHeaderStyle = {
  padding: '16px 20px',
  borderBottom: '1px solid var(--admin-border-color)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.8rem',
  cursor: 'pointer',
  padding: 0,
  lineHeight: 1
};

const modalBodyStyle = {
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const uploadControlStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  padding: '12px',
  backgroundColor: 'var(--admin-bg-light)',
  border: '1px solid var(--admin-border-color)',
  borderRadius: '6px'
};

const deleteImgBtnStyle = {
  position: 'absolute',
  bottom: '5px',
  right: '5px',
  backgroundColor: 'rgba(239, 68, 68, 0.9)',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  padding: '4px 6px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity 0.2s ease'
};

// Add hover styling on CSS class grid-item to show delete button
const styleNode = document.createElement('style');
styleNode.innerHTML = `
  .image-grid-item:hover button { opacity: 1 !important; }
`;
document.head.appendChild(styleNode);

const selectionDetailsStyle = {
  backgroundColor: '#f8fafc',
  padding: '10px',
  border: '1px solid var(--admin-border-color)',
  borderRadius: '4px',
  fontSize: '0.9rem'
};

const modalFooterStyle = {
  padding: '16px 20px',
  borderTop: '1px solid var(--admin-border-color)',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px'
};
