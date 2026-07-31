import { Routes, Route, BrowserRouter as Router } from "react-router";
import { motion } from "motion/react";
import Home from "@/pages/Home";
import Login from "@/pages/Auth/Login";
import SignUp from "@/pages/Auth/SignUp";
import VerifyEmail from "@/pages/Auth/VerifyEmail";
import ScrollToTop from "@/components/shared/ScrollToTop";
import HomeLayout from "@/layout/HomeLayout";
import AuthLayout from "@/layout/AuthLayout";
import { Toaster } from "@/components/ui/sonner";
import DashboardLayout from "@/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Events from "@/pages/Event/Event";
import { Checkout } from "@/pages/Checkout/Checkout";
import CreateEventPage from "@/pages/Dashboard/Organizer/CreateEvent";
import EventsList from "@/pages/Dashboard/Organizer/EventsList";
import EventsListPage from "@/pages/Events/Events";
import OrganizerAd from "@/pages/SellTickets/OrganizerAd";
import TicketSalesPage from "@/pages/Dashboard/Organizer/TicketSales";
import SalesAnalyticsPage from "@/pages/Dashboard/Organizer/SalesAnalytics";
import TicketPerformancePage from "@/pages/Dashboard/Organizer/TicketPerformance";
import EventPerformancePage from "@/pages/Dashboard/Organizer/EventPerformance";
import RevenueAndPayoutsPage from "@/pages/Dashboard/Organizer/RevenueAndPayouts";
import PayoutSettingsPage from "@/pages/Dashboard/Organizer/PayoutSettings/PayoutSettingsPage";
import DashboardOverview from "@/pages/Dashboard/Organizer/DashboardOverview/DashboardOverview";
import TicketTypes from "@/pages/Dashboard/Organizer/Tickets/TicketTypes";
import Attendees from "@/pages/Dashboard/Organizer/Attendees/Attendees";
import EventStaff from "@/pages/Dashboard/Organizer/Attendees/EventStaff";
import PublicTicket from "@/pages/PublicTicket/PublicTicket";
import AdminDashboard from "@/pages/Dashboard/Admin/AdminDashboard";
import AdminOrganizers from "@/pages/Dashboard/Admin/AdminOrganizers";
// import AdminEvents from "@/pages/Dashboard/Admin/AdminEvents";
import AdminAnalytics from "@/pages/Dashboard/Admin/AdminAnalytics";
import AdminPayouts from "@/pages/Dashboard/Admin/AdminPayouts";
import AdminSettings from "@/pages/Dashboard/Admin/AdminSettings";

// import AnalyticsOverview from "@/pages/Dashboard/Organizer/AnalyticsOverview";

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
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/sell-event-tickets" element={<OrganizerAd />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/t/:ticketIdentifier" element={<PublicTicket />} />
          </Route>

          <Route
            element={
              <PublicRoute>
                <AuthLayout />
              </PublicRoute>
            }
          >
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["admin", "organizer", "event_staff"]}
              >
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect /dashboard to first nav item */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Dashboard Overview */}
            <Route
              path="/organizer/dashboard"
              element={<DashboardOverview />}
            />

            {/* Events */}
            <Route path="/organizer/events/new" element={<CreateEventPage />} />
            <Route path="/organizer/events" element={<EventsList />} />

            {/* Tickets */}
            <Route path="/organizer/tickets" element={<TicketTypes />} />
            <Route path="/organizer/sales" element={<TicketSalesPage />} />
            <Route
              path="/organizer/sales/analytics"
              element={<SalesAnalyticsPage />}
            />

            {/* Attendees */}
            <Route path="/organizer/attendees" element={<Attendees />} />
            <Route path="/organizer/attendees/staff" element={<EventStaff />} />
            <Route path="/event-staff/attendees" element={<Attendees />} />

            {/* Payout Settings */}
            <Route path="/organizer/payout-settings" element={<PayoutSettingsPage />} />

            {/* Analytics */}

            <Route
              path="/organizer/analytics/events"
              element={<EventPerformancePage />}
            />
            <Route
              path="/organizer/analytics/revenue"
              element={<RevenueAndPayoutsPage />}
            />
            <Route
              path="/organizer/analytics/tickets"
              element={<TicketPerformancePage />}
            />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/organizers" element={<AdminOrganizers />} />
            {/* <Route path="/admin/events" element={<AdminEvents />} /> */}
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/payouts" element={<AdminPayouts />} />

            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        <Toaster position="bottom-right" />
      </Router>
      
    </motion.div>
  );
}
