import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Smoothly scrolls the window to the top whenever the route changes.
 * Mounted once, near the router root.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // `instant` for the very first paint, smooth otherwise
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
