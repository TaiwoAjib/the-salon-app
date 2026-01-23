import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/dashboard/Overview";
import Styles from "./pages/admin/Styles";
import Stylists from "./pages/admin/Stylists";
import AdminBookings from "./pages/admin/Bookings";
import Customers from "./pages/admin/Customers";
import Categories from "./pages/admin/Categories";
import Settings from "./pages/admin/Settings";
import AdminReports from "./pages/admin/AdminReports";
import Birthdays from "./pages/admin/Birthdays";
import Notifications from "./pages/admin/Notifications";
import Faqs from "./pages/admin/Faqs";
import Booking from "./pages/customer/Booking";
import MyBookings from "./pages/customer/MyBookings";
import Profile from "./pages/shared/Profile";


const queryClient = new QueryClient();

import StylistSchedule from "./pages/stylist/StylistSchedule";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>

        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/thesalonregister" element={<Register />} />
          <Route path="/thesalonadmin" element={<Login />} />
          <Route path="/booking" element={<Booking />} />
          
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Overview />} />
            <Route path="book" element={<Booking />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="/admin" element={<Dashboard />}>
            <Route index element={<Overview />} />
            <Route path="styles" element={<Styles />} />
            <Route path="stylists" element={<Stylists />} />
            <Route path="customers" element={<Customers />} />
            <Route path="birthdays" element={<Birthdays />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="faqs" element={<Faqs />} />
            <Route path="categories" element={<Categories />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="/stylist" element={<Dashboard />}>
            <Route index element={<Overview />} />
            <Route path="schedule" element={<StylistSchedule />} />
            <Route path="appointments" element={<AdminBookings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
