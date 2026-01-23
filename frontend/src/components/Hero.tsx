import { ChevronDown, Mic } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
// import heroBraids from '@/assets/hero-braids.jpg';
import heroBraids from '@/assets/glamour.jpeg';


const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBraids}
          alt="Luxury hair braiding"
           className="w-full h-full object-cover object-center md:object-[50%_20%] lg:object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Subtitle */}
          <p className="font-sans text-primary uppercase tracking-[0.3em] text-sm md:text-base mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
            Premium Hair Artistry
          </p>

          {/* Main Heading */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-tight mb-8 animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
            Adding to Your{' '}
            <span className="text-gradient-gold italic">Glamour</span>
          </h1>

          {/* Description */}
          <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
            Experience the art of African hair braiding with our expert stylists. We transform your vision into stunning reality with meticulous attention to detail.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
            <Button variant="gold" size="xl" onClick={() => navigate('/booking')}>
              Book Appointment
            </Button>
            {/* <Button variant="gold-outline" size="xl">
              <Mic className="mr-2 h-5 w-5" />
              Talk To Support
            </Button> */}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <a
        href="#services"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-primary animate-bounce"
      >
        <span className="font-sans text-xs uppercase tracking-widest">Discover</span>
        <ChevronDown size={24} />
      </a>
    </section>
  );
};

export default Hero;
