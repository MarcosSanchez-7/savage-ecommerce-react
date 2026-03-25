import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Handles scroll behavior on route changes:
 * - PUSH/REPLACE: scroll to top before paint (no flash)
 * - POP (back/forward): restore saved position before paint (no flash)
 *
 * Root-cause fix for the "always returns to Home Top" bug:
 * The old cleanup saved window.scrollY AFTER React committed the new (shorter)
 * page to the DOM, causing the browser to clamp scrollY (e.g. from 2000 → 80)
 * and overwrite the correct value that the scroll listener had already saved.
 * Solution: save only via the scroll listener (fires while still on the old page),
 * never in the cleanup. Use useLayoutEffect so the restore runs before the browser
 * paints, eliminating any positional flash.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  // Let our code own scroll — disable browser's native restoration
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  // Save scroll position via listener only.
  // NOTE: Do NOT save in the cleanup — by cleanup time React has already
  // committed the new page, which may clamp window.scrollY if the new page
  // is shorter, overwriting the correct value the listener already stored.
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`scrollPos-${pathname}`, String(window.scrollY));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // Scroll behavior — runs synchronously before browser paint to avoid
  // the one-frame flash of the wrong position.
  useLayoutEffect(() => {
    if (navType !== "POP") {
      window.scrollTo(0, 0);
      return;
    }

    // Back/forward: restore saved position
    const saved = sessionStorage.getItem(`scrollPos-${pathname}`);
    if (!saved) return;

    const target = parseInt(saved, 10);
    if (target <= 0) return;

    window.scrollTo({ top: target, behavior: "instant" as ScrollBehavior });
  }, [pathname, navType]);

  // Meta Pixel PageView on route change (SPA support)
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
