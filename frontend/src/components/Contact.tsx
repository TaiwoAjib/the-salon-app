import { MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { settingsService, SalonSettings } from '@/services/settingsService';

const Contact = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SalonSettings | null>(null);

  useEffect(() => {
    settingsService.getSettings().then(setSettings).catch(console.error);
  }, []);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const renderHours = () => {
    if (!settings?.businessHours) return <p>Loading hours...</p>;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Check if all days are the same
    const firstDay = settings.businessHours['monday'];
    const allSame = days.every(day => {
        const d = settings.businessHours![day];
        return d.isOpen === firstDay.isOpen && d.start === firstDay.start && d.end === firstDay.end;
    });

    if (allSame && firstDay.isOpen) {
        return <p>Monday - Sunday: {formatTime(firstDay.start)} - {formatTime(firstDay.end)}</p>;
    }

    return (
        <div className="space-y-1 text-sm">
            {days.map(day => {
                const hours = settings.businessHours![day];
                return (
                    <div key={day} className="flex justify-between items-center gap-4">
                        <span className="capitalize w-24 text-left">{day}</span>
                        <span>
                            {hours.isOpen 
                                ? `${formatTime(hours.start)} - ${formatTime(hours.end)}` 
                                : 'Closed'}
                        </span>
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-sans text-primary uppercase tracking-[0.3em] text-sm mb-4">
            Get In Touch
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground">
            Book Your Appointment
          </h2>
          <p className="font-sans text-muted-foreground mt-6 max-w-2xl mx-auto text-lg">
            Ready to transform your look? Contact us today to schedule your appointment and experience the Victoria Braids difference.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Location */}
          <div className="bg-card p-8 rounded-lg border border-border text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-serif text-xl text-foreground mb-3">Location</h3>
            <p className="font-sans text-muted-foreground">
              1300 Stuyvesant Ave Union, 
              <br />
              New Jersey, NJ 07083
            </p>
          </div>

          {/* Phone */}
          <div className="bg-card p-8 rounded-lg border border-border text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Phone className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-serif text-xl text-foreground mb-3">Phone</h3>
            <div className="flex flex-col gap-2">
              <a
                href="tel:+12018854565"
                className="font-sans text-muted-foreground hover:text-primary transition-colors block"
              >
                (201) 885-4565
              </a>
              <a
                href="tel:+18622157260"
                className="font-sans text-muted-foreground hover:text-primary transition-colors block"
              >
                (862) 215-7260
              </a>
              <a
                href="tel:+12013493990"
                className="font-sans text-muted-foreground hover:text-primary transition-colors block"
              >
                (201) 349-3990
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-card p-8 rounded-lg border border-border text-center md:col-span-2 lg:col-span-1">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-serif text-xl text-foreground mb-3">Hours</h3>
            <div className="font-sans text-muted-foreground space-y-1">
              {renderHours()}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 mb-16">
          <a
            href="#"
            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={20} />
          </a>
          <a
            href="#"
            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Facebook"
          >
            <Facebook size={20} />
          </a>
        </div>

        {/* CTA Section */}
        <div className="bg-card p-8 md:p-12 rounded-lg border border-border text-center max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
            Ready to Get Started?
          </h3>
          <p className="font-sans text-muted-foreground mb-8 max-w-xl mx-auto">
            Book your appointment online and let our expert stylists create the perfect look for you. Walk-ins welcome, but appointments are recommended to ensure availability.
          </p>
          <p className="font-sans text-primary font-semibold mb-6">
            A $30 non-refundable deposit is required for all appointments
          </p>
          <Button variant="gold" size="xl" onClick={() => navigate('/booking')}>
            Book Your Appointment
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Contact;
