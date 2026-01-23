import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Michelle Johnson',
    role: 'Regular Client',
    content: "Victoria Braids transformed my look completely! The attention to detail is incredible, and my knotless braids lasted for months. The stylists made me feel like royalty.",
    rating: 5,
  },
  {
    name: 'Aisha Williams',
    role: 'First-Time Client',
    content: "I was nervous about getting braids for the first time, but the team at Victoria Braids made me feel so comfortable. The results exceeded my expectations!",
    rating: 5,
  },
  {
    name: 'Destiny Brown',
    role: 'Loyal Customer',
    content: "I've been coming here for 3 years and I won't go anywhere else. The quality, the atmosphere, and the friendly staff keep me coming back every time.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-charcoal-light">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-sans text-primary uppercase tracking-[0.3em] text-sm mb-4">
            Testimonials
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground">
            Client Experiences
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card p-8 rounded-lg border border-border hover:border-primary/30 transition-colors duration-300 relative"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Content */}
              <p className="font-sans text-foreground leading-relaxed mb-8 text-lg italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
                  <span className="font-serif text-primary-foreground text-lg font-bold">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-serif text-foreground font-medium">
                    {testimonial.name}
                  </h4>
                  <p className="font-sans text-muted-foreground text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
