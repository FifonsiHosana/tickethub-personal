import React from "react";
import { motion } from "framer-motion";

// Placeholders for your trusted brands.
// You can replace the 'name' with an 'imgSrc' later when you have the actual SVG logos.
const trustedBrands = [
  { id: 1, name: "Spotify" },
  { id: 2, name: "Live Nation" },
  { id: 3, name: "Paystack" },
  { id: 4, name: "MTN" },
  { id: 5, name: "Eventbrite" },
  { id: 6, name: "Ticketmaster" },
  { id: 7, name: "Rave" },
  { id: 8, name: "Afronation" },
];

export const TrustedBrands: React.FC = () => {
  // Duplicating the array ensures the infinite scroll has no gaps
  const duplicatedBrands = [...trustedBrands, ...trustedBrands];

  return (
    <section className="w-full py-12 md:py-16 bg-white overflow-hidden border-b border-neutral-100">
      <div className="mx-auto container px-6 lg:px-12 max-w-7xl flex flex-col items-center">
        {/* Subtle Overline Text */}
        <p className="text-xs md:text-sm font-sans font-medium text-neutral-800 uppercase tracking-widest mb-8 text-center">
          Powering over 500+ top event creators worldwide
        </p>

        {/* Marquee Container with Gradient Mask for smooth fade at the edges */}
        <div
          className="relative w-full flex overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <motion.div
            className="flex items-center gap-16 md:gap-24 whitespace-nowrap py-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 30, // Adjust this to make it faster or slower
            }}
          >
            {duplicatedBrands.map((brand, index) => (
              <div
                key={`${brand.id}-${index}`}
                className="flex items-center justify-center min-w-30"
              >
                {/* 
                  Placeholder styling. 
                  When you add real images, swap this out for an <img /> tag 
                  and use classes like 'h-8 w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all'
                */}
                <span className="text-2xl font-serif font-bold text-neutral-300 transition-colors duration-300 hover:text-[#1a201c] cursor-default">
                  {brand.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
