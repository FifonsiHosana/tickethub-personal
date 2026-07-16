import { Routes, Route, BrowserRouter as Router } from "react-router";
import { motion } from "motion/react";

import Home from "@/pages/Home";
import Login from "@/pages/Auth/Login";
import ScrollToTop from "@/components/shared/ScrollToTop";
import HomeLayout from "@/layout/HomeLayout";
import AuthLayout from "@/layout/AuthLayout";
import { Toaster } from "@/components/ui/sonner";
import DashboardLayout from "@/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Events from "@/pages/Events/Events";
import { Checkout } from "@/pages/Checkout/Checkout";

export default function RouterLayout() {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full overflow-x-clip"
    >
      <Router>
        <ScrollToTop />
        <Routes>
          <Route
            element={
              <PublicRoute>
                <HomeLayout />
              </PublicRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Home />} />
            <Route path="/events/:id" element={<Events />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>

          <Route
            element={
              <PublicRoute>
                <AuthLayout />
              </PublicRoute>
            }
          >
            <Route path="/login" element={<Login />} />
            {/* <Route path="/signup" element={<SignUp />} /> */}
          </Route>

          {/* Dashboard route */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin", "organizer"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
        <Toaster position="bottom-right" />
      </Router>
    </motion.div>
  );
}
