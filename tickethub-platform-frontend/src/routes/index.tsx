import { Routes, Route, BrowserRouter as Router, Navigate } from "react-router";
import { motion } from "motion/react";
import Home from "@/pages/Home";
import Login from "@/pages/Auth/Login";
import SignUp from "@/pages/Auth/SignUp";
import VerifyEmail from "@/pages/Auth/VerifyEmail";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import ResetPassword from "@/pages/Auth/ResetPassword";
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
import EditEventPage from "@/pages/Dashboard/Organizer/EditEvent";
import EventsList from "@/pages/Dashboard/Organizer/EventsList";
import EventsListPage from "@/pages/Events/Events";
import OrganizerAd from "@/pages/SellTickets/OrganizerAd";
import TicketSalesPage from "@/pages/Dashboard/Organizer/TicketSales";
import SalesAnalyticsPage from "@/pages/Dashboard/Organizer/SalesAnalytics";
import TicketPerformancePage from "@/pages/Dashboard/Organizer/TicketPerformance";
import EventPerformancePage from "@/pages/Dashboard/Organizer/EventPerformance";
import RevenueAndPayoutsPage from "@/pages/Dashboard/Organizer/RevenueAndPayouts";
import AnalyticsOverviewPage from "@/pages/Dashboard/Organizer/AnalyticsOverview";
import PayoutSettingsPage from "@/pages/Dashboard/Organizer/PayoutSettings/PayoutSettingsPage";
import DashboardOverview from "@/pages/Dashboard/Organizer/DashboardOverview/DashboardOverview";
import TicketTypes from "@/pages/Dashboard/Organizer/Tickets/TicketTypes";
import Attendees from "@/pages/Dashboard/Organizer/Attendees/Attendees";
import EventStaff from "@/pages/Dashboard/Organizer/Attendees/EventStaff";
import OrganizerOrdersPage from "@/pages/Dashboard/Organizer/OrganizerOrders";
import OrganizerMorePage from "@/pages/Dashboard/Organizer/OrganizerMore";
import PublicTicket from "@/pages/PublicTicket/PublicTicket";
import AdminDashboard from "@/pages/Dashboard/Admin/AdminDashboard";
import AdminOrganizers from "@/pages/Dashboard/Admin/AdminOrganizers";
import AdminOrganizerDetail from "@/pages/Dashboard/Admin/AdminOrganizerDetail";
import AdminAnalytics from "@/pages/Dashboard/Admin/AdminAnalytics";
import AdminSettings from "@/pages/Dashboard/Admin/AdminSettings";
import TicketOrderHistory from "@/pages/Attendee/TicketOrderHistory";
import AccountSetupPasswordPage from "@/pages/Attendee/AccountSetupPassword";
import SuccessPage from "@/pages/Checkout/Success";
import CancelPage from "@/pages/Checkout/Cancel";
import SmsCampaign from "@/pages/Dashboard/Organizer/SMS/SmsCampaign";
import SmsHistory from "@/pages/Dashboard/Organizer/SMS/SmsHistory";
import SmsCredits from "@/pages/Dashboard/Organizer/SMS/SmsCredits";

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
          <Route element={<PublicRoute><HomeLayout /></PublicRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Home />} />
            <Route path="/events/:id" element={<Events />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/sell-event-tickets" element={<OrganizerAd />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/cancel" element={<CancelPage />} />
            <Route path="/t/:ticketIdentifier" element={<PublicTicket />} />
          </Route>

          <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/account/setup-password" element={<AccountSetupPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin", "organizer", "event_staff", "attendee"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/ticket-order-history" element={<TicketOrderHistory />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin", "organizer", "event_staff"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/organizer/dashboard" element={<DashboardOverview />} />
            <Route path="/organizer/events/new" element={<CreateEventPage />} />
            <Route path="/organizer/events/:id/edit" element={<EditEventPage />} />
            <Route path="/organizer/events" element={<EventsList />} />
            <Route path="/organizer/orders" element={<OrganizerOrdersPage />} />
            <Route path="/organizer/tickets" element={<TicketTypes />} />
            <Route path="/organizer/sales" element={<TicketSalesPage />} />
            <Route path="/organizer/sales/analytics" element={<SalesAnalyticsPage />} />
            <Route path="/organizer/sms" element={<SmsCampaign />} />
            <Route path="/organizer/sms/history" element={<SmsHistory />} />
            <Route path="/organizer/sms/credits" element={<SmsCredits />} />
            <Route path="/organizer/scan" element={<Attendees />} />
            <Route path="/organizer/attendees" element={<Navigate to="/organizer/scan" replace />} />
            <Route path="/organizer/staff" element={<EventStaff />} />
            <Route path="/organizer/attendees/staff" element={<Navigate to="/organizer/staff" replace />} />
            <Route path="/event-staff/attendees" element={<Attendees />} />
            <Route path="/organizer/payout-settings" element={<PayoutSettingsPage />} />
            <Route path="/organizer/analytics" element={<AnalyticsOverviewPage />} />
            <Route path="/organizer/analytics/overview" element={<Navigate to="/organizer/analytics" replace />} />
            <Route path="/organizer/analytics/events" element={<EventPerformancePage />} />
            <Route path="/organizer/analytics/revenue" element={<RevenueAndPayoutsPage />} />
            <Route path="/organizer/analytics/tickets" element={<TicketPerformancePage />} />
            <Route path="/organizer/more" element={<OrganizerMorePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/organizers/:id" element={<AdminOrganizerDetail />} />
            <Route path="/admin/organizers" element={<AdminOrganizers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </Router>
    </motion.div>
  );
}
