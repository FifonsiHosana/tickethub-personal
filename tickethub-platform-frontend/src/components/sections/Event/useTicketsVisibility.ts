import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether the ticket section is in view (mobile only) and
 * exposes a smooth-scroll helper. The mobile sticky "Get Tickets"
 * bar shows whenever the ticket section is outside the viewport.
 */
export function useTicketsVisibility(isMobile: boolean) {
  const [isTicketsVisible, setIsTicketsVisible] = useState(false);
  const ticketsSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMobile) {
      setIsTicketsVisible(false);
      return;
    }

    const target = ticketsSectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsTicketsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isMobile]);

  const scrollToTickets = () => {
    ticketsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return { ticketsSectionRef, isTicketsVisible, scrollToTickets };
}
