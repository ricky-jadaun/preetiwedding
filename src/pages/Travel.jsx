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

  const recs = content.accommodation?.recommendations || [];
  const delhiBnbs = recs
    .filter((r) => r.city === 'delhi' && r.category === 'bnb' && r.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const delhiHotels = recs
    .filter((r) => r.city === 'delhi' && r.category === 'hotel' && r.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const jaipurHotels = recs
    .filter((r) => r.city === 'jaipur' && r.category === 'hotel' && r.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const getMapUrl = (item) => {
    if (item.mapLink && item.mapLink.trim()) {
      return item.mapLink.trim();
    }
    const query = [item.name, item.location, item.city, 'India'].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

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
        <div className="my-5" id="accommodation">
          <h2 className="text-center mb-2" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-main)' }}>
            <i className="fa-solid fa-hotel me-2"></i> {content.accommodation?.title || "Where to Stay"}
          </h2>
          {content.accommodation?.subtitle && (
            <p className="text-center text-muted mb-5" style={{ fontSize: '1.05rem' }}>
              {content.accommodation.subtitle}
            </p>
          )}

          {/* ================= DELHI ACCOMMODATIONS ================= */}
          <div className="accommodation-city-section">
            <div className="accommodation-city-header">
              <div className="accommodation-city-badge">
                <i className="fa-solid fa-map-pin"></i>
                <span>{content.accommodation?.delhi?.title || "Delhi Accommodations"}</span>
              </div>
              {content.accommodation?.delhi?.subtitle && (
                <div className="accommodation-city-subtitle">{content.accommodation.delhi.subtitle}</div>
              )}
              <div className="accommodation-city-divider"></div>
            </div>

            {content.accommodation?.delhi?.text && (
              <div className="text-center mb-4" style={{ maxWidth: '850px', margin: '0 auto' }}>
                <p className="travel-info-text" dangerouslySetInnerHTML={{ __html: content.accommodation.delhi.text }}></p>
              </div>
            )}

            {/* Bed & Breakfast / Home Stays */}
            {delhiBnbs.length > 0 && (
              <div className="mb-5">
                <h4 className="accommodation-category-title">
                  <i className="fa-solid fa-house-chimney" style={{ color: 'var(--accent-gold)' }}></i>
                  <span>{content.accommodation?.delhi?.categories?.bnb || "Bed & Breakfast / Home Stays"}</span>
                </h4>
                <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-lg-4">
                  {delhiBnbs.map((item) => (
                    <div className="col" key={item.id}>
                      <div className="accommodation-card">
                        <div className="accommodation-card-body">
                          {item.image && (
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="img-fluid rounded mb-2"
                              style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                            />
                          )}
                          <h5 className="accommodation-card-name">
                            {item.link ? (
                              <a href={item.link} target="_blank" rel="noopener noreferrer">
                                {item.name} <i className="fa-solid fa-arrow-up-right-from-square ms-1" style={{ fontSize: '0.75rem' }}></i>
                              </a>
                            ) : (
                              item.name
                            )}
                          </h5>
                          {item.stars ? (
                            <div className="accommodation-card-stars">
                              {Array.from({ length: item.stars }).map((_, sIdx) => (
                                <i key={sIdx} className="fa-solid fa-star"></i>
                              ))}
                              <span className="ms-1">({item.stars} Stars)</span>
                            </div>
                          ) : null}
                          {item.description ? (
                            <p className="accommodation-card-desc">{item.description}</p>
                          ) : null}
                        </div>
                        <div className="accommodation-card-footer">
                          {item.location && (
                            <div className="accommodation-card-location mb-2">
                              <small className="text-muted">
                                <i className="fa-solid fa-location-dot me-1 text-danger"></i>
                                {item.location}
                              </small>
                            </div>
                          )}
                          <a 
                            href={getMapUrl(item)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-accommodation-map"
                            title={`Open ${item.name} on Google Maps`}
                          >
                            <i className="fa-solid fa-map-location-dot me-2"></i>
                            <span>View on Google Maps</span>
                            <i className="fa-solid fa-arrow-up-right-from-square ms-2" style={{ fontSize: '0.72rem' }}></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hotels */}
            {delhiHotels.length > 0 && (
              <div className="mb-5">
                <h4 className="accommodation-category-title">
                  <i className="fa-solid fa-hotel" style={{ color: 'var(--accent-gold)' }}></i>
                  <span>{content.accommodation?.delhi?.categories?.hotel || "Hotels"}</span>
                </h4>
                <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-lg-3">
                  {delhiHotels.map((item) => (
                    <div className="col" key={item.id}>
                      <div className="accommodation-card">
                        <div className="accommodation-card-body">
                          {item.image && (
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="img-fluid rounded mb-2"
                              style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                            />
                          )}
                          <h5 className="accommodation-card-name">
                            {item.link ? (
                              <a href={item.link} target="_blank" rel="noopener noreferrer">
                                {item.name} <i className="fa-solid fa-arrow-up-right-from-square ms-1" style={{ fontSize: '0.75rem' }}></i>
                              </a>
                            ) : (
                              item.name
                            )}
                          </h5>
                          {item.stars ? (
                            <div className="accommodation-card-stars">
                              {Array.from({ length: item.stars }).map((_, sIdx) => (
                                <i key={sIdx} className="fa-solid fa-star"></i>
                              ))}
                              <span className="ms-1">({item.stars} Stars)</span>
                            </div>
                          ) : null}
                          {item.description ? (
                            <p className="accommodation-card-desc">{item.description}</p>
                          ) : null}
                        </div>
                        <div className="accommodation-card-footer">
                          {item.location && (
                            <div className="accommodation-card-location mb-2">
                              <small className="text-muted">
                                <i className="fa-solid fa-location-dot me-1 text-danger"></i>
                                {item.location}
                              </small>
                            </div>
                          )}
                          <a 
                            href={getMapUrl(item)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-accommodation-map"
                            title={`Open ${item.name} on Google Maps`}
                          >
                            <i className="fa-solid fa-map-location-dot me-2"></i>
                            <span>View on Google Maps</span>
                            <i className="fa-solid fa-arrow-up-right-from-square ms-2" style={{ fontSize: '0.72rem' }}></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Airbnb Box */}
            <div className="accommodation-airbnb-box">
              <h4 className="accommodation-category-title" style={{ borderBottom: 'none', marginBottom: '12px' }}>
                <i className="fa-brands fa-airbnb" style={{ color: 'var(--accent-dark)', fontSize: '1.4rem' }}></i>
                <span>{content.accommodation?.delhi?.airbnb?.title || "Airbnb"}</span>
              </h4>
              <p className="accommodation-airbnb-intro">
                {content.accommodation?.delhi?.airbnb?.introText || "Airbnb is also a good option for guests who prefer bigger spaces."}
              </p>
              
              <div className="accommodation-areas-title">
                <i className="fa-solid fa-map-location-dot me-2"></i>
                Recommended areas:
              </div>
              <div className="accommodation-areas-list">
                {(content.accommodation?.delhi?.airbnb?.recommendedAreas || []).map((area, idx) => (
                  <span className="accommodation-area-pill" key={idx}>
                    <i className="fa-solid fa-check"></i>
                    {area}
                  </span>
                ))}
              </div>

              {content.accommodation?.delhi?.note && (
                <div className="accommodation-client-note">
                  <i className="fa-solid fa-circle-info"></i>
                  <div>
                    <strong>Recommendation Note: </strong>
                    "{content.accommodation.delhi.note}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= JAIPUR ACCOMMODATIONS ================= */}
          <div className="accommodation-city-section">
            <div className="accommodation-city-header">
              <div className="accommodation-city-badge">
                <i className="fa-solid fa-bed"></i>
                <span>{content.accommodation?.jaipur?.title || "Jaipur Accommodations"}</span>
              </div>
              {content.accommodation?.jaipur?.subtitle && (
                <div className="accommodation-city-subtitle">{content.accommodation.jaipur.subtitle}</div>
              )}
              <div className="accommodation-city-divider"></div>
            </div>

            {content.accommodation?.jaipur?.text && (
              <div className="text-center mb-4" style={{ maxWidth: '850px', margin: '0 auto' }}>
                <p className="travel-info-text" dangerouslySetInnerHTML={{ __html: content.accommodation.jaipur.text }}></p>
              </div>
            )}

            {/* Jaipur Hotels */}
            {jaipurHotels.length > 0 && (
              <div className="mb-4">
                <h4 className="accommodation-category-title">
                  <i className="fa-solid fa-hotel" style={{ color: 'var(--accent-gold)' }}></i>
                  <span>{content.accommodation?.jaipur?.categories?.hotel || "Hotels"}</span>
                </h4>
                <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-lg-4">
                  {jaipurHotels.map((item) => (
                    <div className="col" key={item.id}>
                      <div className="accommodation-card">
                        <div className="accommodation-card-body">
                          {item.image && (
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="img-fluid rounded mb-2"
                              style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                            />
                          )}
                          <h5 className="accommodation-card-name">
                            {item.link ? (
                              <a href={item.link} target="_blank" rel="noopener noreferrer">
                                {item.name} <i className="fa-solid fa-arrow-up-right-from-square ms-1" style={{ fontSize: '0.75rem' }}></i>
                              </a>
                            ) : (
                              item.name
                            )}
                          </h5>
                          {item.stars ? (
                            <div className="accommodation-card-stars">
                              {Array.from({ length: item.stars }).map((_, sIdx) => (
                                <i key={sIdx} className="fa-solid fa-star"></i>
                              ))}
                              <span className="ms-1">({item.stars} Stars)</span>
                            </div>
                          ) : null}
                          {item.description ? (
                            <p className="accommodation-card-desc">{item.description}</p>
                          ) : null}
                        </div>
                        <div className="accommodation-card-footer">
                          {item.location && (
                            <div className="accommodation-card-location mb-2">
                              <small className="text-muted">
                                <i className="fa-solid fa-location-dot me-1 text-danger"></i>
                                {item.location}
                              </small>
                            </div>
                          )}
                          <a 
                            href={getMapUrl(item)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-accommodation-map"
                            title={`Open ${item.name} on Google Maps`}
                          >
                            <i className="fa-solid fa-map-location-dot me-2"></i>
                            <span>View on Google Maps</span>
                            <i className="fa-solid fa-arrow-up-right-from-square ms-2" style={{ fontSize: '0.72rem' }}></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.accommodation?.jaipur?.note && (
              <div className="accommodation-client-note mb-4">
                <i className="fa-solid fa-circle-info"></i>
                <div>
                  <strong>Recommendation Note: </strong>
                  "{content.accommodation.jaipur.note}"
                </div>
              </div>
            )}
          </div>

          {/* Wedding Venue details in a box/card */}
          {content.accommodation?.venue && (
            <div className="p-4 border rounded bg-white text-center shadow-sm">
              <h4 className="mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--accent-dark)' }}>
                {content.accommodation.venue.title}
              </h4>
              <p>{content.accommodation.venue.description}</p>
              <div className="d-flex justify-content-center gap-4 my-3 flex-wrap">
                {(content.accommodation.venue.rates || []).map((rate, rIdx) => (
                  <div className="p-3 border rounded text-center bg-light" style={{ minWidth: '200px' }} key={rIdx}>
                    <span className="fs-4 fw-bold text-dark">{rate.price}</span><br />{rate.label}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link to="/book-vijayran" className="btn btn-custom px-4 py-2">
                  <i className="fa-solid fa-hotel me-2"></i> Book Room & Payment Details
                </Link>
              </div>
            </div>
          )}
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
