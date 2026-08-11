import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageData, getImageUrl } from '../utils/usePageData';
import PageStatus from '../components/PageStatus';

export default function FrenchAttire() {
  const { content, loading, error } = usePageData('attire');

  useEffect(() => {
    document.title = "Guide Vestimentaire Indien | Preeti & Harpreet";
    document.documentElement.lang = "fr";

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
          <Link className="navbar-brand" to="/fr#home">
            <img src={getImageUrl(content.footerLogo || '/assets/images/p-h-logo.png')} alt="Preeti & Harpreet Logo" />
          </Link>
          
          {/* Mobile Language Switcher */}
          <div className="lang-switcher d-inline-flex d-lg-none ms-auto me-2">
            <i className="fa-solid fa-globe lang-icon"></i>
            <Link to="/attire" className="lang-btn">EN</Link>
            <Link to="/fr/attire" className="lang-btn active">FR</Link>
          </div>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav align-items-center">
              <li className="nav-item"><Link className="nav-link" to="/fr#home">Accueil</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr#story">Notre Histoire</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr#schedule">Programme</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr/attire">Tenues Indiennes</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr/travel">Guide de Voyage</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr/book-vijayran">Réserver</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr#rsvp">RSVP</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr#gifts">Cadeaux</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr#faq">FAQ</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr#contact">Contact</Link></li>
              <li className="nav-item d-none d-lg-inline-flex">
                <div className="lang-switcher">
                  <i className="fa-solid fa-globe lang-icon"></i>
                  <Link to="/attire" className="lang-btn">EN</Link>
                  <Link to="/fr/attire" className="lang-btn active">FR</Link>
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
        <Link to="/fr" className="back-btn"><i className="fa-solid fa-arrow-left"></i> {content.backBtn}</Link>

        <div className="text-center mb-5 max-w-700 mx-auto" style={{ maxWidth: '700px' }}>
          <p className="lead" style={{ color: '#666' }}>{content.introText}</p>
        </div>

        {/* Women's Attire Section */}
        <div className="my-5">
          <h2 className="text-center mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>
            <i className="fa-solid fa-person-dress"></i> {content.sections.women.title}
          </h2>
          <div className="row g-4 justify-content-center">
            {content.sections.women.cards.map((card, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div className="attire-card">
                  <img src={getImageUrl(card.image)} alt={card.title} className="attire-card-img" />
                  <div className="attire-card-body">
                    <h4 className="attire-card-title text-center">{card.title}</h4>
                    <p className="attire-card-text text-muted">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Men's Attire Section */}
        <div className="my-5 pt-4 border-top">
          <h2 className="text-center mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>
            <i className="fa-solid fa-person"></i> {content.sections.men.title}
          </h2>
          <div className="row g-4 justify-content-center">
            {content.sections.men.cards.map((card, idx) => (
              <div className="col-md-6 col-lg-5" key={idx}>
                <div className="attire-card">
                  <img src={getImageUrl(card.image)} alt={card.title} className="attire-card-img" />
                  <div className="attire-card-body">
                    <h4 className="attire-card-title text-center">{card.title}</h4>
                    <p className="attire-card-text text-muted">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Where to Buy Indian Outfits Section */}
        <div className="my-5 p-4 border rounded bg-white">
          <h2 className="text-center mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>
            {content.sections.shopping.title}
          </h2>
          
          <div className="row g-4">
            {/* Column 1: Markets */}
            <div className="col-md-4">
              <div className="p-3 border rounded bg-light h-100">
                <h5 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--accent-dark)' }}>
                  <i className="fa-solid fa-map-location-dot"></i> {content.sections.shopping.columns[0].title}
                </h5>
                <ul className="mt-2 text-muted">
                  {content.sections.shopping.columns[0].items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Column 2: Renowned Shops */}
            <div className="col-md-4">
              <div className="p-3 border rounded bg-light h-100">
                <h5 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--accent-dark)' }}>
                  <i className="fa-solid fa-store"></i> {content.sections.shopping.columns[1].title}
                </h5>
                <ul className="mt-2 text-muted">
                  {content.sections.shopping.columns[1].items.map((item, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: item }}></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 3: Recommended Websites */}
            <div className="col-md-4">
              <div className="p-3 border rounded bg-light h-100">
                <h5 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--accent-dark)' }}>
                  <i className="fa-solid fa-globe"></i> {content.sections.shopping.columns[2].title}
                </h5>
                <ul className="mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
                  {content.sections.shopping.columns[2].links.map((link, idx) => (
                    <li key={idx}>
                      <a href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Styling Advice & Rules */}
        <div className="my-5 p-4 border rounded bg-white">
          <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>
            <i className="fa-regular fa-lightbulb"></i> {content.sections.styling.title}
          </h2>
          <div className="row g-4">
            <div className="col-md-6">
              {content.sections.styling.tips.map((tip, idx) => (
                <div key={idx} className={idx > 0 ? 'mt-3' : ''}>
                  <h5>{tip.heading}</h5>
                  <p className="text-muted">{tip.text}</p>
                </div>
              ))}
            </div>
            <div className="col-md-6">
              <div className="p-3 border-start border-warning bg-light">
                <h5 className="text-warning"><i className="fa-solid fa-circle-exclamation"></i> {content.sections.styling.warnings.title}</h5>
                <p className="mb-0 text-muted" dangerouslySetInnerHTML={{ __html: content.sections.styling.warnings.text }}></p>
              </div>
              <div className="p-3 border-start border-info bg-light mt-3">
                <h5 className="text-info"><i className="fa-solid fa-circle-info"></i> {content.sections.styling.infos.title}</h5>
                <p className="mb-0 text-muted">{content.sections.styling.infos.text}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer>
        <div className="container">
          <img src={getImageUrl(content.footerLogo || '/assets/images/p-h-logo.png')} alt="PH Logo" style={{ width: '100px', marginBottom: '20px' }} />
          <p>{content.copyright || '© 2027 Preeti & Harpreet. Tous droits réservés.'}</p>
        </div>
      </footer>
    </>
  );
}
