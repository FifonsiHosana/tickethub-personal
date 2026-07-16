import { Outlet } from "react-router";
import { Navbar } from "@/components/shared/Navbar/Navbar.tsx";
import Footer from "@/components/shared/Footer/Footer.tsx";

export default function HomeLayout() {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
