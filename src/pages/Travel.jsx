import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { copyToClipboard } from '../utils/clipboard';
import { usePageData, getImageUrl } from '../utils/usePageData';
import PageStatus from '../components/PageStatus';

export default function Travel() {
  const { content, loading, error } = usePageData('travel');

  useEffect(() => {
    document.title = "Travel Information | Preeti & Harpreet";
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

    return () => {
      if (menuToggle && handleLinkClick) {
        navLinks.forEach((link) => {
          link.removeEventListener('click', handleLinkClick);
        });
      }
    };
  }, []);

  if (loading || error) {
    return <PageStatus loading={loading} error={error} />;
  }

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container">
          <Link className="navbar-brand" to="/#home">
            <img src={getImageUrl(content.footerLogo || '/assets/images/p-h-logo.png')} alt="Preeti & Harpreet Logo" />
          </Link>
          
          {/* Mobile Language Switcher */}
          <div className="lang-switcher d-inline-flex d-lg-none ms-auto me-2">
            <i className="fa-solid fa-globe lang-icon"></i>
            <Link to="/travel" className="lang-btn active">EN</Link>
            <Link to="/fr/travel" className="lang-btn">FR</Link>
          </div>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav align-items-center">
              <li className="nav-item"><Link className="nav-link" to="/#home">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#story">Our Story</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#schedule">Itinerary</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/attire">Attire Guide</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/travel">Travel Guide</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/book-vijayran">Book Vijayran Palace</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#rsvp">RSVP</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#gifts">Gifts</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#faq">FAQ</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#contact">Contact</Link></li>
              <li className="nav-item d-none d-lg-inline-flex">
                <div className="lang-switcher">
                  <i className="fa-solid fa-globe lang-icon"></i>
                  <Link to="/travel" className="lang-btn active">EN</Link>
                  <Link to="/fr/travel" className="lang-btn">FR</Link>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <header 
        className="subpage-header corner-decor-wrap" 
        style={{ 
          background: `linear-gradient(rgba(250, 248, 245, 0.85), rgba(250, 248, 245, 0.85)), url('${getImageUrl(content.hero.bgImage)}') no-repeat center center/cover` 
        }}
      >
        <div className="corner-ornament top-left"></div>
        <div className="corner-ornament top-right"></div>
        <div className="corner-ornament bottom-left"></div>
        <div className="corner-ornament bottom-right"></div>
        
        <div className="container">
          <h1 className="subpage-title">{content.hero.title}</h1>
          <p className="subpage-subtitle">{content.hero.subtitle}</p>
        </div>
      </header>

      <div className="container my-5">
        <Link to="/" className="back-btn"><i className="fa-solid fa-arrow-left"></i> {content.backBtn}</Link>

        {/* Grid of Essential Travel Info Cards */}
        <div className="row g-4 mb-5">
          {content.infoCards.map((card, idx) => (
            <div className="col-md-6 col-lg-4" key={idx}>
              <div className="travel-info-card">
                <i className={`${card.icon} travel-info-icon`}></i>
                <h3 className="travel-info-title">{card.title}</h3>
                <div className="travel-info-text" dangerouslySetInnerHTML={{ __html: card.text }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Accommodations Section */}
        <div className="my-5">
          <h2 className="text-center mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>
            <i className="fa-solid fa-hotel"></i> {content.accommodation.title}
          </h2>
          
          <div className="row g-4 mb-4">
            {/* Delhi Accommodations */}
            <div className="col-md-6">
              <div className="travel-info-card h-100">
                <i className="fa-solid fa-map-pin travel-info-icon"></i>
                <h3 className="travel-info-title">{content.accommodation.delhi.title}</h3>
                <div className="travel-info-text" dangerouslySetInnerHTML={{ __html: content.accommodation.delhi.text }}></div>
              </div>
            </div>
            {/* Jaipur Accommodations */}
            <div className="col-md-6">
              <div className="travel-info-card h-100">
                <i className="fa-solid fa-bed travel-info-icon"></i>
                <h3 className="travel-info-title">{content.accommodation.jaipur.title}</h3>
                <div className="travel-info-text" dangerouslySetInnerHTML={{ __html: content.accommodation.jaipur.text }}></div>
              </div>
            </div>
          </div>

          {/* Wedding Venue details in a box/card */}
          <div className="p-4 border rounded bg-white text-center">
            <h4 className="mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--accent-dark)' }}>
              {content.accommodation.venue.title}
            </h4>
            <p>{content.accommodation.venue.description}</p>
            <div className="d-flex justify-content-center gap-4 my-3 flex-wrap">
              {content.accommodation.venue.rates.map((rate, rIdx) => (
                <div className="p-3 border rounded text-center bg-light" style={{ minWidth: '200px' }} key={rIdx}>
                  <span className="fs-4 fw-bold text-dark">{rate.price}</span><br />{rate.label}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/book-vijayran" className="btn btn-custom px-4 py-2">
                <i className="fa-solid fa-hotel"></i> Book Room & Payment Details
              </Link>
            </div>
          </div>
        </div>

        {/* Transportation Guide */}
        <div className="my-5">
          <h2 className="text-center mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>
            <i className="fa-solid fa-bus"></i> {content.transportation.title}
          </h2>
          <div className="p-4 border rounded bg-white">
            <div className="row align-items-center">
              <div className="col-md-8">
                <ul>
                  {content.transportation.items.map((bullet, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: bullet }}></li>
                  ))}
                </ul>
              </div>
              <div className="col-md-4 text-center">
                <i className="fa-solid fa-taxi" style={{ fontSize: '8rem', color: 'var(--accent-light)' }}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Explore India Guide */}
        <div className="my-5">
          <h2 className="text-center mb-5" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>
            <i className="fa-solid fa-compass"></i> {content.explore.title}
          </h2>
          <p className="text-center mb-4">{content.explore.introText}</p>
          
          <div className="row g-4">
            {content.explore.destinations.map((dest, idx) => (
              <div className="col-md-6" key={idx}>
                <div className="destination-card">
                  <div className="destination-card-title">{dest.title}</div>
                  <div className="destination-card-text" dangerouslySetInnerHTML={{ __html: dest.text }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer>
        <div className="container">
          <img src={getImageUrl(content.footerLogo || '/assets/images/p-h-logo.png')} alt="PH Logo" style={{ width: '100px', marginBottom: '20px' }} />
          <p>{content.copyright || '© 2027 Preeti & Harpreet. All Rights Reserved.'}</p>
        </div>
      </footer>
    </>
  );
}
