import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Create your event",
    description:
      "Set up your event page in minutes. Add beautiful imagery, set ticket tiers, and customize your capacity using our intuitive dashboard.",
  },
  {
    number: "02",
    title: "Sell tickets",
    description:
      "Share your dedicated link and watch the sales roll in. Reach thousands of eager attendees natively on the TicketHub platform.",
  },
  {
    number: "03",
    title: "Get paid",
    description:
      "Enjoy fast, reliable payouts directly to your bank account or via Mobile Money the moment your event successfully concludes.",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 md:py-32 bg-neutral-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 md:mb-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#1a201c] tracking-tight">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex flex-col gap-4 relative"
            >
              {/* Connecting line for desktop */}
              {index !== 2 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-px bg-neutral-200" />
              )}

              <span className="text-6xl lg:text-7xl text-primary italic mb-2">
                {step.number}.
              </span>
              <h3 className="text-2xl font-bold text-[#1a201c]">
                {step.title}
              </h3>
              <p className="text-neutral-500 font-sans leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
