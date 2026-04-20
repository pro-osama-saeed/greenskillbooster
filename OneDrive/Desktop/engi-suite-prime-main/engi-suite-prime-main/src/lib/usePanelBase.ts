import { useLocation } from "react-router-dom";

/**
 * Returns the current panel base path (/admin or /staff) based on the URL.
 * Lets shared page components build links that stay inside the active panel.
 */
export const usePanelBase = (): "/admin" | "/staff" => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return "/admin";
  return "/staff";
};
