import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Pathname only, so filter/pagination changes (query string) don't jump the page
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}