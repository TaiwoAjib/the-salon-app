import { Clock, ArrowRight } from 'lucide-react';
// import styleBoxBraids from '@/assets/style-box-braids.jpg';
// import styleCornrows from '@/assets/style-cornrows.jpg';
// import styleBohoLocs from '@/assets/style-boho-locs.jpg';
// import styleTwists from '@/assets/style-twists.jpg';
import styleBoxBraids from '@/assets/signature 1.jpeg';
// const styleBoxBraids ="https://raw.githubusercontent.com/TaiwoAjib/imageRepo/main/victoriabraids/images/victoria_18.jpeg";

import styleCornrows from '@/assets/signature 3.jpeg';
import styleBohoLocs from '@/assets/signature 4.jpeg';
import styleTwists from '@/assets/signature 6.jpeg';

const services = [
  {
    name: 'Designer stitch braids',
    description: 'Gentle on scalp, natural-looking braids that reduce tension and last longer.',
    price: 'From $300',
    duration: '5-6.5 hours',
    image: styleBoxBraids,
  },
  {
    name: 'Designer Stitch weave',
    description: 'Intricate cornrow patterns with stunning precision and artistic designs.',
    price: 'From $400',
    duration: '4-7 hours',
    image: styleCornrows,
  },
  {
    name: 'Medium large boho',
    description: 'Soft, goddess-like locs with curly ends for a romantic, free-spirited look.',
    price: 'From $350',
    duration: '5-9 hours',
    image: styleBohoLocs,
  },
  {
    name: 'Flip over braids',
    description: 'Senegalese twists, passion twists, and spring twists for versatile elegance.',
    price: 'From $160',
    duration: '4-7 hours',
    image: styleTwists,
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-sans text-primary uppercase tracking-[0.3em] text-sm mb-4">
            Our Expertise
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground">
            Signature Styles
          </h2>
          <p className="font-sans text-muted-foreground mt-6 max-w-2xl mx-auto text-lg">
            Discover our range of professional hair braiding services, each crafted with precision and artistry by our skilled stylists.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={service.name}
              className="group relative bg-card rounded-lg overflow-hidden shadow-elegant hover:shadow-gold transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                
                {/* Price Tag */}
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-1 rounded-full font-sans text-sm font-semibold">
                  {/* {service.price} */}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-serif text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="font-sans text-muted-foreground text-sm leading-relaxed mb-4">
                  {/* {service.description} */}
                </p>
                
                {/* Footer */}
                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={16} />
                    <span className="font-sans text-sm">{service.duration}</span>
                  </div>
                  <a
                    href="#contact"
                    className="font-sans text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Learn More <ArrowRight size={16} />
                  </a>
                </div> */}
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 font-sans text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View All Services <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;
