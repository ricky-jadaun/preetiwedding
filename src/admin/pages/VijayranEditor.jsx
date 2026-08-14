import { useState, useEffect } from 'react';
import ImageLibraryModal from '../components/ImageLibraryModal';

export default function VijayranEditor() {
  const [pageData, setPageData] = useState(null); // Holds { en, fr } from DB
  const [lang, setLang] = useState('en'); // Active edit language: 'en' or 'fr'
  const [content, setContent] = useState(null); // Active working copy of content
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Media library modal state
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState(null);

  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/assets') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${apiURL}${url}`;
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  // When language or pageData changes, load correct translation into working content state
  useEffect(() => {
    if (pageData) {
      setContent(JSON.parse(JSON.stringify(pageData[lang])));
    }
  }, [lang, pageData]);

  const fetchPageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiURL}/api/pages/book-vijayran`);
      const data = await res.json();
      if (data.success) {
        setPageData(data);
      } else {
        setError(data.message || 'Failed to load page content');
      }
    } catch (err) {
      setError('Connection error loading content.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleHeroFieldChange = (field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.hero = { ...updated.hero, [field]: value };
      return updated;
    });
  };

  const triggerImageSelect = (fieldPath) => {
    setActiveImageField(fieldPath);
    setMediaModalOpen(true);
  };

  const handleImageSelected = (url) => {
    if (!activeImageField) return;
    setContent((prev) => {
      const updated = { ...prev };
      const parts = activeImageField.split('.');
      if (parts.length === 2) {
        updated[parts[0]][parts[1]] = url;
      }
      return updated;
    });
    setActiveImageField(null);
  };

  // --- Accommodation Rate Helpers ---
  const handleRateChange = (idx, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.rates[idx][field] = value;
      return updated;
    });
  };

  // --- Bank Account Card Helpers ---
  const handleAccountChange = (acctIdx, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.accounts[acctIdx][field] = value;
      return updated;
    });
  };

  const handleAccountDetailChange = (acctIdx, detIdx, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.accounts[acctIdx].details[detIdx][field] = value;
      return updated;
    });
  };

  // --- Important Notes / Booking Policies Helpers ---
  const handleNoteChange = (idx, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.importantNotes[idx] = value;
      return updated;
    });
  };

  const addNote = () => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.importantNotes.push('');
      return updated;
    });
  };

  const removeNote = (idx) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.importantNotes.splice(idx, 1);
      return updated;
    });
  };

  // --- Save to Database ---
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${apiURL}/api/pages/book-vijayran`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lang,
          content
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`Successfully saved '${lang === 'en' ? 'English' : 'French'}' content for Book Vijayran Palace page.`);
        setPageData((prev) => ({
          ...prev,
          [lang]: content
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.message || 'Failed to save page contents');
      }
    } catch (err) {
      setError('Connection error saving page.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: 'var(--admin-accent)' }}></i>
        <p>Loading Vijayran editor data...</p>
      </div>
    );
  }

  if (error && !content) {
    return <div className="admin-alert admin-alert-danger">{error}</div>;
  }

  return (
    <div>
      {/* Alerts */}
      {error && <div className="admin-alert admin-alert-danger">{error}</div>}
      {successMsg && <div className="admin-alert admin-alert-success"><i className="fa-solid fa-circle-check"></i> {successMsg}</div>}

      {/* Language Switcher */}
      <div className="admin-lang-tabs">
        <button 
          className={`admin-lang-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => { setLang('en'); setSuccessMsg(''); }}
        >
          <img src="https://flagcdn.com/w20/gb.png" alt="English" />
          <span>Edit English Content</span>
        </button>
        <button 
          className={`admin-lang-btn ${lang === 'fr' ? 'active' : ''}`}
          onClick={() => { setLang('fr'); setSuccessMsg(''); }}
        >
          <img src="https://flagcdn.com/w20/fr.png" alt="French" />
          <span>Edit French Content</span>
        </button>
      </div>

      {content && (
        <div>
          {/* 1. HERO & BANNER */}
          <div className="admin-card">
            <div className="admin-card-title">1. Banner Header</div>
            <div className="admin-form-group">
              <label>Subpage Title</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.hero.title}
                onChange={(e) => handleHeroFieldChange('title', e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label>Subpage Subtitle</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.hero.subtitle}
                onChange={(e) => handleHeroFieldChange('subtitle', e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label>Banner Background Image</label>
              <div className="admin-image-preview-container">
                <img 
                  src={getImageUrl(content.hero.bgImage)} 
                  alt="Banner BG" 
                  className="admin-image-preview"
                />
                <button 
                  type="button" 
                  className="admin-btn admin-btn-accent admin-btn-sm"
                  onClick={() => triggerImageSelect('hero.bgImage')}
                >
                  Change Background Image
                </button>
              </div>
            </div>

            <div className="row" style={{ display: 'flex', gap: '20px' }}>
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label>Back Button Text</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.backBtn}
                  onChange={(e) => handleFieldChange('backBtn', e.target.value)}
                />
              </div>
              <div className="admin-form-group" style={{ flex: 2 }}>
                <label>Introduction paragraph text</label>
                <textarea 
                  className="admin-textarea" 
                  rows="4"
                  value={content.introText}
                  onChange={(e) => handleFieldChange('introText', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 2. SUBSIDIZED RATES */}
          <div className="admin-card">
            <div className="admin-card-title">2. Subsidized Accommodation Rates</div>
            
            <div className="admin-form-group">
              <label>Rates Block Section Title</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.ratesTitle}
                onChange={(e) => handleFieldChange('ratesTitle', e.target.value)}
              />
            </div>

            <div className="row" style={{ display: 'flex', gap: '20px' }}>
              {content.rates.map((rate, rIdx) => (
                <div key={rIdx} style={{ flex: 1, padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fafafb' }}>
                  <h6 style={{ fontWeight: 700, marginTop: 0 }}>Rate Tier #{rIdx + 1}</h6>
                  <div className="row" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '100px' }}>
                      <label style={{ fontSize: '0.78rem' }}>Price</label>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={rate.price} 
                        onChange={(e) => handleRateChange(rIdx, 'price', e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.78rem' }}>Billing Label (e.g. per adult / night)</label>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={rate.label} 
                        onChange={(e) => handleRateChange(rIdx, 'label', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.78rem' }}>Price Description / Details</label>
                    <textarea 
                      className="admin-textarea" 
                      rows="3" 
                      value={rate.description} 
                      onChange={(e) => handleRateChange(rIdx, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. PAYMENT ACCOUNTS */}
          <div className="admin-card">
            <div className="admin-card-title">3. Payment & Bank Transfers Info</div>
            
            <div className="admin-form-group">
              <label>Payment Block Heading</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.paymentTitle}
                onChange={(e) => handleFieldChange('paymentTitle', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Payment Instructions Description Text</label>
              <textarea 
                className="admin-textarea" 
                rows="3"
                value={content.paymentInstructions}
                onChange={(e) => handleFieldChange('paymentInstructions', e.target.value)}
              />
            </div>

            <label style={{ fontWeight: 700, display: 'block', marginBottom: '10px' }}>Bank Account Cards</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {content.accounts.map((acct, acctIdx) => (
                <div key={acctIdx} style={{ padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fafafb' }}>
                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Card Title</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={acct.title}
                      onChange={(e) => handleAccountChange(acctIdx, 'title', e.target.value)}
                    />
                  </div>
                  
                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Bank Name</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={acct.bank}
                      onChange={(e) => handleAccountChange(acctIdx, 'bank', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Account Owner Name</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={acct.owner}
                      onChange={(e) => handleAccountChange(acctIdx, 'owner', e.target.value)}
                    />
                  </div>

                  {acct.details.map((detail, detIdx) => (
                    <div key={detIdx} className="row" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '80px' }}>
                        <label style={{ fontSize: '0.8rem' }}>Label</label>
                        <input 
                          type="text" 
                          className="admin-input"
                          style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                          value={detail.label}
                          onChange={(e) => handleAccountDetailChange(acctIdx, detIdx, 'label', e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem' }}>Value</label>
                        <input 
                          type="text" 
                          className="admin-input"
                          style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                          value={detail.value}
                          onChange={(e) => handleAccountDetailChange(acctIdx, detIdx, 'value', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Copyable Value</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={acct.copyVal}
                      onChange={(e) => handleAccountChange(acctIdx, 'copyVal', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '0' }}>
                    <label style={{ fontSize: '0.8rem' }}>Copy Button Label</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={acct.copyBtn}
                      onChange={(e) => handleAccountChange(acctIdx, 'copyBtn', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. IMPORTANT POLICIES */}
          <div className="admin-card">
            <div className="admin-card-title">4. Booking Policies & Guidelines</div>
            
            <div className="admin-form-group">
              <label>Policies Section Title</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.importantNotesTitle}
                onChange={(e) => handleFieldChange('importantNotesTitle', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Policies list items</label>
              {content.importantNotes.map((note, idx) => (
                <div key={idx} className="array-item-row">
                  <div className="array-item-fields">
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={note}
                      onChange={(e) => handleNoteChange(idx, e.target.value)}
                    />
                  </div>
                  <div className="array-item-actions">
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => removeNote(idx)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={addNote}
                style={{ marginTop: '10px' }}
              >
                <i className="fa-solid fa-plus"></i> Add Policy Item
              </button>
            </div>
          </div>

          {/* SAVE BUTTON SECTION */}
          <div className="admin-card" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', position: 'sticky', bottom: '20px', zIndex: 10, boxShadow: '0 -5px 15px rgba(0,0,0,0.05)' }}>
            <button 
              type="button" 
              className="admin-btn admin-btn-secondary"
              onClick={fetchPageData}
              disabled={saving}
            >
              Reset Changes
            </button>
            <button 
              type="button" 
              className="admin-btn admin-btn-accent"
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '12px 30px', fontSize: '0.95rem' }}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Saving Contents...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Save Booking Page {lang.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Image Gallery select */}
      <ImageLibraryModal 
        isOpen={mediaModalOpen} 
        onClose={() => setMediaModalOpen(false)} 
        onSelect={handleImageSelected}
        currentValue={activeImageField ? activeImageField.split('.').reduce((o, i) => o[i], content) : null}
      />
    </div>
  );
}
