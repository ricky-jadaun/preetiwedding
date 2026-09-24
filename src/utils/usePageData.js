import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageData(pageName) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Determine language based on the URL path: starts with /fr is French, otherwise English
  const isFrench = location.pathname.startsWith('/fr');
  const lang = isFrench ? 'fr' : 'en';

  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`${apiURL}/api/pages/${pageName}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load content for page '${pageName}' (Status: ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (active) {
          if (data.success) {
            setContent(data[lang]);
          } else {
            throw new Error(data.message || 'Page load error');
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Error connecting to server');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [pageName, lang, apiURL]);

  return { content, loading, error, lang };
}

// Helper to construct dynamic image URLs pointing to backend upload folders if uploaded via Multer
export const getImageUrl = (url) => {
  if (!url) return '';
  // If it's a relative path to static assets, an absolute URL (e.g., Cloudinary), or a data URL, return as-is
  if (url.startsWith('/assets/') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // Otherwise, it's an uploaded asset served by the backend server
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseURL}${url}`;
};
