import React from "react";
import { motion, type Variants } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Create your event",
    description:
      "Add dates, tiers, and seat types. Enable Mobile Money + cards instantly.",
  },
  {
    number: "02",
    title: "Drive sales",
    description:
      "Promo codes, waitlists, shareable links, and USSD *365*88# for universal reach.",
  },
  {
    number: "03",
    title: "Scan with confidence",
    description:
      "Instant ticket validation, fraud checks, and live attendance data.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export const HowItWorks: React.FC = () => {
  return (
    <section className="w-full py-24  bg-white/70 overflow-hidden">
      <div className="mx-auto container px-6 lg:px-12 max-w-7xl">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-4 max-w-2xl"
          >
            <div className="inline-flex items-center gap-3">
              <span className="text-sm font-sans font-medium text-foreground uppercase tracking-widest">
                Create &rarr; Sell &rarr; Scan
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl text-foreground leading-[1.1] tracking-tight">
              A clear path from setup to sold-out,
              <span className="italic text-neutral-400">
                built for busy teams.
              </span>
            </h2>
          </motion.div>
        </div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative"
        >
          {/* Subtle Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px bg-neutral-200 z-0" />

          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative z-10 flex flex-col items-start group cursor-default"
            >
              {/* Number Indicator & Icon Circle */}
              <div className="flex items-center mb-8 w-full">
                <div className="w-20 h-20 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center shadow-sm group-hover:border-[#1a201c]/20 group-hover:bg-[#1a201c]/5 transition-colors duration-500">
                  <span className=" text-3xl text-foreground">
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-sans font-medium text-foreground mb-4">
                {step.title}
              </h3>
              <p className="text-neutral-500 font-sans text-base leading-relaxed max-w-70">
                {step.description}
              </p>

              {/* Decorative Watermark Number (Hover Effect) */}
              <div className="absolute -bottom-10 -right-4 text-[12rem] font-serif font-bold text-neutral-50 opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-700 pointer-events-none z-[-1]">
                {step.number}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
