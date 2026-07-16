import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );
  const [isScrolled, setIsScrolled] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    onScroll();

    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onScroll);
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onScroll);
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return { isMobile, isScrolled };
}
