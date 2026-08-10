import { useState, useEffect } from 'react';
import ImageLibraryModal from '../components/ImageLibraryModal';

export default function AttireEditor() {
  const [pageData, setPageData] = useState(null); // Holds { en, fr } from DB
  const [lang, setLang] = useState('en'); // Active edit language: 'en' or 'fr'
  const [content, setContent] = useState(null); // Active working copy of content
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Media library modal state
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState(null); // e.g. 'hero.bgImage' or 'women.cards.0.image'

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
      const res = await fetch(`${apiURL}/api/pages/attire`);
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

  const handleSectionFieldChange = (section, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated[section] = { ...updated[section], [field]: value };
      return updated;
    });
  };

  const handleHeroFieldChange = (field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.hero = { ...updated.hero, [field]: value };
      return updated;
    });
  };

  // Open Media Library Modal for specific field path
  const triggerImageSelect = (fieldPath) => {
    setActiveImageField(fieldPath);
    setMediaModalOpen(true);
  };

  // Set the selected image URL from Modal back to state field
  const handleImageSelected = (url) => {
    if (!activeImageField) return;
    
    setContent((prev) => {
      const updated = { ...prev };
      const parts = activeImageField.split('.');
      if (parts.length === 2) {
        updated[parts[0]][parts[1]] = url;
      } else if (parts.length === 4) {
        // e.g. sections.women.cards.[idx].image
        const [sect, subSect, cardsKey, idx] = parts;
        updated[sect][subSect][cardsKey][parseInt(idx)].image = url;
      }
      return updated;
    });
    
    setActiveImageField(null);
  };

  // --- Clothing Cards helper ---
  const handleCardChange = (gender, index, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.sections[gender].cards[index][field] = value;
      return updated;
    });
  };

  // --- Shopping List Bullet Item Helpers ---
  const handleShoppingBulletChange = (colIdx, bulletIdx, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.sections.shopping.columns[colIdx].items[bulletIdx] = value;
      return updated;
    });
  };

  const addShoppingBullet = (colIdx) => {
    setContent((prev) => {
      const updated = { ...prev };
      if (!updated.sections.shopping.columns[colIdx].items) {
        updated.sections.shopping.columns[colIdx].items = [];
      }
      updated.sections.shopping.columns[colIdx].items.push('');
      return updated;
    });
  };

  const removeShoppingBullet = (colIdx, bulletIdx) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.sections.shopping.columns[colIdx].items.splice(bulletIdx, 1);
      return updated;
    });
  };

  // --- Shopping Link Helpers (3rd Column) ---
  const handleShoppingLinkChange = (linkIdx, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.sections.shopping.columns[2].links[linkIdx][field] = value;
      return updated;
    });
  };

  const addShoppingLink = () => {
    setContent((prev) => {
      const updated = { ...prev };
      if (!updated.sections.shopping.columns[2].links) {
        updated.sections.shopping.columns[2].links = [];
      }
      updated.sections.shopping.columns[2].links.push({ label: '', url: '' });
      return updated;
    });
  };

  const removeShoppingLink = (linkIdx) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.sections.shopping.columns[2].links.splice(linkIdx, 1);
      return updated;
    });
  };

  // --- Styling tips Helpers ---
  const handleTipChange = (tipIdx, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.sections.styling.tips[tipIdx][field] = value;
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
      const res = await fetch(`${apiURL}/api/pages/attire`, {
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
        setSuccessMsg(`Successfully saved '${lang === 'en' ? 'English' : 'French'}' content for Attire guide.`);
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
        <p>Loading Attire editor data...</p>
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
                <label>Intro description line</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.introText}
                  onChange={(e) => handleFieldChange('introText', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* WOMEN'S WEAR SECTION */}
          <div className="admin-card">
            <div className="admin-card-title">2. Women's Clothing Cards</div>
            <div className="admin-form-group">
              <label>Section Title</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.sections.women.title}
                onChange={(e) => handleSectionFieldChange('women', 'title', e.target.value)}
              />
            </div>

            {content.sections.women.cards.map((card, idx) => (
              <div key={idx} className="array-item-row" style={{ backgroundColor: '#ffffff', border: '1px solid var(--admin-border-color)' }}>
                <div className="array-item-fields">
                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Card Title</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={card.title} 
                      onChange={(e) => handleCardChange('women', idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Card Description</label>
                    <textarea 
                      className="admin-textarea" 
                      rows="3" 
                      value={card.description} 
                      onChange={(e) => handleCardChange('women', idx, 'description', e.target.value)}
                    ></textarea>
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '0' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Card Image</label>
                    <div className="admin-image-preview-container">
                      <img 
                        src={card.image.startsWith('/assets') ? card.image : `${apiURL}${card.image}`} 
                        alt={card.title} 
                        className="admin-image-preview"
                      />
                      <button 
                        type="button" 
                        className="admin-btn admin-btn-accent admin-btn-sm"
                        onClick={() => triggerImageSelect(`sections.women.cards.${idx}.image`)}
                      >
                        Change Card Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MEN'S WEAR SECTION */}
          <div className="admin-card">
            <div className="admin-card-title">3. Men's Clothing Cards</div>
            <div className="admin-form-group">
              <label>Section Title</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.sections.men.title}
                onChange={(e) => handleSectionFieldChange('men', 'title', e.target.value)}
              />
            </div>

            {content.sections.men.cards.map((card, idx) => (
              <div key={idx} className="array-item-row" style={{ backgroundColor: '#ffffff', border: '1px solid var(--admin-border-color)' }}>
                <div className="array-item-fields">
                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Card Title</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={card.title} 
                      onChange={(e) => handleCardChange('men', idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Card Description</label>
                    <textarea 
                      className="admin-textarea" 
                      rows="3" 
                      value={card.description} 
                      onChange={(e) => handleCardChange('men', idx, 'description', e.target.value)}
                    ></textarea>
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '0' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Card Image</label>
                    <div className="admin-image-preview-container">
                      <img 
                        src={card.image.startsWith('/assets') ? card.image : `${apiURL}${card.image}`} 
                        alt={card.title} 
                        className="admin-image-preview"
                      />
                      <button 
                        type="button" 
                        className="admin-btn admin-btn-accent admin-btn-sm"
                        onClick={() => triggerImageSelect(`sections.men.cards.${idx}.image`)}
                      >
                        Change Card Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* WHERE TO BUY SECTION */}
          <div className="admin-card">
            <div className="admin-card-title">4. Where to Buy in Delhi</div>
            <div className="admin-form-group">
              <label>Section Title</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.sections.shopping.title}
                onChange={(e) => handleSectionFieldChange('shopping', 'title', e.target.value)}
              />
            </div>

            <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {/* Column 1: Shopping Markets */}
              <div style={{ padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fafafb' }}>
                <h6 style={{ fontWeight: 700, margin: '0 0 12px 0' }}>Column 1: Markets</h6>
                <div className="admin-form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.78rem' }}>Header Title</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.sections.shopping.columns[0].title}
                    onChange={(e) => {
                      setContent((prev) => {
                        const updated = { ...prev };
                        updated.sections.shopping.columns[0].title = e.target.value;
                        return updated;
                      });
                    }}
                  />
                </div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Markets list:</label>
                {content.sections.shopping.columns[0].items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      className="admin-input" 
                      style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                      value={item}
                      onChange={(e) => handleShoppingBulletChange(0, idx, e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      style={{ padding: '6px 10px' }}
                      onClick={() => removeShoppingBullet(0, idx)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => addShoppingBullet(0)}
                  style={{ width: '100%', marginTop: '5px' }}
                >
                  + Add Market
                </button>
              </div>

              {/* Column 2: Renowned Shops */}
              <div style={{ padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fafafb' }}>
                <h6 style={{ fontWeight: 700, margin: '0 0 12px 0' }}>Column 2: Shops</h6>
                <div className="admin-form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.78rem' }}>Header Title</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.sections.shopping.columns[1].title}
                    onChange={(e) => {
                      setContent((prev) => {
                        const updated = { ...prev };
                        updated.sections.shopping.columns[1].title = e.target.value;
                        return updated;
                      });
                    }}
                  />
                </div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Shops list (Supports strong tags):</label>
                {content.sections.shopping.columns[1].items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      className="admin-input" 
                      style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                      value={item}
                      onChange={(e) => handleShoppingBulletChange(1, idx, e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      style={{ padding: '6px 10px' }}
                      onClick={() => removeShoppingBullet(1, idx)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => addShoppingBullet(1)}
                  style={{ width: '100%', marginTop: '5px' }}
                >
                  + Add Shop
                </button>
              </div>

              {/* Column 3: Recommended Websites */}
              <div style={{ padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fafafb' }}>
                <h6 style={{ fontWeight: 700, margin: '0 0 12px 0' }}>Column 3: Websites</h6>
                <div className="admin-form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.78rem' }}>Header Title</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.sections.shopping.columns[2].title}
                    onChange={(e) => {
                      setContent((prev) => {
                        const updated = { ...prev };
                        updated.sections.shopping.columns[2].title = e.target.value;
                        return updated;
                      });
                    }}
                  />
                </div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Web links list:</label>
                {content.sections.shopping.columns[2].links.map((link, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '4px' }}>
                      <input 
                        type="text" 
                        className="admin-input" 
                        style={{ padding: '4px 6px', fontSize: '0.78rem' }}
                        value={link.label}
                        placeholder="Label (e.g. Koskii)"
                        onChange={(e) => handleShoppingLinkChange(idx, 'label', e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        style={{ padding: '4px 6px' }}
                        onClick={() => removeShoppingLink(idx)}
                      >
                        &times;
                      </button>
                    </div>
                    <input 
                      type="text" 
                      className="admin-input" 
                      style={{ padding: '4px 6px', fontSize: '0.78rem' }}
                      value={link.url}
                      placeholder="URL (e.g. https://...)"
                      onChange={(e) => handleShoppingLinkChange(idx, 'url', e.target.value)}
                    />
                  </div>
                ))}
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={addShoppingLink}
                  style={{ width: '100%', marginTop: '5px' }}
                >
                  + Add Link
                </button>
              </div>
            </div>
          </div>

          {/* STYLING ADVICE & WARNING ALERTS */}
          <div className="admin-card">
            <div className="admin-card-title">5. Styling Advice & Guidelines</div>
            <div className="admin-form-group">
              <label>Section Header Title</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.sections.styling.title}
                onChange={(e) => {
                  setContent((prev) => {
                    const updated = { ...prev };
                    updated.sections.styling.title = e.target.value;
                    return updated;
                  });
                }}
              />
            </div>

            {/* General Advice blocks */}
            {content.sections.styling.tips.map((tip, idx) => (
              <div key={idx} style={{ padding: '12px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', marginBottom: '15px', backgroundColor: '#fcfcfd' }}>
                <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Tip Heading</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    value={tip.heading}
                    onChange={(e) => handleTipChange(idx, 'heading', e.target.value)}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: '0' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Tip Description Text</label>
                  <textarea 
                    className="admin-textarea" 
                    rows="3" 
                    value={tip.text}
                    onChange={(e) => handleTipChange(idx, 'text', e.target.value)}
                  ></textarea>
                </div>
              </div>
            ))}

            {/* Warning Alert Box */}
            <div style={{ padding: '12px', border: '1px solid #fca5a5', borderRadius: '6px', backgroundColor: '#fef2f2', marginBottom: '15px' }}>
              <h6 style={{ color: 'var(--admin-danger)', fontWeight: 700, margin: '0 0 10px 0' }}>Warning: Color Taboos Alert</h6>
              <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>Alert Title</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.sections.styling.warnings.title}
                  onChange={(e) => {
                    setContent((prev) => {
                      const updated = { ...prev };
                      updated.sections.styling.warnings.title = e.target.value;
                      return updated;
                    });
                  }}
                />
              </div>
              <div className="admin-form-group" style={{ marginBottom: '0' }}>
                <label style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>Alert HTML/Text Content</label>
                <textarea 
                  className="admin-textarea" 
                  rows="3" 
                  value={content.sections.styling.warnings.text}
                  onChange={(e) => {
                    setContent((prev) => {
                      const updated = { ...prev };
                      updated.sections.styling.warnings.text = e.target.value;
                      return updated;
                    });
                  }}
                ></textarea>
              </div>
            </div>

            {/* Info Alert Box */}
            <div style={{ padding: '12px', border: '1px solid #7dd3fc', borderRadius: '6px', backgroundColor: '#f0f9ff' }}>
              <h6 style={{ color: '#0369a1', fontWeight: 700, margin: '0 0 10px 0' }}>Info: Gurudwara Requirements Alert</h6>
              <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: '#0c4a6e' }}>Alert Title</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.sections.styling.infos.title}
                  onChange={(e) => {
                    setContent((prev) => {
                      const updated = { ...prev };
                      updated.sections.styling.infos.title = e.target.value;
                      return updated;
                    });
                  }}
                />
              </div>
              <div className="admin-form-group" style={{ marginBottom: '0' }}>
                <label style={{ fontSize: '0.8rem', color: '#0c4a6e' }}>Alert Description Text</label>
                <textarea 
                  className="admin-textarea" 
                  rows="3" 
                  value={content.sections.styling.infos.text}
                  onChange={(e) => {
                    setContent((prev) => {
                      const updated = { ...prev };
                      updated.sections.styling.infos.text = e.target.value;
                      return updated;
                    });
                  }}
                ></textarea>
              </div>
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
                  <span>Save Attire {lang.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Image selector library */}
      <ImageLibraryModal 
        isOpen={mediaModalOpen} 
        onClose={() => setMediaModalOpen(false)} 
        onSelect={handleImageSelected}
        currentValue={activeImageField ? activeImageField.split('.').reduce((o, oKey) => {
          if (oKey.includes('[')) {
            // Parse nested lists
            const [arrayName, indexStr] = oKey.split(/[\[\]]/).filter(Boolean);
            return o[arrayName][parseInt(indexStr)];
          }
          return o[oKey];
        }, content) : null}
      />
    </div>
  );
}
