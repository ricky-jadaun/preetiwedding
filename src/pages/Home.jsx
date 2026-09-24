import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Countdown from '../components/Countdown';
import { copyToClipboard } from '../utils/clipboard';
import { usePageData, getImageUrl } from '../utils/usePageData';
import PageStatus from '../components/PageStatus';

const getItineraryIcon = (loc) => {
  if (!loc) return 'fa-solid fa-map-pin';
  const l = loc.toLowerCase();
  if (l.includes('gurudwara') || l.includes('gurdwara')) return 'fa-solid fa-gopuram';
  if (l.includes('transit') || l.includes('bus')) return 'fa-solid fa-bus';
  if (l.includes('vijayran') || l.includes('hotel') || l.includes('hôtel')) return 'fa-solid fa-hotel';
  if (l.includes('courtyard') || l.includes('cour')) return 'fa-solid fa-leaf';
  if (l.includes('reception') || l.includes('salle') || l.includes('music')) return 'fa-solid fa-music';
  if (l.includes('poolside') || l.includes('piscine') || l.includes('water')) return 'fa-solid fa-water';
  if (l.includes('mandap') || l.includes('fire')) return 'fa-solid fa-fire-burner';
  return 'fa-solid fa-map-pin';
};

export default function Home() {
  const { content, loading, error } = usePageData('home');

  const [rsvpState, setRsvpState] = useState({
    firstName: '',
    lastName: '',
    adultsCount: '',
    childrenCount: '',
    childrenAge: '',
    email: '',
    whatsapp: '',
    attending: '',
    datesInIndia: '',
    dietary: '',
    specialNeeds: ''
  });
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState('');
  const [rsvpError, setRsvpError] = useState('');

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setRsvpSubmitting(true);
    setRsvpSuccess('');
    setRsvpError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiURL}/api/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpState)
      });
      const data = await res.json();
      if (data.success) {
        setRsvpSuccess('Thank you! Your response has been submitted.');
        setRsvpState({
          firstName: '',
          lastName: '',
          adultsCount: '',
          childrenCount: '',
          childrenAge: '',
          email: '',
          whatsapp: '',
          attending: '',
          datesInIndia: '',
          dietary: '',
          specialNeeds: ''
        });
      } else {
        setRsvpError(data.message || 'Error submitting RSVP.');
      }
    } catch (err) {
      setRsvpError('Connection error. Please try again.');
    } finally {
      setRsvpSubmitting(false);
    }
  };

  useEffect(() => {
    document.title = "Preeti & Harpreet | Wedding Celebration";
    document.documentElement.lang = "en";


    // Auto-close Bootstrap mobile menu when a nav link is clicked
    const navLinks = document.querySelectorAll('.navbar-collapse .nav-link');
    const menuToggle = document.getElementById('navbarNav');
    let bsCollapse;
    let handleLinkClick;

    if (menuToggle && window.bootstrap) {
      bsCollapse = window.bootstrap.Collapse.getOrCreateInstance(menuToggle, { toggle: false });
      handleLinkClick = () => {
        if (menuToggle.classList.contains('show')) {
          bsCollapse.hide();
        }
      };

      navLinks.forEach((link) => {
        link.addEventListener('click', handleLinkClick);
      });
    }

    // Quick links schedule tab activator
    const quickLinks = document.querySelectorAll('.quick-link-card[data-tab]');
    const handleQuickLinkClick = (e) => {
      const tabId = e.currentTarget.getAttribute('data-tab');
      const tabBtn = document.getElementById(tabId);
      if (tabBtn && window.bootstrap) {
        const tab = window.bootstrap.Tab.getOrCreateInstance(tabBtn);
        tab.show();
      }
    };

    quickLinks.forEach(link => {
      link.addEventListener('click', handleQuickLinkClick);
    });

    return () => {
      if (menuToggle && handleLinkClick) {
        navLinks.forEach((link) => {
          link.removeEventListener('click', handleLinkClick);
        });
      }
      quickLinks.forEach(link => {
        link.removeEventListener('click', handleQuickLinkClick);
      });
    };
  }, []);

  if (loading || error) {
    return <PageStatus loading={loading} error={error} />;
  }

  return (
    <>
      {/* Navbar */}
      <nav id="mainNav" className="navbar navbar-expand-lg fixed-top">
        <div className="container">
          <Link className="navbar-brand" to="/#home">
            <img src={getImageUrl(content.footer.logo)} alt="Preeti & Harpreet Logo" />
          </Link>
          
          {/* Mobile Language Switcher */}
          <div className="lang-switcher d-inline-flex d-lg-none ms-auto me-2">
            <i className="fa-solid fa-globe lang-icon"></i>
            <Link to="/" className="lang-btn active">EN</Link>
            <Link to="/fr" className="lang-btn">FR</Link>
          </div>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav align-items-center">
              <li className="nav-item"><Link className="nav-link" to="/#home">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#story">Our Story</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#schedule">Itinerary</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/attire">Indian Attire</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/travel">Travel Guide</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/book-vijayran">Booking Vijayran Palace</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#rsvp">RSVP</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#gifts">Wedding Gifts</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#faq">FAQ</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#contact">Contact</Link></li>
              <li className="nav-item d-none d-lg-inline-flex">
                <div className="lang-switcher">
                  <i className="fa-solid fa-globe lang-icon"></i>
                  <Link to="/" className="lang-btn active">EN</Link>
                  <Link to="/fr" className="lang-btn">FR</Link>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section corner-decor-wrap">
        <div className="corner-ornament top-left d-lg-none"></div>
        <div className="corner-ornament top-right d-lg-none"></div>
        
        <div className="container hero-content">
          <div className="logo-header-wrapper">
            {/* Desktop Logo (>= 768px) */}
            <img 
              src={getImageUrl(content.hero.logo)} 
              alt="PH Logo" 
              className="d-none d-md-block"
            />
            {/* Mobile Logo (< 768px) */}
            <img 
              src={getImageUrl(content.hero.logoMobile || content.hero.logo)} 
              alt="PH Logo Mobile" 
              className="d-block d-md-none"
            />
            <h1>{content.hero.title}</h1>
          </div>
          <p>{content.hero.date}<br /><span style={{ color: 'var(--accent-dark)' }}>{content.hero.location}</span></p>
          
          {/* Countdown Timer */}
          <Countdown lang="en" targetDate={content.countdownTargetDate} />
        </div>
      </section>

      {/* Quick Links Grid */}
      {/* <section className="container my-5 py-4">
        <div className="row g-4 justify-content-center">
          
          <div className="col-6 col-sm-4 col-md-3 col-lg-2">
            <Link to="/#schedule" className="quick-link-card" data-tab="day1-tab">
              <div className="quick-link-icon-wrap">
                <i className="fa-regular fa-calendar-days"></i>
              </div>
              <h5 className="text-center">{content.quickLinks.link1}</h5>
            </Link>
          </div>
          
          <div className="col-6 col-sm-4 col-md-3 col-lg-2">
            <Link to="/#schedule" className="quick-link-card" data-tab="day2-tab">
              <div className="quick-link-icon-wrap">
                <i className="fa-solid fa-champagne-glasses"></i>
              </div>
              <h5 className="text-center">{content.quickLinks.link2}</h5>
            </Link>
          </div>
          
          <div className="col-6 col-sm-4 col-md-3 col-lg-2">
            <Link to="/#schedule" className="quick-link-card">
              <div className="quick-link-icon-wrap">
                <i className="fa-regular fa-calendar-check"></i>
              </div>
              <h5 className="text-center">{content.quickLinks.link3}</h5>
            </Link>
          </div>
          
          <div className="col-6 col-sm-4 col-md-3 col-lg-2">
            <Link to="/attire" className="quick-link-card">
              <div className="quick-link-icon-wrap">
                <i className="fa-solid fa-shirt"></i>
              </div>
              <h5 className="text-center">{content.quickLinks.link4}</h5>
            </Link>
          </div>
          
          <div className="col-6 col-sm-4 col-md-3 col-lg-2">
            <Link to="/travel" className="quick-link-card">
              <div className="quick-link-icon-wrap">
                <i className="fa-solid fa-plane"></i>
              </div>
              <h5 className="text-center">{content.quickLinks.link5}</h5>
            </Link>
          </div>
          
          <div className="col-6 col-sm-4 col-md-3 col-lg-2">
            <Link to="/#rsvp" className="quick-link-card">
              <div className="quick-link-icon-wrap">
                <i className="fa-regular fa-envelope"></i>
              </div>
              <h5 className="text-center">{content.quickLinks.link6}</h5>
            </Link>
          </div>
        </div>
      </section> */}

      {/* Our Story */}
      <section id="story" className="corner-decor-wrap">
        <div className="corner-ornament top-left"></div>
        <div className="corner-ornament bottom-right"></div>
        
        <div className="container">
          <h2 className="section-title text-center">{content.story.title}</h2>
          <div className="row align-items-center mt-5">
            {/* Image Side */}
            <div className="col-md-5 mb-4 mb-md-0">
              <div className="story-img-wrapper">
                <img src={getImageUrl(content.story.image)} alt="Our Story" className="story-img img-fluid" />
              </div>
            </div>
            {/* Content Side */}
            <div className="col-md-7 ps-md-5">
              <div className="story-content">
                <p className="lead-text"><strong>{content.story.leadText}</strong></p>
                {content.story.paragraphs.slice(0, -1).map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
                {content.story.paragraphs.length > 0 && (
                  <p className="highlight-text">{content.story.paragraphs[content.story.paragraphs.length - 1]}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Schedule */}
      <section id="schedule" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <h2 className="section-title text-center">{content.itinerary.title}</h2>
          
          <ul className="nav nav-tabs timeline-tabs" id="itineraryTabs" role="tablist">
            {content.itinerary.days.map((day, idx) => (
              <li className="nav-item" role="presentation" key={day.id}>
                <button 
                  className={`nav-link timeline-tab-btn ${idx === 0 ? 'active' : ''}`} 
                  id={`${day.id}-tab`} 
                  data-bs-toggle="tab" 
                  data-bs-target={`#${day.id}`} 
                  type="button" 
                  role="tab" 
                  aria-controls={day.id} 
                  aria-selected={idx === 0 ? 'true' : 'false'}
                >
                  {day.tabLabel}
                </button>
              </li>
            ))}
          </ul>

          <div className="tab-content" id="itineraryTabContent">
            {content.itinerary.days.map((day, idx) => (
              <div 
                key={day.id} 
                className={`tab-pane fade ${idx === 0 ? 'show active' : ''}`} 
                id={day.id} 
                role="tabpanel" 
                aria-labelledby={`${day.id}-tab`}
              >
                <div className="row justify-content-center">
                  <div className="col-lg-9">
                    {day.cards.map((card, cardIdx) => (
                      <div 
                        key={cardIdx} 
                        className={`itinerary-card d-flex flex-column flex-md-row gap-4 ${cardIdx > 0 ? 'mt-4' : ''}`}
                      >
                        <div className="itinerary-meta col-md-3">
                          <div className="itinerary-time">{card.time}</div>
                          <div className="itinerary-location">
                            <i className={getItineraryIcon(card.location)}></i> {card.location}
                          </div>
                        </div>
                        <div className="itinerary-body col-md-9">
                          <h3 className="itinerary-title">{card.title}</h3>
                          <p className="itinerary-desc">{card.description}</p>
                          
                          {card.dressCode && (
                            <div className="mb-3">
                              <span className="dress-code-badge" style={{ marginTop: 0 }}>{card.dressCode}</span>
                            </div>
                          )}
                          
                          {((card.btnText && card.btnLink) || card.link1Url || card.link2Url || card.link3Url) && (
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {card.btnText && card.btnLink && (
                                <Link to={card.btnLink} className="btn btn-custom btn-sm">{card.btnText}</Link>
                              )}
                              {card.link1Url && (
                                <a 
                                  href={card.link1Url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="btn btn-custom btn-sm"
                                >
                                  {card.link1Label || 'Link 1'}
                                </a>
                              )}
                              {card.link2Url && (
                                <a 
                                  href={card.link2Url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="btn btn-custom btn-sm"
                                >
                                  {card.link2Label || 'Link 2'}
                                </a>
                              )}
                              {card.link3Url && (
                                <a 
                                  href={card.link3Url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="btn btn-custom btn-sm"
                                >
                                  {card.link3Label || 'Link 3'}
                                </a>
                              )}
                            </div>
                          )}

                          {card.note && (
                            <p className="small text-muted mt-2">
                              <i className="fa-solid fa-circle-exclamation"></i> <span dangerouslySetInnerHTML={{ __html: card.note }} />
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attire Guide Section */}
      <section id="attire" className="py-5" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="container">
          <h2 className="section-title text-center mb-5">{content.attireSection.heading}</h2>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="guide-card">
                <div className="row g-0 align-items-center">
                  <div className="col-md-5">
                    <div className="guide-card-img-wrap">
                      <img src={getImageUrl(content.attireSection.image)} alt="Indian Traditional Attire" className="guide-card-img" />
                    </div>
                  </div>
                  <div className="col-md-7">
                    <div className="guide-card-body">
                      <h3 className="guide-card-title">{content.attireSection.heading}</h3>
                      <p className="guide-card-text">{content.attireSection.description}</p>
                      <Link to="/attire" className="btn btn-custom mt-2">{content.attireSection.btnText}</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Guide Section */}
      <section id="travel" className="py-5" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <h2 className="section-title text-center mb-5">{content.travelSection.heading}</h2>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="guide-card">
                <div className="row g-0 align-items-center">
                  <div className="col-md-5">
                    <div className="guide-card-img-wrap">
                      <img src={getImageUrl(content.travelSection.image)} alt="Jaipur Hawa Mahal" className="guide-card-img" />
                    </div>
                  </div>
                  <div className="col-md-7">
                    <div className="guide-card-body">
                      <h3 className="guide-card-title">{content.travelSection.heading}</h3>
                      <p className="guide-card-text">{content.travelSection.description}</p>
                      <Link to="/travel" className="btn btn-custom mt-2">{content.travelSection.btnText}</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="corner-decor-wrap" style={{ backgroundColor: 'white' }}>
        <div className="corner-ornament top-right"></div>
        <div className="corner-ornament bottom-left"></div>
        
        <div className="container text-center">
          <h2 className="section-title">{content.rsvpSection.title}</h2>
          <p className="mb-5">{content.rsvpSection.description}</p>
          
          <form className="row g-3 justify-content-center mx-auto text-start" style={{ maxWidth: '800px' }} onSubmit={handleRsvpSubmit}>
            {rsvpSuccess && <div className="alert alert-success">{rsvpSuccess}</div>}
            {rsvpError && <div className="alert alert-danger">{rsvpError}</div>}
            
            <div className="col-md-6">
              <label className="form-label">{content.rsvpSection.firstNameLabel}</label>
              <input 
                type="text" 
                className="form-control form-control-custom" 
                required 
                placeholder={content.rsvpSection.firstNamePlaceholder} 
                value={rsvpState.firstName}
                onChange={e => setRsvpState(p => ({ ...p, firstName: e.target.value }))}
              />
            </div>
             <div className="col-md-6">
              <label className="form-label">{content.rsvpSection.lastNameLabel}</label>
              <input 
                type="text" 
                className="form-control form-control-custom" 
                required 
                placeholder={content.rsvpSection.lastNamePlaceholder} 
                value={rsvpState.lastName}
                onChange={e => setRsvpState(p => ({ ...p, lastName: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">{content.rsvpSection.adultsCountLabel || 'Number of Adults'}</label>
              <input 
                type="number" 
                min="1"
                className="form-control form-control-custom" 
                placeholder={content.rsvpSection.adultsCountPlaceholder || 'Enter number of adults'} 
                value={rsvpState.adultsCount}
                onChange={e => setRsvpState(p => ({ ...p, adultsCount: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">{content.rsvpSection.childrenCountLabel || 'Number of Children'}</label>
              <input 
                type="number" 
                min="0"
                className="form-control form-control-custom" 
                placeholder={content.rsvpSection.childrenCountPlaceholder || 'Enter number of children'} 
                value={rsvpState.childrenCount}
                onChange={e => setRsvpState(p => ({ ...p, childrenCount: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">{content.rsvpSection.childrenAgeLabel || 'Age of Children (e.g. 5, 8)'}</label>
              <input 
                type="text" 
                className="form-control form-control-custom" 
                placeholder={content.rsvpSection.childrenAgePlaceholder || 'Enter age of children'} 
                value={rsvpState.childrenAge}
                onChange={e => setRsvpState(p => ({ ...p, childrenAge: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">{content.rsvpSection.emailLabel}</label>
              <input 
                type="email" 
                className="form-control form-control-custom" 
                required 
                placeholder={content.rsvpSection.emailPlaceholder} 
                value={rsvpState.email}
                onChange={e => setRsvpState(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">{content.rsvpSection.whatsappLabel}</label>
              <input 
                type="tel" 
                className="form-control form-control-custom" 
                required 
                placeholder={content.rsvpSection.whatsappPlaceholder} 
                value={rsvpState.whatsapp}
                onChange={e => setRsvpState(p => ({ ...p, whatsapp: e.target.value }))}
              />
            </div>
            <div className="col-12">
              <label className="form-label">{content.rsvpSection.attendingLabel}</label>
              <select 
                className="form-select form-select-custom" 
                required 
                value={rsvpState.attending}
                onChange={e => setRsvpState(p => ({ ...p, attending: e.target.value }))}
              >
                <option value="" disabled>{content.rsvpSection.attendingSelect}</option>
                <option value="accept">{content.rsvpSection.attendingAccept}</option>
                <option value="decline">{content.rsvpSection.attendingDecline}</option>
              </select>
            </div>
            
            <div className="col-12">
              <label className="form-label">{content.rsvpSection.datesLabel}</label>
              <input 
                type="text" 
                className="form-control form-control-custom" 
                placeholder={content.rsvpSection.datesPlaceholder} 
                value={rsvpState.datesInIndia}
                onChange={e => setRsvpState(p => ({ ...p, datesInIndia: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">{content.rsvpSection.dietaryLabel}</label>
              <textarea 
                className="form-control form-control-custom" 
                rows="2" 
                placeholder={content.rsvpSection.dietaryPlaceholder}
                value={rsvpState.dietary}
                onChange={e => setRsvpState(p => ({ ...p, dietary: e.target.value }))}
              ></textarea>
            </div>
            <div className="col-md-6">
              <label className="form-label">{content.rsvpSection.needsLabel}</label>
              <textarea 
                className="form-control form-control-custom" 
                rows="2" 
                placeholder={content.rsvpSection.needsPlaceholder}
                value={rsvpState.specialNeeds}
                onChange={e => setRsvpState(p => ({ ...p, specialNeeds: e.target.value }))}
              ></textarea>
            </div>
            
            <div className="col-12 mt-4 text-center">
              <button type="submit" className="btn btn-custom w-100 py-3" disabled={rsvpSubmitting}>
                {rsvpSubmitting ? 'Submitting...' : content.rsvpSection.submitBtn}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Wedding Gifts Section */}
      <section id="gifts" className="py-5" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="container">
          <div className="wedding-gifts-header text-center mb-5">
            <i className="fa-solid fa-gift gifts-main-icon"></i>
            <h3 className="mt-3 mb-2" style={{ fontSize: '2.2rem', fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>{content.giftsSection.title}</h3>
            <div className="gifts-divider"></div>
            <p className="mt-3 mb-4 text-muted mx-auto" style={{ maxWidth: '650px', fontSize: '1.05rem', lineHeight: '1.7' }}>
              {content.giftsSection.description}
            </p>
          </div>
          
          <div className="row g-4 justify-content-center">
            {content.giftsSection.accounts.map((acct, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <div className="bank-card">
                  <div>
                    <div className="bank-card-title">{acct.title}</div>
                    <div className="bank-card-detail">{acct.bank}</div>
                    <div className="bank-card-detail">{acct.owner}</div>
                    {acct.details.map((det, dIdx) => (
                      <div className="bank-card-detail" key={dIdx}>
                        <strong>{det.label}:</strong> {det.value}
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-sm btn-bank-copy mt-3" onClick={(e) => copyToClipboard(acct.copyVal, e.currentTarget)}>
                    <i className="fa-regular fa-copy"></i> {acct.copyBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ & Contact Section */}
      <section id="faq">
        <div className="container">
          <h2 className="section-title text-center">{content.faqSection.title}</h2>
          <div className="accordion" id="weddingFAQ">
            <div className="row g-4">
              {/* Left Column: FAQ 1 to 8 */}
              <div className="col-lg-6">
                {content.faqSection.faqs.slice(0, 8).map((faq, idx) => (
                  <div className="accordion-item accordion-item-custom" key={idx}>
                    <h2 className="accordion-header" id={`faqHeading${idx + 1}`}>
                      <button className="accordion-button accordion-btn-custom collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#faq${idx + 1}`} aria-expanded="false" aria-controls={`faq${idx + 1}`}>
                        {faq.q}
                      </button>
                    </h2>
                    <div id={`faq${idx + 1}`} className="accordion-collapse collapse" aria-labelledby={`faqHeading${idx + 1}`} data-bs-parent="#weddingFAQ">
                      <div className="accordion-body" dangerouslySetInnerHTML={{ __html: faq.a }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: FAQ 9 to 15 */}
              <div className="col-lg-6">
                {content.faqSection.faqs.slice(8).map((faq, idx) => {
                  const globalIdx = idx + 8;
                  return (
                    <div className="accordion-item accordion-item-custom" key={globalIdx}>
                      <h2 className="accordion-header" id={`faqHeading${globalIdx + 1}`}>
                        <button className="accordion-button accordion-btn-custom collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#faq${globalIdx + 1}`} aria-expanded="false" aria-controls={`faq${globalIdx + 1}`}>
                          {faq.q}
                        </button>
                      </h2>
                      <div id={`faq${globalIdx + 1}`} className="accordion-collapse collapse" aria-labelledby={`faqHeading${globalIdx + 1}`} data-bs-parent="#weddingFAQ">
                        <div className="accordion-body" dangerouslySetInnerHTML={{ __html: faq.a }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Contacts Section */}
      <section id="contact" className="py-5" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="container text-center">
          <h2 className="section-title"><i className="fa-solid fa-address-book"></i> {content.contactsSection.title}</h2>
          <p className="mb-5 text-muted">{content.contactsSection.description}</p>
          <div className="row g-4 justify-content-center">
            {content.contactsSection.contacts.map((contact, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <div className="contact-card">
                  <i className="fa-brands fa-whatsapp contact-icon"></i>
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-role">{contact.role}</div>
                  <a href={`https://wa.me/${contact.phone.replace(/[\s\+]/g, '')}`} className="contact-link mb-2 d-block" target="_blank" rel="noreferrer">{contact.phone}</a>
                  <a href={contact.waLink} className="btn-whatsapp-outline mt-2" target="_blank" rel="noreferrer"><i className="fa-brands fa-whatsapp"></i> {contact.chatBtn}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <img src={getImageUrl(content.footer.logo)} alt="PH Logo" style={{ width: '100px', marginBottom: '20px' }} />
          <p>{content.footer.copyright}</p>
        </div>
      </footer>
    </>
  );
}
