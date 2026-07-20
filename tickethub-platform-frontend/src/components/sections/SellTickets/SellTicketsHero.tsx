import React from "react";
import { motion } from "framer-motion";

export const SellTicketsHero: React.FC = () => {
  return (
    <section
      style={{
        backgroundSize: "cover",
        backgroundImage: `url("https://cdn.ayatickets.com/uploads/homepage/marquee/69983f4d91e91919206595.webp")`,
      }}
      className="relative w-full py-32 lg:py-48 text-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/40 z-10" />f
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-sans font-medium tracking-tight leading-[1.05] max-w-4xl mb-8"
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
          className="text-base md:text-xl text-white font-sans max-w-2xl mb-10"
        >
          Create events, sell tickets seamlessly, and get paid instantly. Join
          the platform trusted by top creators and event curators.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button className="px-10 py-5 rounded-full bg-primary text-white text-lg font-semibold hover:scale-105 active:scale-95 transition-all">
            Get Started for Free
          </button>
        </motion.div>
      </div>
    </section>
  );
};
