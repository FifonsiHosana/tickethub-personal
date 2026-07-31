import { useEffect } from "react";
import { useLocation } from "react-router";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Reset scroll to top-left on path change
  }, [pathname]);

  return null;
}

// NOTE: This scroll to top is the default react scroll to top behavior when visiting a new route.
// For the scroll to top behavior on a click event, cheeck the ScrollToTopButton
