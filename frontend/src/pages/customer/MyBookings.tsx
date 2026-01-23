
import { useState, useEffect } from 'react';
import { bookingService } from '@/services/bookingService';
import { getMyNotifications, Notification } from '@/services/notificationService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Scissors, MapPin, Bell, MessageSquare, Mail } from 'lucide-react';
import { format, isToday, parseISO, differenceInMinutes } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInLoadingId, setCheckInLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [bookingsData, notificationsData] = await Promise.all([
        bookingService.getBookings(),
        getMyNotifications().catch(() => []) // Don't fail entire page if notifications fail
      ]);
      setBookings(bookingsData);
      setNotifications(notificationsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async (bookingId: string) => {
    try {
        await bookingService.checkInBooking(bookingId);
        toast({
            title: "Checked In!",
            description: "We've notified the stylist that you've arrived.",
        });
        fetchData();
    } catch (error) {
        toast({
            title: "Check-in Failed",
            description: (error as Error).message || "Please try again or tell the front desk.",
            variant: "destructive",
        });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'checked_in': return 'bg-teal-500 hover:bg-teal-600';
      case 'confirmed': return 'bg-green-500 hover:bg-green-600';
      case 'completed': return 'bg-blue-500 hover:bg-blue-600';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const upcomingBookings = bookings.filter(b => 
    !['completed', 'cancelled'].includes(b.status.toLowerCase())
  );

  const pastBookings = bookings.filter(b => 
    ['completed', 'cancelled'].includes(b.status.toLowerCase())
  );

  const BookingCard = ({ booking }: { booking: any }) => {
    // Safely parse date
    let isTodayBooking = false;
    try {
       isTodayBooking = isToday(parseISO(booking.bookingDate));
    } catch (e) {
       console.error("Date parse error", e);
    }

    const canCheckIn = isTodayBooking && (booking.status.toLowerCase() === 'booked' || booking.status.toLowerCase() === 'confirmed');

    const handleCheckInClick = () => {
        try {
            const now = new Date();
            const bookingDate = parseISO(booking.bookingDate);
            const bookingTime = parseISO(booking.bookingTime);
            
            // Construct full appointment Date object
            const appointmentTime = new Date(bookingDate);
            appointmentTime.setHours(bookingTime.getHours());
            appointmentTime.setMinutes(bookingTime.getMinutes());
            appointmentTime.setSeconds(0);
            
            const diffInMinutes = differenceInMinutes(now, appointmentTime);
            
            if (Math.abs(diffInMinutes) > 30) {
                 toast({
                    title: "Check-in Not Available",
                    description: "You can only check in 30 minutes before or after your appointment time. Please contact the Front Desk.",
                    variant: "destructive",
                });
                return;
            }
            
            handleCheckIn(booking.id);
        } catch (e) {
            console.error("Time validation error", e);
             toast({
                title: "Error",
                description: "Could not validate time. Please contact Front Desk.",
                variant: "destructive",
            });
        }
    };

    return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{booking.style?.name ? `${booking.style.name} - ${booking.category?.name}` : booking.category?.name || 'Service'}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Scissors className="w-3 h-3" />
              ${booking.price || '0.00'}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status === 'checked_in' ? 'Checked In' : booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{format(new Date(booking.bookingDate), 'MMMM do, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{format(new Date(booking.bookingTime), 'h:mm a')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span>Stylist: {booking.stylist?.user?.fullName || 'Any Stylist'}</span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 py-2 px-4 flex flex-col gap-2">
         <div className="flex justify-between w-full text-xs text-muted-foreground">
            <span>Booking Fee Paid</span>
            <span className="font-mono">${booking.payment?.amount || '0.00'}</span>
         </div>
         {canCheckIn && (
             <Button 
                className="w-full mt-2 gap-2 bg-teal-600 hover:bg-teal-700 text-white" 
                size="sm"
                onClick={handleCheckInClick}
                disabled={checkInLoadingId === booking.id}
             >
                {checkInLoadingId === booking.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <MapPin className="w-4 h-4" />
                )}
                {checkInLoadingId === booking.id ? "Checking In..." : "I'm Here (Check In)"}
             </Button>
         )}
      </CardFooter>
    </Card>
  )};

  const NotificationList = () => {
    if (notifications.length === 0) {
      return (
        <div className="text-center py-10 bg-muted/20 rounded-lg">
          <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="overflow-hidden">
            <div className="flex flex-row items-start p-4 gap-4">
              <div className={`p-2 rounded-full shrink-0 ${notification.type === 'EMAIL' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                {notification.type === 'EMAIL' ? <Mail className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">
                    {notification.subject || (notification.type === 'SMS' ? 'Text Message' : 'Notification')}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {notification.content.replace(/<[^>]*>?/gm, '') /* Simple strip HTML for preview if needed, or render safely */}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">My Dashboard</h2>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No upcoming appointments.</p>
              <Button variant="link" className="mt-2 text-primary">Book an appointment</Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {pastBookings.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No booking history.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
