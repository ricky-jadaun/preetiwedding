import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToHashElement() {
  const { hash, pathname } = useLocation();

  const scrollToElement = (id) => {
    let retries = 0;
    const maxRetries = 10;

    const attemptScroll = () => {
      const element = document.getElementById(id);
      if (element) {
        const navbar = document.getElementById('mainNav') || document.querySelector('.navbar');
        const offset = navbar ? navbar.offsetHeight : 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(attemptScroll, 100);
      }
    };

    attemptScroll();
  };

  // Handle route change / initial load with hash
  useEffect(() => {
    if (hash) {
      const targetId = hash.substring(1);
      scrollToElement(targetId);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);

  // Handle clicks on same-page hash links (even if hash is the same)
  useEffect(() => {
    const handleHashLinkClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      try {
        const url = new URL(link.href, window.location.href);
        const normalizePath = (path) => path.replace(/\/$/, '') || '/';
        const urlPath = normalizePath(url.pathname);
        const currentPath = normalizePath(window.location.pathname);

        // If pathname matches current page, and it's a hash link
        if (urlPath === currentPath && url.hash) {
          const targetId = url.hash.substring(1);
          const element = document.getElementById(targetId);
          if (element) {
            e.preventDefault();
            scrollToElement(targetId);
            // Update hash in address bar if it changed
            if (window.location.hash !== url.hash) {
              window.history.pushState(null, '', url.hash);
            }
          }
        }
      } catch (err) {
        // ignore invalid URLs
      }
    };

    document.addEventListener('click', handleHashLinkClick);
    return () => document.removeEventListener('click', handleHashLinkClick);
  }, []);

  return null;
}
