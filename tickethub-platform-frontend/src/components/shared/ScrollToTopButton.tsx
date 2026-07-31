import { useState, useEffect } from "react";
import { FiChevronUp } from "react-icons/fi";

const ScrollToTopButton = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (window.scrollY > 400) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener("scroll", checkScrollTop);

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, []);

  const backToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={backToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-white shadow-lg shadow-primary/60 transition-all duration-300 ease-in-out hover:bg-primary/60 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center ${
        showScroll
          ? "opacity-100 translate-y-0 cursor-pointer"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <FiChevronUp className="w-6 h-6" />
    </button>
  );
};

export default ScrollToTopButton;
