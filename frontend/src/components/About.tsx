import { Award, Sparkles, Heart, DollarSign } from 'lucide-react';
// import salonInterior from '@/assets/salon-interior.jpg';
import salonInterior from '@/assets/award.jpeg';

const features = [
  { icon: Award, text: 'Professional Expert Stylists' },
  { icon: Sparkles, text: 'Premium Quality Products' },
  { icon: Heart, text: 'Comfortable Relaxing Environment' },
  { icon: DollarSign, text: 'Affordable Luxury Pricing' },
];

const stats = [
  { number: '5000+', label: 'Happy Clients' },
  { number: '15+', label: 'Years Experience' },
  { number: '50+', label: 'Braid Styles' },
  { number: '24h', label: 'Style Longevity' },
];

const About = () => {
  return (
    <section id="about" className="py-24 lg:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative rounded-lg overflow-hidden shadow-elegant">
              <img
                src={salonInterior}
                alt="Victoria Braids Salon Interior"
                className="w-full h-[700px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/40 to-transparent" />
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-8 bg-card p-6 rounded-lg shadow-gold border border-border">
              <div className="text-center">
                <span className="font-serif text-4xl md:text-5xl text-primary font-bold">15+</span>
                <p className="font-sans text-muted-foreground text-sm mt-1">Years of Excellence</p>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div>
            <p className="font-sans text-primary uppercase tracking-[0.3em] text-sm mb-4">
              About Us
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-8">
              Why Choose Victoria Braids
            </h2>
            
            <div className="space-y-6 mb-10">
              <p className="font-sans text-muted-foreground text-lg leading-relaxed">
                Here at Victoria Braids, we pay attention to details. All of our stylists are professionals who have mastered the art of African hair braiding. Depending on the style you want, the right stylist is dedicated to your service.
              </p>
              <p className="font-sans text-muted-foreground text-lg leading-relaxed">
                Expect nothing less than a smooth, elegant, and beautiful result. We take pride in creating hairstyles that not only look stunning but also protect and nourish your natural hair.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-sans text-foreground text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-border">
              {stats.map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <span className="font-serif text-3xl text-primary font-bold">{stat.number}</span>
                  <p className="font-sans text-muted-foreground text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
