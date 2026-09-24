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

  // Accommodation filtering & search state
  const [accomCityFilter, setAccomCityFilter] = useState('all');
  const [accomCategoryFilter, setAccomCategoryFilter] = useState('all');
  const [accomSearch, setAccomSearch] = useState('');

  // Accommodation Add/Edit modal state
  const [isAccomModalOpen, setIsAccomModalOpen] = useState(false);
  const [editingAccomId, setEditingAccomId] = useState(null);
  const [accomForm, setAccomForm] = useState({
    city: 'delhi',
    category: 'hotel',
    nameEn: '',
    nameFr: '',
    stars: '',
    descriptionEn: '',
    descriptionFr: '',
    location: '',
    image: '',
    link: '',
    order: 1,
    active: true
  });

  // Airbnb new area input state
  const [newAirbnbArea, setNewAirbnbArea] = useState('');

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
    if (activeImageField === 'accomForm.image') {
      setAccomForm((prev) => ({ ...prev, image: url }));
      setActiveImageField(null);
      return;
    }
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

  // --- Accommodation Recommendation CRUD Helpers ---
  const handleOpenAddAccom = () => {
    const currentRecs = content?.accommodation?.recommendations || [];
    setEditingAccomId(null);
    setAccomForm({
      city: accomCityFilter !== 'all' ? accomCityFilter : 'delhi',
      category: accomCategoryFilter !== 'all' ? accomCategoryFilter : 'hotel',
      nameEn: '',
      nameFr: '',
      stars: '',
      descriptionEn: '',
      descriptionFr: '',
      location: '',
      image: '',
      link: '',
      order: currentRecs.length + 1,
      active: true
    });
    setIsAccomModalOpen(true);
  };

  const handleOpenEditAccom = (item) => {
    setEditingAccomId(item.id);
    const altLang = lang === 'en' ? 'fr' : 'en';
    const altRecs = pageData?.[altLang]?.accommodation?.recommendations || [];
    const altItem = altRecs.find((r) => r.id === item.id);

    setAccomForm({
      city: item.city || 'delhi',
      category: item.category || 'hotel',
      nameEn: lang === 'en' ? item.name : altItem?.name || item.name,
      nameFr: lang === 'fr' ? item.name : altItem?.name || item.name,
      stars: item.stars !== null && item.stars !== undefined ? String(item.stars) : '',
      descriptionEn: lang === 'en' ? item.description || '' : altItem?.description || '',
      descriptionFr: lang === 'fr' ? item.description || '' : altItem?.description || '',
      location: item.location || '',
      image: item.image || '',
      link: item.link || '',
      order: item.order !== undefined ? item.order : 1,
      active: item.active !== undefined ? item.active : true
    });
    setIsAccomModalOpen(true);
  };

  const handleSaveAccomModal = () => {
    if (!accomForm.nameEn.trim()) {
      alert('Property Name is required (English)');
      return;
    }

    const parsedStars = accomForm.stars !== '' ? Number(accomForm.stars) : null;
    const parsedOrder = Number(accomForm.order) || 1;

    setContent((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated.accommodation) updated.accommodation = {};
      if (!updated.accommodation.recommendations) updated.accommodation.recommendations = [];

      const targetRecs = updated.accommodation.recommendations;

      if (editingAccomId) {
        const idx = targetRecs.findIndex((r) => r.id === editingAccomId);
        if (idx !== -1) {
          targetRecs[idx] = {
            ...targetRecs[idx],
            city: accomForm.city,
            category: accomForm.category,
            name: lang === 'en' ? accomForm.nameEn : (accomForm.nameFr || accomForm.nameEn),
            stars: parsedStars,
            description: lang === 'en' ? accomForm.descriptionEn : (accomForm.descriptionFr || accomForm.descriptionEn),
            location: accomForm.location,
            image: accomForm.image,
            link: accomForm.link,
            order: parsedOrder,
            active: accomForm.active
          };
        }
      } else {
        const newId = `${accomForm.city}-${accomForm.category}-${Date.now()}`;
        targetRecs.push({
          id: newId,
          city: accomForm.city,
          category: accomForm.category,
          name: lang === 'en' ? accomForm.nameEn : (accomForm.nameFr || accomForm.nameEn),
          stars: parsedStars,
          description: lang === 'en' ? accomForm.descriptionEn : (accomForm.descriptionFr || accomForm.descriptionEn),
          location: accomForm.location,
          image: accomForm.image,
          link: accomForm.link,
          order: parsedOrder,
          active: accomForm.active
        });
      }

      return updated;
    });

    setPageData((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      const altLang = lang === 'en' ? 'fr' : 'en';
      if (!updated[altLang]) updated[altLang] = {};
      if (!updated[altLang].accommodation) updated[altLang].accommodation = {};
      if (!updated[altLang].accommodation.recommendations) updated[altLang].accommodation.recommendations = [];

      const altRecs = updated[altLang].accommodation.recommendations;

      if (editingAccomId) {
        const altIdx = altRecs.findIndex((r) => r.id === editingAccomId);
        if (altIdx !== -1) {
          altRecs[altIdx] = {
            ...altRecs[altIdx],
            city: accomForm.city,
            category: accomForm.category,
            name: altLang === 'en' ? accomForm.nameEn : (accomForm.nameFr || accomForm.nameEn),
            stars: parsedStars,
            description: altLang === 'en' ? accomForm.descriptionEn : (accomForm.descriptionFr || accomForm.descriptionEn),
            location: accomForm.location,
            image: accomForm.image,
            link: accomForm.link,
            order: parsedOrder,
            active: accomForm.active
          };
        }
      } else {
        const newId = `${accomForm.city}-${accomForm.category}-${Date.now()}`;
        altRecs.push({
          id: newId,
          city: accomForm.city,
          category: accomForm.category,
          name: altLang === 'en' ? accomForm.nameEn : (accomForm.nameFr || accomForm.nameEn),
          stars: parsedStars,
          description: altLang === 'en' ? accomForm.descriptionEn : (accomForm.descriptionFr || accomForm.descriptionEn),
          location: accomForm.location,
          image: accomForm.image,
          link: accomForm.link,
          order: parsedOrder,
          active: accomForm.active
        });
      }

      return updated;
    });

    setIsAccomModalOpen(false);
  };

  const handleToggleAccomActive = (itemId) => {
    setContent((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const recs = updated.accommodation?.recommendations || [];
      const item = recs.find((r) => r.id === itemId);
      if (item) {
        item.active = !item.active;
      }
      return updated;
    });

    setPageData((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      const altLang = lang === 'en' ? 'fr' : 'en';
      const altRecs = updated[altLang]?.accommodation?.recommendations || [];
      const altItem = altRecs.find((r) => r.id === itemId);
      if (altItem) {
        altItem.active = !altItem.active;
      }
      return updated;
    });
  };

  const handleDeleteAccom = (itemId) => {
    if (!window.confirm('Are you sure you want to delete this accommodation recommendation?')) {
      return;
    }

    setContent((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.accommodation?.recommendations) {
        updated.accommodation.recommendations = updated.accommodation.recommendations.filter(
          (r) => r.id !== itemId
        );
      }
      return updated;
    });

    setPageData((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      const altLang = lang === 'en' ? 'fr' : 'en';
      if (updated[altLang]?.accommodation?.recommendations) {
        updated[altLang].accommodation.recommendations = updated[altLang].accommodation.recommendations.filter(
          (r) => r.id !== itemId
        );
      }
      return updated;
    });
  };

  const handleAccomOrderChange = (itemId, newOrder) => {
    const orderNum = parseInt(newOrder, 10);
    if (isNaN(orderNum)) return;

    setContent((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const item = (updated.accommodation?.recommendations || []).find((r) => r.id === itemId);
      if (item) {
        item.order = orderNum;
      }
      return updated;
    });

    setPageData((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      const altLang = lang === 'en' ? 'fr' : 'en';
      const altItem = (updated[altLang]?.accommodation?.recommendations || []).find((r) => r.id === itemId);
      if (altItem) {
        altItem.order = orderNum;
      }
      return updated;
    });
  };

  const handleAddAirbnbArea = () => {
    if (!newAirbnbArea.trim()) return;
    setContent((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated.accommodation.delhi) updated.accommodation.delhi = {};
      if (!updated.accommodation.delhi.airbnb) updated.accommodation.delhi.airbnb = {};
      if (!updated.accommodation.delhi.airbnb.recommendedAreas) {
        updated.accommodation.delhi.airbnb.recommendedAreas = [];
      }
      updated.accommodation.delhi.airbnb.recommendedAreas.push(newAirbnbArea.trim());
      return updated;
    });
    setNewAirbnbArea('');
  };

  const handleRemoveAirbnbArea = (idx) => {
    setContent((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.accommodation?.delhi?.airbnb?.recommendedAreas) {
        updated.accommodation.delhi.airbnb.recommendedAreas.splice(idx, 1);
      }
      return updated;
    });
  };

  const handleEditAirbnbArea = (idx, value) => {
    setContent((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.accommodation?.delhi?.airbnb?.recommendedAreas) {
        updated.accommodation.delhi.airbnb.recommendedAreas[idx] = value;
      }
      return updated;
    });
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
            <div className="admin-card-title">
              <span>3. Accommodations & Venue Bookings</span>
            </div>
            
            {/* General Accommodation Title & Subtitle */}
            <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="admin-form-group">
                <label>Section Heading (e.g. "Where to Stay")</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.accommodation?.title || ''}
                  onChange={(e) => {
                    setContent((prev) => {
                      const updated = { ...prev };
                      if (!updated.accommodation) updated.accommodation = {};
                      updated.accommodation.title = e.target.value;
                      return updated;
                    });
                  }}
                />
              </div>

              <div className="admin-form-group">
                <label>Section Subtitle</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.accommodation?.subtitle || ''}
                  onChange={(e) => {
                    setContent((prev) => {
                      const updated = { ...prev };
                      if (!updated.accommodation) updated.accommodation = {};
                      updated.accommodation.subtitle = e.target.value;
                      return updated;
                    });
                  }}
                />
              </div>
            </div>

            {/* City Settings Side-by-Side: Delhi & Jaipur */}
            <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '25px' }}>
              {/* Delhi Config */}
              <div style={{ padding: '20px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fafafb' }}>
                <h5 style={{ fontWeight: 700, marginTop: 0, color: 'var(--admin-primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  <i className="fa-solid fa-map-pin me-2" style={{ color: 'var(--admin-accent)' }}></i> Delhi Accommodation Settings
                </h5>
                <div className="admin-form-group">
                  <label>City Section Title</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.accommodation?.delhi?.title || ''}
                    onChange={(e) => handleAccommodationFieldChange('delhi', 'title', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>City Section Subtitle</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.accommodation?.delhi?.subtitle || ''}
                    onChange={(e) => handleAccommodationFieldChange('delhi', 'subtitle', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Introductory Text (HTML Enabled)</label>
                  <textarea 
                    className="admin-textarea"
                    rows="3"
                    value={content.accommodation?.delhi?.text || ''}
                    onChange={(e) => handleAccommodationFieldChange('delhi', 'text', e.target.value)}
                  />
                </div>

                {/* Delhi Airbnb Settings */}
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ffffff', border: '1px solid var(--admin-border-color)', borderRadius: '6px' }}>
                  <h6 style={{ fontWeight: 700, marginTop: 0, color: 'var(--admin-accent)' }}>
                    <i className="fa-brands fa-airbnb me-2"></i> Airbnb Settings & Recommendations
                  </h6>
                  <div className="admin-form-group">
                    <label style={{ fontSize: '0.8rem' }}>Airbnb Section Title</label>
                    <input 
                      type="text" 
                      className="admin-input"
                      value={content.accommodation?.delhi?.airbnb?.title || ''}
                      onChange={(e) => {
                        setContent((prev) => {
                          const updated = { ...prev };
                          if (!updated.accommodation.delhi.airbnb) updated.accommodation.delhi.airbnb = {};
                          updated.accommodation.delhi.airbnb.title = e.target.value;
                          return updated;
                        });
                      }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label style={{ fontSize: '0.8rem' }}>Airbnb Intro Text</label>
                    <textarea 
                      className="admin-textarea"
                      rows="2"
                      value={content.accommodation?.delhi?.airbnb?.introText || ''}
                      onChange={(e) => {
                        setContent((prev) => {
                          const updated = { ...prev };
                          if (!updated.accommodation.delhi.airbnb) updated.accommodation.delhi.airbnb = {};
                          updated.accommodation.delhi.airbnb.introText = e.target.value;
                          return updated;
                        });
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label style={{ fontSize: '0.8rem' }}>Recommended Areas (Interactive Tags):</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      {(content.accommodation?.delhi?.airbnb?.recommendedAreas || []).map((area, aIdx) => (
                        <span 
                          key={aIdx} 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            backgroundColor: '#f1f5f9', 
                            padding: '4px 10px', 
                            borderRadius: '16px', 
                            fontSize: '0.8rem',
                            border: '1px solid #cbd5e1'
                          }}
                        >
                          <input
                            type="text"
                            value={area}
                            onChange={(e) => handleEditAirbnbArea(aIdx, e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', width: `${Math.max(area.length * 8, 80)}px` }}
                          />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveAirbnbArea(aIdx)} 
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}
                            title="Remove area"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        className="admin-input" 
                        placeholder="Add new recommended area (e.g. Green Park)..."
                        value={newAirbnbArea}
                        onChange={(e) => setNewAirbnbArea(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAirbnbArea(); } }}
                      />
                      <button 
                        type="button" 
                        className="admin-btn admin-btn-secondary admin-btn-sm" 
                        onClick={handleAddAirbnbArea}
                      >
                        + Add Area
                      </button>
                    </div>
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem' }}>Client Recommendation Note for Delhi</label>
                    <textarea 
                      className="admin-textarea"
                      rows="3"
                      placeholder="Client recommendation note..."
                      value={content.accommodation?.delhi?.note || ''}
                      onChange={(e) => handleAccommodationFieldChange('delhi', 'note', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Jaipur Config */}
              <div style={{ padding: '20px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fafafb' }}>
                <h5 style={{ fontWeight: 700, marginTop: 0, color: 'var(--admin-primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  <i className="fa-solid fa-bed me-2" style={{ color: 'var(--admin-accent)' }}></i> Jaipur Accommodation Settings
                </h5>
                <div className="admin-form-group">
                  <label>City Section Title</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.accommodation?.jaipur?.title || ''}
                    onChange={(e) => handleAccommodationFieldChange('jaipur', 'title', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>City Section Subtitle</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.accommodation?.jaipur?.subtitle || ''}
                    onChange={(e) => handleAccommodationFieldChange('jaipur', 'subtitle', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Introductory Text (HTML Enabled)</label>
                  <textarea 
                    className="admin-textarea"
                    rows="3"
                    value={content.accommodation?.jaipur?.text || ''}
                    onChange={(e) => handleAccommodationFieldChange('jaipur', 'text', e.target.value)}
                  />
                </div>

                <div className="admin-form-group" style={{ marginTop: '20px' }}>
                  <label style={{ fontSize: '0.8rem' }}>Client Recommendation Note for Jaipur</label>
                  <textarea 
                    className="admin-textarea"
                    rows="4"
                    placeholder="Client recommendation note for Jaipur..."
                    value={content.accommodation?.jaipur?.note || ''}
                    onChange={(e) => handleAccommodationFieldChange('jaipur', 'note', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Accommodation Recommendations List (Hotels & Home Stays) Manager */}
            <div style={{ padding: '22px', border: '1px solid var(--admin-border-color)', borderRadius: '8px', backgroundColor: '#ffffff', marginBottom: '25px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--admin-primary)', fontSize: '1.15rem' }}>
                    <i className="fa-solid fa-hotel me-2" style={{ color: 'var(--admin-accent)' }}></i>
                    Accommodation Recommendations (Hotels & Home Stays)
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                    Manage hotel & homestay entries, star ratings, active states, and display orders.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="admin-btn admin-btn-accent"
                  onClick={handleOpenAddAccom}
                  style={{ padding: '8px 18px' }}
                >
                  <i className="fa-solid fa-plus me-1"></i> Add Accommodation
                </button>
              </div>

              {/* Filters toolbar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--admin-border-color)', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>City:</span>
                  <select 
                    className="admin-select" 
                    style={{ width: '130px', padding: '6px 10px', fontSize: '0.85rem' }}
                    value={accomCityFilter} 
                    onChange={(e) => setAccomCityFilter(e.target.value)}
                  >
                    <option value="all">All Cities</option>
                    <option value="delhi">Delhi</option>
                    <option value="jaipur">Jaipur</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Category:</span>
                  <select 
                    className="admin-select" 
                    style={{ width: '170px', padding: '6px 10px', fontSize: '0.85rem' }}
                    value={accomCategoryFilter} 
                    onChange={(e) => setAccomCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="bnb">B&B / Home Stays</option>
                    <option value="hotel">Hotels</option>
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <input 
                    type="text" 
                    className="admin-input" 
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    placeholder="Search property name or location..."
                    value={accomSearch}
                    onChange={(e) => setAccomSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Recommendations Table */}
              {(() => {
                const allRecs = content.accommodation?.recommendations || [];
                const filtered = allRecs
                  .filter((item) => {
                    if (accomCityFilter !== 'all' && item.city.toLowerCase() !== accomCityFilter.toLowerCase()) return false;
                    if (accomCategoryFilter !== 'all' && item.category.toLowerCase() !== accomCategoryFilter.toLowerCase()) return false;
                    if (accomSearch.trim()) {
                      const q = accomSearch.toLowerCase();
                      const matchName = (item.name || '').toLowerCase().includes(q);
                      const matchLoc = (item.location || '').toLowerCase().includes(q);
                      if (!matchName && !matchLoc) return false;
                    }
                    return true;
                  })
                  .sort((a, b) => (a.order || 0) - (b.order || 0));

                if (filtered.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '35px', color: 'var(--admin-text-muted)' }}>
                      <i className="fa-solid fa-hotel fa-2x mb-2" style={{ display: 'block' }}></i>
                      No accommodations found matching the selected filters.
                    </div>
                  );
                }

                return (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--admin-border-color)', color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '10px 8px', width: '70px' }}>Order</th>
                          <th style={{ padding: '10px 8px', width: '80px' }}>Status</th>
                          <th style={{ padding: '10px 8px' }}>Property Name</th>
                          <th style={{ padding: '10px 8px', width: '100px' }}>City</th>
                          <th style={{ padding: '10px 8px', width: '140px' }}>Category</th>
                          <th style={{ padding: '10px 8px', width: '110px' }}>Rating</th>
                          <th style={{ padding: '10px 8px', width: '120px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--admin-border-color)' }}>
                            <td style={{ padding: '10px 8px' }}>
                              <input 
                                type="number" 
                                className="admin-input" 
                                style={{ width: '60px', padding: '4px 6px', fontSize: '0.82rem', textAlign: 'center' }}
                                value={item.order !== undefined ? item.order : 0}
                                onChange={(e) => handleAccomOrderChange(item.id, e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleAccomActive(item.id)}
                                style={{
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  backgroundColor: item.active !== false ? '#dcfce7' : '#fee2e2',
                                  color: item.active !== false ? '#15803d' : '#b91c1c'
                                }}
                                title="Click to toggle status"
                              >
                                {item.active !== false ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              <strong style={{ color: 'var(--admin-primary)', fontSize: '0.92rem' }}>{item.name}</strong>
                              {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', color: 'var(--admin-accent)', fontSize: '0.75rem' }}>
                                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                </a>
                              )}
                              {item.description && (
                                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{item.description}</div>
                              )}
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              <span style={{ 
                                padding: '3px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                backgroundColor: item.city === 'delhi' ? '#e0f2fe' : '#fef3c7',
                                color: item.city === 'delhi' ? '#0369a1' : '#b45309',
                                textTransform: 'capitalize'
                              }}>
                                {item.city}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                                {item.category === 'bnb' ? 'B&B / Homestay' : 'Hotel'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              {item.stars ? (
                                <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.82rem' }}>
                                  {'★'.repeat(item.stars)} ({item.stars}*)
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                              )}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                              <button 
                                type="button" 
                                className="admin-btn admin-btn-secondary admin-btn-sm"
                                style={{ padding: '4px 8px', marginRight: '6px' }}
                                onClick={() => handleOpenEditAccom(item)}
                                title="Edit accommodation"
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button 
                                type="button" 
                                className="admin-btn admin-btn-danger admin-btn-sm"
                                style={{ padding: '4px 8px' }}
                                onClick={() => handleDeleteAccom(item.id)}
                                title="Delete accommodation"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
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

      {/* Accommodation Add / Edit Modal */}
      {isAccomModalOpen && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={modalHeaderStyle}>
              <h5 style={{ margin: 0, fontWeight: 700, color: 'var(--admin-primary)' }}>
                {editingAccomId ? 'Edit Accommodation' : 'Add New Accommodation'}
              </h5>
              <button
                type="button"
                onClick={() => setIsAccomModalOpen(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>City *</label>
                  <select
                    className="admin-select"
                    value={accomForm.city}
                    onChange={(e) => setAccomForm({ ...accomForm, city: e.target.value })}
                  >
                    <option value="delhi">Delhi</option>
                    <option value="jaipur">Jaipur</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Category *</label>
                  <select
                    className="admin-select"
                    value={accomForm.category}
                    onChange={(e) => setAccomForm({ ...accomForm, category: e.target.value })}
                  >
                    <option value="bnb">Bed & Breakfast / Home Stays</option>
                    <option value="hotel">Hotels</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Property Name (English) *</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Lutyens Bungalow"
                    value={accomForm.nameEn}
                    onChange={(e) => setAccomForm({ ...accomForm, nameEn: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Property Name (French)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Leave blank to use English name"
                    value={accomForm.nameFr}
                    onChange={(e) => setAccomForm({ ...accomForm, nameFr: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Star Rating (where applicable)</label>
                  <select
                    className="admin-select"
                    value={accomForm.stars}
                    onChange={(e) => setAccomForm({ ...accomForm, stars: e.target.value })}
                  >
                    <option value="">No Star Rating</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={accomForm.order}
                    onChange={(e) => setAccomForm({ ...accomForm, order: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Description (English, optional)</label>
                  <textarea
                    className="admin-textarea"
                    rows="2"
                    placeholder="Brief description..."
                    value={accomForm.descriptionEn}
                    onChange={(e) => setAccomForm({ ...accomForm, descriptionEn: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Description (French, optional)</label>
                  <textarea
                    className="admin-textarea"
                    rows="2"
                    placeholder="Description en français..."
                    value={accomForm.descriptionFr}
                    onChange={(e) => setAccomForm({ ...accomForm, descriptionFr: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Location / Area (optional)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. South Delhi, Raja Park"
                    value={accomForm.location}
                    onChange={(e) => setAccomForm({ ...accomForm, location: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>External URL / Website (optional)</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://..."
                    value={accomForm.link}
                    onChange={(e) => setAccomForm({ ...accomForm, link: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Image URL (optional)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="/assets/images/... or https://..."
                    value={accomForm.image}
                    onChange={(e) => setAccomForm({ ...accomForm, image: e.target.value })}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => triggerImageSelect('accomForm.image')}
                  >
                    Select Image
                  </button>
                </div>
                {accomForm.image && (
                  <div style={{ marginTop: '8px' }}>
                    <img
                      src={getImageUrl(accomForm.image)}
                      alt="Preview"
                      style={{ height: '60px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={accomForm.active}
                    onChange={(e) => setAccomForm({ ...accomForm, active: e.target.checked })}
                  />
                  <span>Active (Display publicly on website)</span>
                </label>
              </div>
            </div>

            <div style={modalFooterStyle}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setIsAccomModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-accent"
                onClick={handleSaveAccomModal}
              >
                {editingAccomId ? 'Save Changes' : 'Add Accommodation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery select */}
      <ImageLibraryModal 
        isOpen={mediaModalOpen} 
        onClose={() => setMediaModalOpen(false)} 
        onSelect={handleImageSelected}
        currentValue={activeImageField ? (activeImageField === 'accomForm.image' ? accomForm.image : activeImageField.split('.').reduce((o, i) => o[i], content)) : null}
      />
    </div>
  );
}

// Modal styles
const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  backdropFilter: 'blur(2px)'
};

const modalContentStyle = {
  backgroundColor: '#fff',
  width: '90%',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
};

const modalHeaderStyle = {
  padding: '16px 20px',
  borderBottom: '1px solid var(--admin-border-color)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const modalFooterStyle = {
  padding: '16px 20px',
  borderTop: '1px solid var(--admin-border-color)',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px'
};
