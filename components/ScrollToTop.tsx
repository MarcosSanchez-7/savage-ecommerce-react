import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Component that forces the window to scroll to top on every route change.
 * This fixes the issue where navigating to a new page (or going back) 
 * sometimes leaves the scroll position at the bottom or middle of the screen.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force set scroll to top immediately on route change
    window.scrollTo(0, 0);
    
    // Some browsers need a slight delay or a direct set on documentElement
    // especially on mobile when the page height is still adjusting.
    const timer = setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTo(0, 0);
    }, 10);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
