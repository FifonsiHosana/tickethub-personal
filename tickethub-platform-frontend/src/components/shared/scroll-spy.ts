// hooks/useScrollSpy.ts
import { useEffect, useState } from "react";

export function useScrollSpy(ids: string[], offset = 120) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      let current = 0;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = i;
      });
      // At the very bottom, force the last step (short last sections never reach the top)
      if (
        window.innerHeight + window.scrollY >=
        document.body.scrollHeight - 2
      ) {
        current = ids.length - 1;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids, offset]);

  return active;
}
