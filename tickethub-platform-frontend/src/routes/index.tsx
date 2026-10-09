import { lazy, Suspense } from "react";
import { Routes, Route, BrowserRouter as Router, Navigate } from "react-router";
import { motion } from "motion/react";
import Home from "@/pages/Home";
import ScrollToTop from "@/components/shared/ScrollToTop";
import HomeLayout from "@/layout/HomeLayout";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

const AuthLayout = lazy(() => import("@/layout/AuthLayout"));
const DashboardLayout = lazy(() => import("@/layout/DashboardLayout"));
const Login = lazy(() => import("@/pages/Auth/Login"));
const SignUp = lazy(() => import("@/pages/Auth/SignUp"));
const VerifyEmail = lazy(() => import("@/pages/Auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("@/pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/Auth/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard/Dashboard"));
const Events = lazy(() => import("@/pages/Event/Event"));
const Checkout = lazy(() => import("@/pages/Checkout/Checkout").then((module) => ({ default: module.Checkout })));
const CreateEventPage = lazy(() => import("@/pages/Dashboard/Organizer/CreateEvent"));
const EditEventPage = lazy(() => import("@/pages/Dashboard/Organizer/EditEvent"));
const EventsList = lazy(() => import("@/pages/Dashboard/Organizer/EventsList"));
const EventsListPage = lazy(() => import("@/pages/Events/Events"));
const OrganizerAd = lazy(() => import("@/pages/SellTickets/OrganizerAd"));
const TicketPerformancePage = lazy(() => import("@/pages/Dashboard/Organizer/TicketPerformance"));
const EventPerformancePage = lazy(() => import("@/pages/Dashboard/Organizer/EventPerformance"));
const RevenueAndPayoutsPage = lazy(() => import("@/pages/Dashboard/Organizer/RevenueAndPayouts"));
const AnalyticsOverviewPage = lazy(() => import("@/pages/Dashboard/Organizer/AnalyticsOverview"));
const PayoutSettingsPage = lazy(() => import("@/pages/Dashboard/Organizer/PayoutSettings/PayoutSettingsPage"));
const DashboardOverview = lazy(() => import("@/pages/Dashboard/Organizer/DashboardOverview/DashboardOverview"));
const Attendees = lazy(() => import("@/pages/Dashboard/Organizer/Attendees/Attendees"));
const EventStaff = lazy(() => import("@/pages/Dashboard/Organizer/Attendees/EventStaff"));
const OrganizerOrdersPage = lazy(() => import("@/pages/Dashboard/Organizer/OrganizerOrders"));
const OrganizerEventDetail = lazy(() => import("@/pages/Dashboard/Organizer/OrganizerEventDetail"));
const PublicTicket = lazy(() => import("@/pages/PublicTicket/PublicTicket"));
const AdminDashboard = lazy(() => import("@/pages/Dashboard/Admin/AdminDashboard"));
const AdminOrganizers = lazy(() => import("@/pages/Dashboard/Admin/AdminOrganizers"));
const AdminOrganizerDetail = lazy(() => import("@/pages/Dashboard/Admin/AdminOrganizerDetail"));
const AdminAnalytics = lazy(() => import("@/pages/Dashboard/Admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("@/pages/Dashboard/Admin/AdminSettings"));
const TicketOrderHistory = lazy(() => import("@/pages/Attendee/TicketOrderHistory"));
const AccountSetupPasswordPage = lazy(() => import("@/pages/Attendee/AccountSetupPassword"));
const SuccessPage = lazy(() => import("@/pages/Checkout/Success"));
const CancelPage = lazy(() => import("@/pages/Checkout/Cancel"));
const SmsPage = lazy(() => import("@/pages/Dashboard/Organizer/SMS/SmsPage"));

function RouteFallback() {
  return <div className="min-h-24" />;
}

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
        <Suspense fallback={<RouteFallback />}>
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
              <Route path="/ticket-order-history/:orderId" element={<TicketOrderHistory />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin", "organizer", "event_staff"]}><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/organizer/dashboard" element={<DashboardOverview />} />
              <Route path="/organizer/events/new" element={<CreateEventPage />} />
              <Route path="/organizer/events/:id/edit" element={<EditEventPage />} />
              <Route path="/organizer/events/:id" element={<OrganizerEventDetail />} />
              <Route path="/organizer/events" element={<EventsList />} />
              <Route path="/organizer/orders" element={<OrganizerOrdersPage />} />
              <Route path="/organizer/tickets" element={<Navigate to="/organizer/events" replace />} />
              <Route path="/organizer/sales" element={<Navigate to="/organizer/analytics?tab=ticket-sales" replace />} />
              <Route path="/organizer/sales/analytics" element={<Navigate to="/organizer/analytics?tab=sales-analytics" replace />} />
              <Route path="/organizer/sms" element={<SmsPage />} />
              <Route path="/organizer/sms/history" element={<Navigate to="/organizer/sms?tab=history" replace />} />
              <Route path="/organizer/sms/credits" element={<Navigate to="/organizer/sms?tab=credits" replace />} />
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
              <Route path="/organizer/more" element={<Navigate to="/organizer/analytics" replace />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/organizers/:id" element={<AdminOrganizerDetail />} />
              <Route path="/admin/organizers" element={<AdminOrganizers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster richColors position="top-right" />
      </Router>
    </motion.div>
  );
}