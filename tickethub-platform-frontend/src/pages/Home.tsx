import { Hero } from "@/components/sections/Home/Hero";
import { EventsList } from "@/components/sections/Home/EventsList";
import ScrollToTopButton from "@/components/shared/ScrollToTopButton";

export default function Home() {
  return (
    <>
      <Hero />
      <EventsList />
      <ScrollToTopButton />
    </>
  );
}
