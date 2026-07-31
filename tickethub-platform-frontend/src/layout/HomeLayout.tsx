import { Outlet } from "react-router";
import { Navbar } from "@/components/shared/Navbar/Navbar.tsx";
import Footer from "@/components/shared/Footer/Footer.tsx";
import ScrollToTopButton from "@/components/shared/ScrollToTopButton";

export default function HomeLayout() {
  return (
    <>
      <Navbar />

      <main className="relative">
        <Outlet />
        <ScrollToTopButton />
      </main>

      <Footer />
    </>
  );
}