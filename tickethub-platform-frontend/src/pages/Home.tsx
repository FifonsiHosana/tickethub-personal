import { Hero } from "@/components/sections/Home/Hero";
import { HowItWorks } from "@/components/sections/Home/HowItWorks";
import { TrustedBrands } from "@/components/sections/Home/TrustedBrands";
import { EventsList } from "@/components/sections/Home/EventsList";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <TrustedBrands />
      <EventsList />
    </>
  );
}
