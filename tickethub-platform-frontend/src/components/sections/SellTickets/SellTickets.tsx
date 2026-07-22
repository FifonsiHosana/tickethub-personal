import React from "react";
import { SellTicketsHero } from "./SellTicketsHero";
import { HowItWorks } from "./HowItWorks";
import { WhyUs } from "./WhyUs";
// import { Testimonials } from "./Testimonials";
import { useNavigate } from "react-router";

export const SellTickets: React.FC = () => {
  const navigate = useNavigate();
  return (
    <main className="w-full min-h-screen bg-white">
      <SellTicketsHero />
      <HowItWorks />
      <WhyUs />
      {/* <Testimonials /> */}

      {/* Final Bottom CTA */}
      <section className="py-16 text-center bg-white px-6">
        <h2 className="text-xl md:text-4xl font-bold text-foreground mb-8 tracking-tighter">
          Ready to host your next big event?
        </h2>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 lg:px-8 lg:py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/60 hover:scale-105 active:scale-95 transition-all"
        >
          Create an Organizer Account
        </button>
      </section>
    </main>
  );
};
