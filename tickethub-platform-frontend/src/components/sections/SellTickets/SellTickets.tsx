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
      <section className="py-24 text-center bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tighter">
          Ready to host your next big event?
        </h2>
        <button
          onClick={() => navigate("/login")}
          className="px-10 py-5 rounded-full bg-primary text-white text-lg font-semibold hover:bg-primary/60 hover:scale-105 active:scale-95 transition-all"
        >
          Create an Organizer Account
        </button>
      </section>
    </main>
  );
};
