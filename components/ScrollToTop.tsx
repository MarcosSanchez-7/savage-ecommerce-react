import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Component that forces the window to scroll to top on explicit navigation.
 * Maintains native scroll position when user clicks back/forward (POP).
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Force set scroll to top immediately on new route pushes, NOT when going back
    if (navType !== "POP") {
      window.scrollTo(0, 0);

      // Some browsers need a slight delay or a direct set on documentElement
      // especially on mobile when the page height is still adjusting.
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTo(0, 0);
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [pathname, navType]);

  useEffect(() => {
    // Meta Pixel PageView Trigger on Route Change (SPA Support)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
