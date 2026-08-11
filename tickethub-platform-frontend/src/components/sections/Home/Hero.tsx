import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { slides } from "@/misc/heroData";
import { useNavigate } from "react-router";

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-120 lg:min-h-150 flex flex-col w-full">
      {/* Slideshow Background */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center lg:bg-top bg-no-repeat"
            style={{
              backgroundImage: `url('${slides[currentSlide]}')`,
            }}
          />
        </AnimatePresence>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-linear-to-t from-black via-black/60 to-transparent z-10 pointer-events-none"></div>

      {/* Main Hero Section Aligned to Bottom */}
      <main className="relative z-20 grow flex flex-col items-center justify-end pb-8 px-6">
        {/* Hero Content */}
        <div className="flex flex-col items-center text-center max-w-4xl w-full">
          <div className="space-y-4 mb-4">
            <h1 className="text-4xl md:text-5xl xl:text-7xl 2xl:text-8xl font-sans font-medium text-white leading-[1.05]">
              The <span className="font-semibold text-primary">#1</span> spot
              for events
            </h1>

            <h2 className="text-white font-sans text-sm md:text-lg">
              Buy tickets in seconds or sell out your event with Mobile Money,
              card, and USSD.
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center md:justify-center w-full">
            <button
              onClick={() => navigate("/events")}
              className="flex items-center justify-center gap-3 px-16 py-3 bg-primary/80 text-white rounded-full text-base font-medium hover:scale-105 hover:bg-primary/60 hover:cursor-pointer w-full md:w-auto transition-all"
            >
              Browse Events
            </button>
          </div>
        </div>
      </main>
    </section>
  );
};
