import React from "react";
import { motion } from "framer-motion";
import { DollarSignIcon, BarChart2Icon, SmartphoneIcon, LifeBuoyIcon } from "lucide-react";

const benefits = [
  {
    title: "Lowest Fees",
    description:
      "Keep more of your revenue with our highly competitive transaction rates.",
    icon: <DollarSignIcon className="w-8 h-8 text-primary" />,
  },
  {
    title: "Real-time Analytics",
    description:
      "Track sales, page views, and attendee demographics live from your dashboard.",
    icon: <BarChart2Icon className="w-8 h-8 text-primary" />,
  },
  {
    title: "Seamless Check-in App",
    description:
      "Scan QR codes at the door effortlessly with our dedicated organizer mobile app.",
    icon: <SmartphoneIcon className="w-8 h-8 text-primary" />,
  },
  {
    title: "24/7 Organizer Support",
    description:
      "Our team is always on standby to ensure your event runs without a hitch.",
    icon: <LifeBuoyIcon className="w-8 h-8 text-primary" />,
  },
];

export const WhyUs: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left text block */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h2 className="text-4xl md:text-5xl text-foreground leading-tight">
            Everything you need to run a flawless event.
          </h2>
          <p className="text-lg text-neutral-500 font-sans">
            We handle the heavy lifting of ticketing, payments, and analytics so
            you can focus on what you do best: creating unforgettable
            experiences.
          </p>
        </div>

        {/* Right Bento Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-neutral-50/50 border border-neutral-100 hover:-translate-y-1 transition-all duration-300"
            > 
              <div className="mb-6">{benefit.icon}</div>
              <h3 className="text-xl font-bold text-[#1a201c] mb-2">
                {benefit.title}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
