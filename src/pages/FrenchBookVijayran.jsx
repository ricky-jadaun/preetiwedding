import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { copyToClipboard } from '../utils/clipboard';
import { usePageData, getImageUrl } from '../utils/usePageData';
import PageStatus from '../components/PageStatus';

export default function FrenchBookVijayran() {
  const { content, loading, error } = usePageData('book-vijayran');

  useEffect(() => {
    document.title = "Réserver le Vijayran Palace | Preeti & Harpreet";
    document.documentElement.lang = "fr";

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
          
          <div className="lang-switcher d-inline-flex d-lg-none ms-auto me-2">
            <i className="fa-solid fa-globe lang-icon"></i>
            <Link to="/book-vijayran" className="lang-btn">EN</Link>
            <Link to="/fr/book-vijayran" className="lang-btn active">FR</Link>
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
              <li className="nav-item"><Link className="nav-link" to="/fr/book-vijayran">Réservation Vijayran Palace</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr#rsvp">RSVP</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr#gifts">Cadeaux de mariage</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr#faq">FAQ</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/fr#contact">Contact</Link></li>
              <li className="nav-item d-none d-lg-inline-flex">
                <div className="lang-switcher">
                  <i className="fa-solid fa-globe lang-icon"></i>
                  <Link to="/book-vijayran" className="lang-btn">EN</Link>
                  <Link to="/fr/book-vijayran" className="lang-btn active">FR</Link>
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
          background: `linear-gradient(rgba(250, 248, 245, 0.85), rgba(250, 248, 245, 0.85)), url('${getImageUrl(content.hero.bgImage || '/assets/images/vijayran_palace.png')}') no-repeat center center/cover` 
        }}
      >
        <div className="corner-ornament bottom-left"></div>
        <div className="corner-ornament bottom-right"></div>
        <div className="corner-ornament top-left"></div>
        <div className="corner-ornament top-right"></div>
        
        <div className="container">
          <h1 className="subpage-title">{content.hero.title}</h1>
          <p className="subpage-subtitle">{content.hero.subtitle}</p>
        </div>
      </header>

      <div className="container my-5">
        <Link to="/fr/travel" className="back-btn"><i className="fa-solid fa-arrow-left"></i> {content.backBtn}</Link>

        {/* Introduction */}
        <div className="my-4 text-center max-w-800 mx-auto" style={{ maxWidth: '800px' }}>
          <p className="lead" style={{ color: '#555', lineHeight: '1.8' }}>{content.introText}</p>
        </div>

        {/* Room Rates Section */}
        <div className="my-5 p-4 border rounded bg-white shadow-sm">
          <h2 className="text-center mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>
            <i className="fa-solid fa-hotel"></i> {content.ratesTitle}
          </h2>
          <div className="row g-4 justify-content-center">
            {content.rates.map((rate, idx) => (
              <div className="col-md-6 col-lg-5" key={idx}>
                <div className="p-4 border rounded text-center h-100 bg-light" style={{ borderLeft: '4px solid var(--accent-dark) !important' }}>
                  <span className="fs-1 fw-bold text-dark">{rate.price}</span>
                  <div className="fw-semibold text-muted mb-3" style={{ fontSize: '1.1rem' }}>{rate.label}</div>
                  <p className="text-muted mb-0" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>{rate.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Transfer Details */}
        <div className="my-5 p-4 border rounded bg-white shadow-sm">
          <h2 className="text-center mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>
            <i className="fa-solid fa-money-bill-transfer"></i> {content.paymentTitle}
          </h2>
          <p className="text-center text-muted mb-4 mx-auto" style={{ maxWidth: '650px' }}>{content.paymentInstructions}</p>
          
          <div className="row g-4 justify-content-center">
            {content.accounts.map((acct, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <div className="bank-card h-100 d-flex flex-column justify-content-between">
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

        {/* Booking Rules & Policies */}
        <div className="my-5 p-4 border rounded bg-white shadow-sm">
          <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>
            <i className="fa-solid fa-circle-info"></i> {content.importantNotesTitle}
          </h2>
          <ul className="text-muted" style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            {content.importantNotes.map((note, idx) => (
              <li key={idx} className="mb-2">{note}</li>
            ))}
          </ul>
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
