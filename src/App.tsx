import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Consultants from "./pages/Consultants";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import NetworkHub from "./pages/NetworkHub";
import ChannelView from "./pages/ChannelView";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import FAQs from "./pages/FAQs";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminContent from "./pages/admin/AdminContent";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminConsultants from "./pages/admin/AdminConsultants";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminFAQs from "./pages/admin/AdminFAQs";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminNetworkingChannels from "./pages/admin/AdminNetworkingChannels";
import AdminNetworkingGroups from "./pages/admin/AdminNetworkingGroups";
import AdminNetworkingMessages from "./pages/admin/AdminNetworkingMessages";
import AdminNetworkingShowcases from "./pages/admin/AdminNetworkingShowcases";
import AdminNetworkingReports from "./pages/admin/AdminNetworkingReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
            <Routes>
              <Route path="/" element={<Consultants />} />
              <Route path="/home" element={<Index />} />
              <Route path="/consultants" element={<Consultants />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/network" element={
                <ProtectedRoute>
                  <NetworkHub />
                </ProtectedRoute>
              } />
              <Route path="/network/channel/:id" element={<ChannelView />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="consultants" element={<AdminConsultants />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="faqs" element={<AdminFAQs />} />
                <Route path="pricing" element={<AdminPricing />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="networking/channels" element={<AdminNetworkingChannels />} />
                <Route path="networking/groups" element={<AdminNetworkingGroups />} />
                <Route path="networking/messages" element={<AdminNetworkingMessages />} />
                <Route path="networking/showcases" element={<AdminNetworkingShowcases />} />
                <Route path="networking/reports" element={<AdminNetworkingReports />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
      </ThemeProvider>
    </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
