import { useState, useEffect } from 'react';
import ImageLibraryModal from '../components/ImageLibraryModal';

export default function TravelEditor() {
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
      const res = await fetch(`${apiURL}/api/pages/travel`);
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

  // --- Essential Info Card Helpers ---
  const handleInfoCardChange = (index, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.infoCards[index][field] = value;
      return updated;
    });
  };

  // --- Accommodation text blocks Helpers ---
  const handleAccommodationFieldChange = (section, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.accommodation[section] = { 
        ...updated.accommodation[section], 
        [field]: value 
      };
      return updated;
    });
  };

  const handleAccomRateChange = (rateIdx, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.accommodation.venue.rates[rateIdx][field] = value;
      return updated;
    });
  };

  // --- Accom Bank Account Card Helpers ---
  const handleAccomAccountChange = (acctIdx, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.accommodation.venue.accounts[acctIdx][field] = value;
      return updated;
    });
  };

  const handleAccomAccountDetailChange = (acctIdx, detIdx, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.accommodation.venue.accounts[acctIdx].details[detIdx][field] = value;
      return updated;
    });
  };

  // --- Transport Guide Bullets Helpers ---
  const handleTransportBulletChange = (idx, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.transportation.items[idx] = value;
      return updated;
    });
  };

  const addTransportBullet = () => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.transportation.items.push('');
      return updated;
    });
  };

  const removeTransportBullet = (idx) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.transportation.items.splice(idx, 1);
      return updated;
    });
  };

  // --- Explore India Destination Card Helpers ---
  const handleDestinationChange = (idx, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.explore.destinations[idx][field] = value;
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
      const res = await fetch(`${apiURL}/api/pages/travel`, {
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
        setSuccessMsg(`Successfully saved '${lang === 'en' ? 'English' : 'French'}' content for Travel guide.`);
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
        <p>Loading Travel editor data...</p>
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
          {/* BANNER HEADER */}
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
                  src={content.hero.bgImage.startsWith('/assets') ? content.hero.bgImage : `${apiURL}${content.hero.bgImage}`} 
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

            <div className="admin-form-group">
              <label>Back Button Text</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.backBtn}
                onChange={(e) => handleFieldChange('backBtn', e.target.value)}
              />
            </div>
          </div>

          {/* ESSENTIAL TRAVEL CARDS (6 items) */}
          <div className="admin-card">
            <div className="admin-card-title">2. Essential Travel Cards</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {content.infoCards.map((card, idx) => (
                <div key={idx} style={{ padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fafafb' }}>
                  <h6 style={{ fontWeight: 700, margin: '0 0 12px 0' }}>Card #{idx + 1}: {card.title}</h6>
                  
                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Card Icon FontAwesome class</label>
                    <input 
                      type="text" 
                      className="admin-input"
                      value={card.icon}
                      onChange={(e) => handleInfoCardChange(idx, 'icon', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Card Title</label>
                    <input 
                      type="text" 
                      className="admin-input"
                      value={card.title}
                      onChange={(e) => handleInfoCardChange(idx, 'title', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '0' }}>
                    <label style={{ fontSize: '0.8rem' }}>Description text (HTML Enabled)</label>
                    <textarea 
                      className="admin-textarea"
                      rows="6"
                      value={card.text}
                      onChange={(e) => handleInfoCardChange(idx, 'text', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACCOMMODATIONS & VENUE BOOKINGS */}
          <div className="admin-card">
            <div className="admin-card-title">3. Accommodations & Venue Bookings</div>
            
            <div className="admin-form-group">
              <label>Section Title</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.accommodation.title}
                onChange={(e) => {
                  setContent((prev) => {
                    const updated = { ...prev };
                    updated.accommodation.title = e.target.value;
                    return updated;
                  });
                }}
              />
            </div>

            <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '25px' }}>
              {/* Delhi */}
              <div style={{ padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px' }}>
                <h6 style={{ fontWeight: 700, marginTop: 0 }}>Delhi Accommodation</h6>
                <div className="admin-form-group">
                  <label>Card Title</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.accommodation.delhi.title}
                    onChange={(e) => handleAccommodationFieldChange('delhi', 'title', e.target.value)}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>Description Text (HTML Enabled)</label>
                  <textarea 
                    className="admin-textarea"
                    rows="4"
                    value={content.accommodation.delhi.text}
                    onChange={(e) => handleAccommodationFieldChange('delhi', 'text', e.target.value)}
                  />
                </div>
              </div>

              {/* Jaipur */}
              <div style={{ padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px' }}>
                <h6 style={{ fontWeight: 700, marginTop: 0 }}>Jaipur Accommodation</h6>
                <div className="admin-form-group">
                  <label>Card Title</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.accommodation.jaipur.title}
                    onChange={(e) => handleAccommodationFieldChange('jaipur', 'title', e.target.value)}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>Description Text (HTML Enabled)</label>
                  <textarea 
                    className="admin-textarea"
                    rows="4"
                    value={content.accommodation.jaipur.text}
                    onChange={(e) => handleAccommodationFieldChange('jaipur', 'text', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Wedding Venue Details Box */}
            <div style={{ padding: '20px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fbfbfc' }}>
              <h5 style={{ fontWeight: 700, marginTop: 0, color: 'var(--admin-accent)' }}>Wedding Venue Subsidized Bookings Details</h5>
              
              <div className="admin-form-group">
                <label>Venue Box Heading</label>
                <input 
                  type="text" 
                  className="admin-input"
                  value={content.accommodation.venue.title}
                  onChange={(e) => handleAccommodationFieldChange('venue', 'title', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Venue Box Subsidized text description</label>
                <input 
                  type="text" 
                  className="admin-input"
                  value={content.accommodation.venue.description}
                  onChange={(e) => handleAccommodationFieldChange('venue', 'description', e.target.value)}
                />
              </div>

              {/* Subsidized rates */}
              <div className="row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                {content.accommodation.venue.rates.map((rate, rIdx) => (
                  <div key={rIdx} style={{ flex: 1, padding: '12px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fff' }}>
                    <strong>Rate option #{rIdx + 1}</strong>
                    <div className="row" style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                      <div style={{ width: '100px' }}>
                        <label style={{ fontSize: '0.75rem' }}>Price</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          value={rate.price} 
                          onChange={(e) => handleAccomRateChange(rIdx, 'price', e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem' }}>Label (e.g. per adult / night)</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          value={rate.label} 
                          onChange={(e) => handleAccomRateChange(rIdx, 'label', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-form-group">
                <label>Payment Transfer instructions description text</label>
                <input 
                  type="text" 
                  className="admin-input"
                  value={content.accommodation.venue.paymentInstructions}
                  onChange={(e) => handleAccommodationFieldChange('venue', 'paymentInstructions', e.target.value)}
                />
              </div>

              {/* Bank accounts for payment */}
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '10px' }}>Payment Bank Accounts cards</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
                {content.accommodation.venue.accounts.map((acct, acctIdx) => (
                  <div key={acctIdx} style={{ padding: '12px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fff' }}>
                    <div className="admin-form-group" style={{ marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.75rem' }}>Card Title</label>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={acct.title}
                        onChange={(e) => handleAccomAccountChange(acctIdx, 'title', e.target.value)}
                      />
                    </div>
                    
                    <div className="admin-form-group" style={{ marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.75rem' }}>Bank Name</label>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={acct.bank}
                        onChange={(e) => handleAccomAccountChange(acctIdx, 'bank', e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.75rem' }}>Account Owner Name</label>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={acct.owner}
                        onChange={(e) => handleAccomAccountChange(acctIdx, 'owner', e.target.value)}
                      />
                    </div>

                    {acct.details.map((detail, detIdx) => (
                      <div key={detIdx} className="row" style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ width: '70px' }}>
                          <label style={{ fontSize: '0.7rem' }}>Label</label>
                          <input 
                            type="text" 
                            className="admin-input"
                            style={{ padding: '4px 6px', fontSize: '0.75rem' }}
                            value={detail.label}
                            onChange={(e) => handleAccomAccountDetailChange(acctIdx, detIdx, 'label', e.target.value)}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.7rem' }}>Value</label>
                          <input 
                            type="text" 
                            className="admin-input"
                            style={{ padding: '4px 6px', fontSize: '0.75rem' }}
                            value={detail.value}
                            onChange={(e) => handleAccomAccountDetailChange(acctIdx, detIdx, 'value', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="admin-form-group" style={{ marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.75rem' }}>Copyable Value</label>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={acct.copyVal}
                        onChange={(e) => handleAccomAccountChange(acctIdx, 'copyVal', e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '0' }}>
                      <label style={{ fontSize: '0.75rem' }}>Copy Button Label</label>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={acct.copyBtn}
                        onChange={(e) => handleAccomAccountChange(acctIdx, 'copyBtn', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TRANSPORTATION GUIDE */}
          <div className="admin-card">
            <div className="admin-card-title">4. Transportation Guide</div>
            
            <div className="admin-form-group">
              <label>Section Heading</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.transportation.title}
                onChange={(e) => {
                  setContent((prev) => {
                    const updated = { ...prev };
                    updated.transportation.title = e.target.value;
                    return updated;
                  });
                }}
              />
            </div>

            <div className="admin-form-group">
              <label>Transportation Bullets (Supports strong HTML tags):</label>
              
              {content.transportation.items.map((bullet, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    className="admin-input" 
                    value={bullet}
                    onChange={(e) => handleTransportBulletChange(idx, e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    style={{ padding: '8px 12px' }}
                    onClick={() => removeTransportBullet(idx)}
                  >
                    &times;
                  </button>
                </div>
              ))}

              <button 
                type="button" 
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={addTransportBullet}
                style={{ marginTop: '5px' }}
              >
                + Add Transport Advice Bullet
              </button>
            </div>
          </div>

          {/* EXPLORE INDIA DESTINATIONS */}
          <div className="admin-card">
            <div className="admin-card-title">5. Explore India Destinations</div>
            
            <div className="admin-form-group">
              <label>Section Heading</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.explore.title}
                onChange={(e) => {
                  setContent((prev) => {
                    const updated = { ...prev };
                    updated.explore.title = e.target.value;
                    return updated;
                  });
                }}
              />
            </div>

            <div className="admin-form-group">
              <label>Section Introductory Paragraph</label>
              <textarea 
                className="admin-textarea"
                rows="3"
                value={content.explore.introText}
                onChange={(e) => {
                  setContent((prev) => {
                    const updated = { ...prev };
                    updated.explore.introText = e.target.value;
                    return updated;
                  });
                }}
              />
            </div>

            {/* Destination cards */}
            {content.explore.destinations.map((dest, idx) => (
              <div key={idx} className="array-item-row" style={{ backgroundColor: '#ffffff', border: '1px solid var(--admin-border-color)' }}>
                <div className="array-item-fields">
                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Destination Title</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={dest.title} 
                      onChange={(e) => handleDestinationChange(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '0' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Description (Supports list tags)</label>
                    <textarea 
                      className="admin-textarea" 
                      rows="4" 
                      value={dest.text} 
                      onChange={(e) => handleDestinationChange(idx, 'text', e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
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
                  <span>Save Travel {lang.toUpperCase()}</span>
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
