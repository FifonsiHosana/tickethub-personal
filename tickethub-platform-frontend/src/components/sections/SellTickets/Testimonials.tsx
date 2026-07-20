import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Switching to TicketHub was the best decision for our annual festival. The dashboard is incredibly intuitive, and payouts were flawless.",
    name: "Akosua Mensah",
    role: "Director, AfroVibe Fest",
  },
  {
    quote:
      "The real-time analytics helped us adjust our marketing spend on the fly. We sold out 3 days earlier than last year.",
    name: "David Osei",
    role: "Founder, Tech Meetup Accra",
  },
  {
    quote:
      "Scanning tickets at the door used to be a nightmare. Their check-in system handled 2,000 attendees smoothly without a single crash.",
    name: "Kwabena Boateng",
    role: "Event Manager, LiveNation GH",
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 md:py-32 bg-[#1a201c] text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-serif italic text-neutral-300 mb-4">
            Trusted by top creators.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              // Offsetting the middle card for a dynamic look
              className={`p-8 rounded-4xl bg-white/5 border border-white/10 backdrop-blur-sm ${
                index === 1 ? "md:translate-y-8" : ""
              }`}
            >
              <div className="text-primary text-4xl font-serif mb-4">"</div>
              <p className="text-neutral-300 text-lg leading-relaxed mb-8">
                {test.quote}
              </p>
              <div>
                <p className="font-bold text-white">{test.name}</p>
                <p className="text-sm text-neutral-500">{test.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
