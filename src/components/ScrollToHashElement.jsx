import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToHashElement() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const targetId = hash.substring(1);
    
    // Helper function to scroll to the element with navbar offset
    const scrollToElement = (element) => {
      const navbar = document.getElementById('mainNav') || document.querySelector('.navbar');
      const offset = navbar ? navbar.offsetHeight : 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    };

    // 1. Try to find the element immediately
    const immediateElement = document.getElementById(targetId);
    if (immediateElement) {
      const timer = setTimeout(() => scrollToElement(immediateElement), 50);
      return () => clearTimeout(timer);
    }

    // 2. If it doesn't exist yet (e.g. page is fetching/loading), observe the DOM
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.getElementById(targetId);
      if (element) {
        // Small delay to ensure any styling and child elements are fully rendered/laid out
        setTimeout(() => {
          scrollToElement(element);
        }, 50);
        obs.disconnect(); // stop observing once scrolled
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up observer on hash or pathname change
    return () => observer.disconnect();
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
            
            const navbar = document.getElementById('mainNav') || document.querySelector('.navbar');
            const offset = navbar ? navbar.offsetHeight : 80;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

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
