import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Settings,
  FileText,
  BarChart3,
  Clock,
  History,
  User as UserIcon,
  Gift,
  MessageSquare,
} from "lucide-react";
import { User } from "@/services/authService";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { settingsService } from "@/services/settingsService";

interface DashboardSidebarProps {
  user: User;
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [salonName, setSalonName] = useState<string>("Victoria Braids");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setLogoUrl(data.logoUrl);
        if (data.salonName) {
           setSalonName(data.salonName);
        }
      } catch (error) {
        console.error("Failed to fetch settings for sidebar", error);
      }
    };
    fetchSettings();
  }, []);

  const adminItems = [
    { title: "Overview", url: "/admin", icon: LayoutDashboard },
    { title: "Bookings", url: "/admin/bookings", icon: Calendar },
    { title: "Customers", url: "/admin/customers", icon: Users },
    { title: "Birthdays", url: "/admin/birthdays", icon: Gift },
    { title: "Notifications", url: "/admin/notifications", icon: MessageSquare },
    { title: "Stylists", url: "/admin/stylists", icon: Scissors },
    { title: "Variations", url: "/admin/categories", icon: Settings },
    { title: "Styles", url: "/admin/styles", icon: FileText },
    { title: "FAQs", url: "/admin/faqs", icon: MessageSquare },
    { title: "Reports", url: "/admin/reports", icon: BarChart3 },
    { title: "Profile", url: "/admin/profile", icon: UserIcon },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ];

  const stylistItems = [
    { title: "Overview", url: "/stylist", icon: LayoutDashboard },
    { title: "My Schedule", url: "/stylist/schedule", icon: Clock },
    { title: "My Appointments", url: "/stylist/appointments", icon: Calendar },
    { title: "Profile", url: "/stylist/profile", icon: UserIcon },
  ];

  const customerItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Book Appointment", url: "/booking", icon: Calendar },
    { title: "My Bookings", url: "/dashboard/bookings", icon: Clock },
    { title: "Profile", url: "/dashboard/profile", icon: UserIcon },
  ];

  let items = customerItems;
  if (user.role === "admin") items = adminItems;
  if (user.role === "stylist") items = stylistItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-border/10 bg-cream/10">
        <div className="flex items-center justify-center w-full py-2">
          <img 
            src={logoUrl || "/logo.png"} 
            alt={salonName} 
            className="h-28 w-auto object-contain"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} className="h-12">
                    <Link to={item.url} className="flex items-center gap-4 px-4">
                      <item.icon className="w-6 h-6" />
                      <span className="text-base font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
