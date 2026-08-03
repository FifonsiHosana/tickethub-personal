import React from "react";
import { motion } from "framer-motion";

export const SellTicketsHero: React.FC = () => {
  return (
    <section
      style={{
        backgroundSize: "center",
        backgroundImage: `url("https://cdn.ayatickets.com/uploads/homepage/marquee/69983f4d91e91919206595.webp")`,
      }}
      className="relative min-h-screen flex flex-col w-full text-white overflow-hidden"
    >
      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-linear-to-t from-black/95 via-black/60 to-transparent z-10 pointer-events-none"></div>

      <div className="relative z-20 grow flex flex-col items-center justify-end pb-8 px-6">
        <div className="flex flex-col items-center text-center max-w-4xl space-y-4 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-sans font-medium tracking-tight leading-[1.05] max-w-4xl"
          >
            Turn your vision into a <br className="hidden md:block" />
            <span className="font-serif italic font-normal text-primary">
              sold-out
            </span>{" "}
            experience.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-xl text-white font-sans max-w-2xl"
          >
            Create events, sell tickets seamlessly, and get paid instantly. Join
            the platform trusted by top creators and event curators.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button className="px-6 py-2 lg:px-8 lg:py-3 rounded-full bg-primary text-white font-semibold hover:scale-105 active:scale-95 transition-all">
              Get Started for Free
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
