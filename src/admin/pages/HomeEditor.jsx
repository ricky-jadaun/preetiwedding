import { useState, useEffect } from 'react';
import ImageLibraryModal from '../components/ImageLibraryModal';

export default function HomeEditor() {
  const [pageData, setPageData] = useState(null); // Holds { en, fr } from DB
  const [lang, setLang] = useState('en'); // Active edit language: 'en' or 'fr'
  const [content, setContent] = useState(null); // Active working copy of content
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Media library modal state
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState(null); // e.g. 'hero.logo' or 'story.image'

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
      const res = await fetch(`${apiURL}/api/pages/home`);
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

  const handleFieldChange = (section, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      if (!section) {
        updated[field] = value;
      } else {
        updated[section] = { ...updated[section], [field] : value };
      }
      return updated;
    });
  };

  const handleNestedFieldChange = (section, subSection, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated[section][subSection] = { 
        ...updated[section][subSection], 
        [field]: value 
      };
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
      } else if (parts.length === 3) {
        // e.g. attireSection.image
        updated[parts[0]][parts[1]] = url;
      }
      return updated;
    });
    
    setActiveImageField(null);
  };

  // --- Story Paragraph Array Helpers ---
  const handleParagraphChange = (index, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.story.paragraphs[index] = value;
      return updated;
    });
  };

  const addParagraph = () => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.story.paragraphs.push('');
      return updated;
    });
  };

  const removeParagraph = (index) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.story.paragraphs.splice(index, 1);
      return updated;
    });
  };

  // --- Itinerary Day & Card Helpers ---
  const handleDayLabelChange = (dayIdx, val) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.itinerary.days[dayIdx].tabLabel = val;
      return updated;
    });
  };

  const handleCardChange = (dayIdx, cardIdx, field, val) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.itinerary.days[dayIdx].cards[cardIdx][field] = val;
      return updated;
    });
  };

  const addItineraryCard = (dayIdx) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.itinerary.days[dayIdx].cards.push({
        time: '',
        location: '',
        title: '',
        description: '',
        link1Url: '',
        link1Label: '',
        link2Url: '',
        link2Label: '',
        link3Url: '',
        link3Label: ''
      });
      return updated;
    });
  };

  const removeItineraryCard = (dayIdx, cardIdx) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.itinerary.days[dayIdx].cards.splice(cardIdx, 1);
      return updated;
    });
  };

  // --- FAQ Array Helpers ---
  const handleFaqChange = (index, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.faqSection.faqs[index][field] = value;
      return updated;
    });
  };

  const addFaq = () => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.faqSection.faqs.push({ q: '', a: '' });
      return updated;
    });
  };

  const removeFaq = (index) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.faqSection.faqs.splice(index, 1);
      return updated;
    });
  };

  // --- Contacts List Helpers ---
  const handleContactChange = (index, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.contactsSection.contacts[index][field] = value;
      return updated;
    });
  };

  // --- Gift Bank Cards Helpers ---
  const handleGiftCardChange = (index, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.giftsSection.accounts[index][field] = value;
      return updated;
    });
  };

  const handleGiftDetailChange = (accountIdx, detailIdx, field, value) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated.giftsSection.accounts[accountIdx].details[detailIdx][field] = value;
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
      const res = await fetch(`${apiURL}/api/pages/home`, {
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
        setSuccessMsg(`Successfully saved '${lang === 'en' ? 'English' : 'French'}' content for Home page.`);
        // Update local pageData cache
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
        <p>Loading Home editor data...</p>
      </div>
    );
  }

  if (error && !content) {
    return <div className="admin-alert admin-alert-danger">{error}</div>;
  }

  return (
    <div>
      {/* Save Alerts */}
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
          {/* 1. HERO SECTION */}
          <div className="admin-card">
            <div className="admin-card-title">1. Hero Section Banner</div>
            
            <div className="admin-form-group">
              <label>Hero Names Title</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.hero.title}
                onChange={(e) => handleFieldChange('hero', 'title', e.target.value)}
              />
            </div>

            <div className="row" style={{ display: 'flex', gap: '20px' }}>
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label>Wedding Date Text</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.hero.date}
                  onChange={(e) => handleFieldChange('hero', 'date', e.target.value)}
                />
              </div>
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label>Location Text</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.hero.location}
                  onChange={(e) => handleFieldChange('hero', 'location', e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Countdown Target Date</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.countdownTargetDate}
                onChange={(e) => handleFieldChange(null, 'countdownTargetDate', e.target.value)}
                placeholder="Format: Month DD, YYYY HH:MM:SS GMT+HHMM"
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                Example: February 16, 2027 12:00:00 GMT+0530
              </span>
            </div>

            <div className="admin-form-group">
              <label>Hero Logo Image</label>
              <div className="admin-image-preview-container">
                <img 
                  src={content.hero.logo.startsWith('/assets') ? content.hero.logo : `${apiURL}${content.hero.logo}`} 
                  alt="Hero Logo" 
                  className="admin-image-preview" 
                  onError={(e) => { e.target.src = '/assets/images/p-h-logo.png'; }}
                />
                <div className="admin-image-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-accent admin-btn-sm"
                    onClick={() => triggerImageSelect('hero.logo')}
                  >
                    Change Image
                  </button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                    Current path: {content.hero.logo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. STORY SECTION */}
          <div className="admin-card">
            <div className="admin-card-title">2. Our Story Section</div>

            <div className="admin-form-group">
              <label>Section Title</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.story.title}
                onChange={(e) => handleFieldChange('story', 'title', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Lead Intro Text</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.story.leadText}
                onChange={(e) => handleFieldChange('story', 'leadText', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Section Story Image</label>
              <div className="admin-image-preview-container">
                <img 
                  src={content.story.image.startsWith('/assets') ? content.story.image : `${apiURL}${content.story.image}`} 
                  alt="Story" 
                  className="admin-image-preview"
                />
                <div className="admin-image-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-accent admin-btn-sm"
                    onClick={() => triggerImageSelect('story.image')}
                  >
                    Change Image
                  </button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                    Current path: {content.story.image}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-form-group">
              <label>Story Paragraphs</label>
              {content.story.paragraphs.map((p, idx) => (
                <div key={idx} className="array-item-row">
                  <div className="array-item-fields">
                    <textarea 
                      className="admin-textarea" 
                      rows="3" 
                      value={p}
                      onChange={(e) => handleParagraphChange(idx, e.target.value)}
                    ></textarea>
                  </div>
                  <div className="array-item-actions">
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => removeParagraph(idx)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={addParagraph}
                style={{ marginTop: '10px' }}
              >
                <i className="fa-solid fa-plus"></i> Add Paragraph
              </button>
            </div>
          </div>

          {/* 3. TIMELINE / ITINERARY */}
          <div className="admin-card">
            <div className="admin-card-title">3. Itinerary / Timeline Events</div>

            <div className="admin-form-group">
              <label>Timeline Section Title</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.itinerary.title}
                onChange={(e) => handleFieldChange('itinerary', 'title', e.target.value)}
              />
            </div>

            {content.itinerary.days.map((day, dayIdx) => (
              <div key={day.id} className="admin-card" style={{ backgroundColor: '#fcfcfd', border: '1px solid #d4d6df', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h5 style={{ margin: 0, fontWeight: 700, color: 'var(--admin-primary)' }}>Day Tab: {day.id.toUpperCase()}</h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ margin: 0, fontSize: '0.85rem' }}>Tab Label:</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      style={{ width: '120px', padding: '6px 10px' }} 
                      value={day.tabLabel}
                      onChange={(e) => handleDayLabelChange(dayIdx, e.target.value)}
                    />
                  </div>
                </div>

                {day.cards.map((card, cardIdx) => (
                  <div key={cardIdx} className="array-item-row" style={{ backgroundColor: '#ffffff', border: '1px solid var(--admin-border-color)' }}>
                    <div className="array-item-fields">
                      <div className="row" style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Time (e.g. Morning, 12:00 PM)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={card.time || ''} 
                            onChange={(e) => handleCardChange(dayIdx, cardIdx, 'time', e.target.value)}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Location (e.g. Gurudwara, Poolside)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={card.location || ''} 
                            onChange={(e) => handleCardChange(dayIdx, cardIdx, 'location', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="admin-form-group" style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Event Title</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          value={card.title || ''} 
                          onChange={(e) => handleCardChange(dayIdx, cardIdx, 'title', e.target.value)}
                        />
                      </div>

                      <div className="admin-form-group" style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Description</label>
                        <textarea 
                          className="admin-textarea" 
                          rows="3" 
                          value={card.description || ''} 
                          onChange={(e) => handleCardChange(dayIdx, cardIdx, 'description', e.target.value)}
                        ></textarea>
                      </div>

                      <div className="row" style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Dress Code Badge (Optional)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={card.dressCode || ''} 
                            placeholder="Dress Code: Citrus Tones..."
                            onChange={(e) => handleCardChange(dayIdx, cardIdx, 'dressCode', e.target.value)}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Special Note (Optional)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={card.note || ''} 
                            placeholder="Note: Head covering required..."
                            onChange={(e) => handleCardChange(dayIdx, cardIdx, 'note', e.target.value)}
                          />
                        </div>
                      </div>

                      {dayIdx === 0 && (
                        <div className="row" style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Link Button Label (Optional)</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              value={card.btnText || ''} 
                              onChange={(e) => handleCardChange(dayIdx, cardIdx, 'btnText', e.target.value)}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Link Target Path (e.g. /attire)</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              value={card.btnLink || ''} 
                              onChange={(e) => handleCardChange(dayIdx, cardIdx, 'btnLink', e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {/* 3 External Admin Buttons */}
                      <div style={{ borderTop: '1px dashed #d4d6df', marginTop: '15px', paddingTop: '15px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', color: 'var(--admin-primary)' }}>
                          External Action Buttons (opens in target="_blank") - Optional
                        </div>
                        
                        {/* Button 1 */}
                        <div className="row" style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Button 1 Label</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="e.g. Google Maps"
                              value={card.link1Label || ''} 
                              onChange={(e) => handleCardChange(dayIdx, cardIdx, 'link1Label', e.target.value)}
                            />
                          </div>
                          <div style={{ flex: 2 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Button 1 URL</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="https://maps.google.com/..."
                              value={card.link1Url || ''} 
                              onChange={(e) => handleCardChange(dayIdx, cardIdx, 'link1Url', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Button 2 */}
                        <div className="row" style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Button 2 Label</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="e.g. Venue Booking"
                              value={card.link2Label || ''} 
                              onChange={(e) => handleCardChange(dayIdx, cardIdx, 'link2Label', e.target.value)}
                            />
                          </div>
                          <div style={{ flex: 2 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Button 2 URL</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="https://example.com/..."
                              value={card.link2Url || ''} 
                              onChange={(e) => handleCardChange(dayIdx, cardIdx, 'link2Url', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Button 3 */}
                        <div className="row" style={{ display: 'flex', gap: '15px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Button 3 Label</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="e.g. WhatsApp Group"
                              value={card.link3Label || ''} 
                              onChange={(e) => handleCardChange(dayIdx, cardIdx, 'link3Label', e.target.value)}
                            />
                          </div>
                          <div style={{ flex: 2 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Button 3 URL</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="https://chat.whatsapp.com/..."
                              value={card.link3Url || ''} 
                              onChange={(e) => handleCardChange(dayIdx, cardIdx, 'link3Url', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="array-item-actions">
                      <button 
                        type="button" 
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => removeItineraryCard(dayIdx, cardIdx)}
                        title="Remove Event Card"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => addItineraryCard(dayIdx)}
                  style={{ marginTop: '5px' }}
                >
                  <i className="fa-solid fa-plus"></i> Add Event Card
                </button>
              </div>
            ))}
          </div>

          {/* 4. ATTIRE & TRAVEL LINK CARDS */}
          <div className="admin-card">
            <div className="admin-card-title">4. Attire & Travel Subpage Cards</div>
            
            <div className="row" style={{ display: 'flex', gap: '20px' }}>
              {/* Attire box */}
              <div style={{ flex: 1, padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px' }}>
                <h5 style={{ fontWeight: 700, marginTop: 0 }}>Attire Guide Card</h5>
                <div className="admin-form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.attireSection.heading}
                    onChange={(e) => handleFieldChange('attireSection', 'heading', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea 
                    className="admin-textarea"
                    rows="3"
                    value={content.attireSection.description}
                    onChange={(e) => handleFieldChange('attireSection', 'description', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Button Label</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.attireSection.btnText}
                    onChange={(e) => handleFieldChange('attireSection', 'btnText', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Card Image</label>
                  <div className="admin-image-preview-container">
                    <img 
                      src={content.attireSection.image.startsWith('/assets') ? content.attireSection.image : `${apiURL}${content.attireSection.image}`} 
                      alt="Attire Guide Card" 
                      className="admin-image-preview"
                    />
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-accent admin-btn-sm"
                      onClick={() => triggerImageSelect('attireSection.image')}
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>

              {/* Travel box */}
              <div style={{ flex: 1, padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px' }}>
                <h5 style={{ fontWeight: 700, marginTop: 0 }}>Travel Guide Card</h5>
                <div className="admin-form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.travelSection.heading}
                    onChange={(e) => handleFieldChange('travelSection', 'heading', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea 
                    className="admin-textarea"
                    rows="3"
                    value={content.travelSection.description}
                    onChange={(e) => handleFieldChange('travelSection', 'description', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Button Label</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={content.travelSection.btnText}
                    onChange={(e) => handleFieldChange('travelSection', 'btnText', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Card Image</label>
                  <div className="admin-image-preview-container">
                    <img 
                      src={content.travelSection.image.startsWith('/assets') ? content.travelSection.image : `${apiURL}${content.travelSection.image}`} 
                      alt="Travel Guide Card" 
                      className="admin-image-preview"
                    />
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-accent admin-btn-sm"
                      onClick={() => triggerImageSelect('travelSection.image')}
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. RSVP LABELS & PLACEOHOLDERS */}
          <div className="admin-card">
            <div className="admin-card-title">5. RSVP Section Content</div>
            
            <div className="admin-form-group">
              <label>Section Main Heading</label>
              <input 
                type="text" 
                className="admin-input"
                value={content.rsvpSection.title}
                onChange={(e) => handleFieldChange('rsvpSection', 'title', e.target.value)}
              />
            </div>
            
            <div className="admin-form-group">
              <label>Section Description / Sub-heading</label>
              <input 
                type="text" 
                className="admin-input"
                value={content.rsvpSection.description}
                onChange={(e) => handleFieldChange('rsvpSection', 'description', e.target.value)}
              />
            </div>

            <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <div className="admin-form-group">
                <label>First Name Label</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.firstNameLabel}
                  onChange={(e) => handleFieldChange('rsvpSection', 'firstNameLabel', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>First Name Placeholder</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.firstNamePlaceholder}
                  onChange={(e) => handleFieldChange('rsvpSection', 'firstNamePlaceholder', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Last Name Label</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.lastNameLabel}
                  onChange={(e) => handleFieldChange('rsvpSection', 'lastNameLabel', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>Last Name Placeholder</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.lastNamePlaceholder}
                  onChange={(e) => handleFieldChange('rsvpSection', 'lastNamePlaceholder', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Email Address Label</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.emailLabel}
                  onChange={(e) => handleFieldChange('rsvpSection', 'emailLabel', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>Email Address Placeholder</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.emailPlaceholder}
                  onChange={(e) => handleFieldChange('rsvpSection', 'emailPlaceholder', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>WhatsApp Number Label</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.whatsappLabel}
                  onChange={(e) => handleFieldChange('rsvpSection', 'whatsappLabel', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>WhatsApp Number Placeholder</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.whatsappPlaceholder}
                  onChange={(e) => handleFieldChange('rsvpSection', 'whatsappPlaceholder', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Attending Query Label</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.attendingLabel}
                  onChange={(e) => handleFieldChange('rsvpSection', 'attendingLabel', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>Select Placeholder option text</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.attendingSelect}
                  onChange={(e) => handleFieldChange('rsvpSection', 'attendingSelect', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Attending Accept Label</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.attendingAccept}
                  onChange={(e) => handleFieldChange('rsvpSection', 'attendingAccept', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>Attending Decline Label</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.attendingDecline}
                  onChange={(e) => handleFieldChange('rsvpSection', 'attendingDecline', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Travel Dates Label</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.datesLabel}
                  onChange={(e) => handleFieldChange('rsvpSection', 'datesLabel', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>Travel Dates Placeholder</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.datesPlaceholder}
                  onChange={(e) => handleFieldChange('rsvpSection', 'datesPlaceholder', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Dietary Restrictions Label</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.dietaryLabel}
                  onChange={(e) => handleFieldChange('rsvpSection', 'dietaryLabel', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>Dietary Restrictions Placeholder</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.dietaryPlaceholder}
                  onChange={(e) => handleFieldChange('rsvpSection', 'dietaryPlaceholder', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Comments / Special Needs Label</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.needsLabel}
                  onChange={(e) => handleFieldChange('rsvpSection', 'needsLabel', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>Comments / Special Needs Placeholder</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={content.rsvpSection.needsPlaceholder}
                  onChange={(e) => handleFieldChange('rsvpSection', 'needsPlaceholder', e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>RSVP Submit Button Label</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.rsvpSection.submitBtn}
                onChange={(e) => handleFieldChange('rsvpSection', 'submitBtn', e.target.value)}
              />
            </div>
          </div>

          {/* 6. WEDDING GIFTS */}
          <div className="admin-card">
            <div className="admin-card-title">6. Wedding Gifts / Bank Accounts</div>
            
            <div className="admin-form-group">
              <label>Section Main Title</label>
              <input 
                type="text" 
                className="admin-input"
                value={content.giftsSection.title}
                onChange={(e) => handleFieldChange('giftsSection', 'title', e.target.value)}
              />
            </div>
            
            <div className="admin-form-group">
              <label>Gift Instructions Description</label>
              <textarea 
                className="admin-textarea"
                rows="4"
                value={content.giftsSection.description}
                onChange={(e) => handleFieldChange('giftsSection', 'description', e.target.value)}
              />
            </div>

            {/* List Bank Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {content.giftsSection.accounts.map((acct, acctIdx) => (
                <div key={acctIdx} style={{ padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fafafb' }}>
                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Card Title</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={acct.title}
                      onChange={(e) => handleGiftCardChange(acctIdx, 'title', e.target.value)}
                    />
                  </div>
                  
                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Bank Name</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={acct.bank}
                      onChange={(e) => handleGiftCardChange(acctIdx, 'bank', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Account Owner Name</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={acct.owner}
                      onChange={(e) => handleGiftCardChange(acctIdx, 'owner', e.target.value)}
                    />
                  </div>

                  {acct.details.map((detail, detIdx) => (
                    <div key={detIdx} className="row" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '80px' }}>
                        <label style={{ fontSize: '0.8rem' }}>Field Label</label>
                        <input 
                          type="text" 
                          className="admin-input"
                          style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                          value={detail.label}
                          onChange={(e) => handleGiftDetailChange(acctIdx, detIdx, 'label', e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem' }}>Value</label>
                        <input 
                          type="text" 
                          className="admin-input"
                          style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                          value={detail.value}
                          onChange={(e) => handleGiftDetailChange(acctIdx, detIdx, 'value', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Copyable Value (on Click Copy)</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={acct.copyVal}
                      onChange={(e) => handleGiftCardChange(acctIdx, 'copyVal', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '0' }}>
                    <label style={{ fontSize: '0.8rem' }}>Copy Button Label</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={acct.copyBtn}
                      onChange={(e) => handleGiftCardChange(acctIdx, 'copyBtn', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. FAQ ACCORDIONS */}
          <div className="admin-card">
            <div className="admin-card-title">7. Frequently Asked Questions (FAQ List)</div>
            
            <div className="admin-form-group">
              <label>FAQ Section Main Title</label>
              <input 
                type="text" 
                className="admin-input"
                value={content.faqSection.title}
                onChange={(e) => handleFieldChange('faqSection', 'title', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>FAQs list (Total: {content.faqSection.faqs.length})</label>
              
              {content.faqSection.faqs.map((faq, idx) => (
                <div key={idx} className="array-item-row">
                  <div className="array-item-fields">
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Question #{idx + 1}</strong>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={faq.q}
                        onChange={(e) => handleFaqChange(idx, 'q', e.target.value)}
                      />
                    </div>
                    <div>
                      <strong>Answer</strong>
                      <textarea 
                        className="admin-textarea" 
                        rows="3" 
                        value={faq.a}
                        onChange={(e) => handleFaqChange(idx, 'a', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                  <div className="array-item-actions" style={{ paddingTop: '20px' }}>
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => removeFaq(idx)}
                      title="Delete FAQ"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={addFaq}
                style={{ marginTop: '10px' }}
              >
                <i className="fa-solid fa-plus"></i> Add New FAQ
              </button>
            </div>
          </div>

          {/* 8. IMPORTANT CONTACTS */}
          <div className="admin-card">
            <div className="admin-card-title">8. Important Contacts Cards</div>
            
            <div className="admin-form-group">
              <label>Section Heading Title</label>
              <input 
                type="text" 
                className="admin-input"
                value={content.contactsSection.title}
                onChange={(e) => handleFieldChange('contactsSection', 'title', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Contacts Description Sub-text</label>
              <input 
                type="text" 
                className="admin-input"
                value={content.contactsSection.description}
                onChange={(e) => handleFieldChange('contactsSection', 'description', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {content.contactsSection.contacts.map((contact, idx) => (
                <div key={idx} style={{ padding: '16px', border: '1px solid var(--admin-border-color)', borderRadius: '6px', backgroundColor: '#fafafb' }}>
                  <h6 style={{ fontWeight: 700, margin: '0 0 10px 0' }}>Card #{idx + 1}: {contact.name || 'Name'}</h6>
                  
                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Contact Name</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={contact.name}
                      onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Role (e.g. Bride, Groom, Brother)</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={contact.role}
                      onChange={(e) => handleContactChange(idx, 'role', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Phone Number text</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={contact.phone}
                      onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem' }}>WhatsApp Link (wa.me/...)</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={contact.waLink}
                      onChange={(e) => handleContactChange(idx, 'waLink', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '0' }}>
                    <label style={{ fontSize: '0.8rem' }}>Chat Button Label</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={contact.chatBtn}
                      onChange={(e) => handleContactChange(idx, 'chatBtn', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 9. FOOTER SECTION */}
          <div className="admin-card">
            <div className="admin-card-title">9. Footer Branding</div>
            
            <div className="admin-form-group">
              <label>Copyright Text</label>
              <input 
                type="text" 
                className="admin-input" 
                value={content.footer.copyright}
                onChange={(e) => handleFieldChange('footer', 'copyright', e.target.value)}
              />
            </div>
            
            <div className="admin-form-group">
              <label>Footer Brand Logo Image</label>
              <div className="admin-image-preview-container">
                <img 
                  src={content.footer.logo.startsWith('/assets') ? content.footer.logo : `${apiURL}${content.footer.logo}`} 
                  alt="Footer Logo" 
                  className="admin-image-preview"
                />
                <button 
                  type="button" 
                  className="admin-btn admin-btn-accent admin-btn-sm"
                  onClick={() => triggerImageSelect('footer.logo')}
                >
                  Change Logo
                </button>
              </div>
            </div>
          </div>

          {/* Save Footer bar */}
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
                  <span>Save Home {lang.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Media Gallery Selector modal */}
      <ImageLibraryModal 
        isOpen={mediaModalOpen} 
        onClose={() => setMediaModalOpen(false)} 
        onSelect={handleImageSelected}
        currentValue={activeImageField ? activeImageField.split('.').reduce((o, i) => o[i], content) : null}
      />
    </div>
  );
}
