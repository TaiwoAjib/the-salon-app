
import { useState, useEffect } from 'react';
import { bookingService, Booking } from '@/services/bookingService';
import { settingsService, SalonSettings } from '@/services/settingsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO, startOfDay, isValid, setHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function StylistSchedule() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsData, settingsData] = await Promise.all([
          bookingService.getBookings(),
          settingsService.getSettings()
        ]);

        if (Array.isArray(bookingsData)) {
          setBookings(bookingsData);
        } else {
          setBookings([]);
          console.error('Expected bookings to be an array, got:', bookingsData);
        }
        setSettings(settingsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)); // Mon-Sun

  // Calculate dynamic hours based on settings
  let startHour = 10;
  let endHour = 16;

  if (settings?.businessHours) {
    let minH = 24;
    let maxH = 0;
    let hasOpenDays = false;

    Object.values(settings.businessHours).forEach(day => {
      if (day.isOpen) {
        hasOpenDays = true;
        const s = parseInt(day.start.split(':')[0]);
        const e = parseInt(day.end.split(':')[0]);
        if (!isNaN(s) && s < minH) minH = s;
        // If end time is like 17:00, the last slot starts at 16:00 if 1 hour slots? 
        // Or if end is 17:00, we show up to 16:00?
        // Usually if end is 17:00, the shop closes at 17:00. The last 1-hour service is 16:00-17:00.
        // So endHour for the grid (start times) should be end - 1.
        // But the previous code was 10-16 (16:00 start).
        // Let's assume 'end' in settings is closing time.
        // If settings say 10:00 - 17:00.
        // Slots: 10, 11, 12, 13, 14, 15, 16.
        // So maxH should be e - 1?
        // Let's check previous implementation: 10 + i (length 7) => 10, 11, 12, 13, 14, 15, 16.
        // If closing is 17:00, then 16:00 is the last slot.
        // If 'end' is 16:00, then 15:00 is the last slot?
        // Let's stick to showing the start time of the slot.
        // If the shop closes at 'end', the last slot starts at 'end' - 1 (assuming 1 hour duration).
        // Let's take 'end' and subtract 1 if we want strict slots, OR just show until 'end' if we want to be safe.
        // However, the original code had 10 to 16.
        // I will assume the 'end' time in settings is the time the shop closes.
        // So if settings say 17:00, we should show up to 16:00.
        if (!isNaN(e) && e > maxH) maxH = e;
      }
    });

    if (hasOpenDays) {
      startHour = minH;
      // If maxH is 17 (5 PM), we want slots up to 16 (4 PM) if 1 hour slots.
      // But let's show up to maxH - 1 to be safe, assuming 1 hour slots.
      // Or if the user meant 'hours' as in "hours of operation", usually it includes the last hour?
      // Let's just use maxH as the limit for now, maybe maxH - 1 if we want to be precise about "start times".
      // But let's just use maxH (e.g., 17) -> render 17:00? No, if close at 17:00, 17:00 is not a slot.
      // Let's use maxH - 1.
      // Wait, if maxH is 16 (4 PM) in settings, and we used to show 16 (4 PM), then maybe the settings meant "last appointment"?
      // Standard is "Business Hours" = Open - Close.
      // I'll stick with showing start times up to (Close Time - 1).
      endHour = maxH > startHour ? maxH - 1 : startHour;
      
      // Edge case: if endHour < startHour (e.g. 10 - 10), show at least one.
      if (endHour < startHour) endHour = startHour;
    }
  }

  const hours = Array.from({ length: endHour - startHour + 1 }).map((_, i) => startHour + i);

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getBookingForSlot = (date: Date, hour: number) => {
    if (!Array.isArray(bookings)) return undefined;
    return bookings.find(b => {
      if (!b || !b.bookingDate || !b.bookingTime) return false;

      const bookingDate = parseISO(b.bookingDate);
      const bookingTime = parseISO(b.bookingTime);
      
      if (!isValid(bookingDate) || !isValid(bookingTime)) return false;

      // Check date match
      const isDateMatch = isSameDay(bookingDate, date);
      
      // Check time match (hour)
      // Note: bookingTime is full ISO, we need to extract hour
      // If bookingTime is 10:00, getHours() should be 10
      const isTimeMatch = bookingTime.getHours() === hour;

      return isDateMatch && isTimeMatch && b.status !== 'cancelled';
    });
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status.toLowerCase()) {
      case 'booked': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'checked_in': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">My Schedule</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-[140px] justify-center font-medium">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </div>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-8 border-b bg-muted/30">
              <div className="p-2 border-r font-medium text-sm text-muted-foreground text-center flex items-center justify-center">Time</div>
              {weekDays.map((day) => (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "p-2 border-r last:border-r-0 text-center",
                    isSameDay(day, new Date()) ? "bg-primary/5" : ""
                  )}
                >
                  <div className="font-medium text-sm">{format(day, 'EEEE')}</div>
                  <div className={cn(
                    "text-xs mt-1 inline-block px-2 py-0.5 rounded-full",
                    isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {format(day, 'MMM d')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
                {/* Time Label */}
                <div className="p-2 border-r text-sm text-muted-foreground text-center flex items-center justify-center">
                  {format(setHours(new Date(), hour), 'h:00 a')}
                </div>

                {/* Days */}
                {weekDays.map((day) => {
                  const booking = getBookingForSlot(day, hour);
                  const isPast = day < startOfDay(new Date()) || (isSameDay(day, new Date()) && hour < new Date().getHours());

                  return (
                    <div 
                      key={`${day.toISOString()}-${hour}`} 
                      className={cn(
                        "border-r last:border-r-0 min-h-[80px] p-1 relative group transition-colors",
                        isSameDay(day, new Date()) ? "bg-primary/[0.02]" : "",
                        !booking && isPast ? "bg-muted/10" : ""
                      )}
                    >
                      {booking ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className={cn(
                              "h-full w-full rounded-md p-2 text-xs cursor-pointer border shadow-sm hover:shadow-md transition-all",
                              getStatusColor(booking.status)
                            )}>
                              <div className="font-semibold truncate">{booking.customer?.fullName || 'Guest'}</div>
                              {booking.category && <div className="truncate font-medium text-[10px] uppercase opacity-80">{booking.category.name}</div>}
                              <div className="truncate opacity-90">{booking.service?.name}</div>
                              <div className="mt-1 flex items-center gap-1 opacity-75">
                                <Clock className="w-3 h-3" />
                                <span>{format(parseISO(booking.bookingTime), 'h:mm a')}</span>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                {booking.category && <div className="text-xs font-semibold text-primary uppercase">{booking.category.name}</div>}
                                <h4 className="font-medium leading-none">{booking.service?.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {format(parseISO(booking.bookingDate), 'MMMM do, yyyy')} at {format(parseISO(booking.bookingTime), 'h:mm a')}
                                </p>
                              </div>
                              <div className="grid gap-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{booking.customer?.fullName}</span>
                                </div>
                                <div className="text-sm pl-6 text-muted-foreground">
                                  {booking.customer?.phone}
                                </div>
                                <div className="text-sm pl-6 text-muted-foreground">
                                  {booking.customer?.email}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className={cn("capitalize", getStatusColor(booking.status))}>
                                    {booking.status}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground ml-auto">
                                    ${booking.service?.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                         <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Placeholder for future "Add Block/Time Off" feature */}
                            {/* <span className="text-xs text-muted-foreground">+</span> */}
                         </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
