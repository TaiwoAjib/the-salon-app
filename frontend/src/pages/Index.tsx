import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Gallery from '@/components/Gallery';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import FaqSection from '@/components/FaqSection';
import PromoSection from '@/components/PromoSection';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { SALON_INFO } from '@/config';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {import.meta.env.VITE_CHATBOT_ENABLED !== 'false' && (
        <ChatWidget salonName={SALON_INFO.name} />
      )}
      <Navbar />
      <Hero />
      <PromoSection />
      <Services />
      <Gallery />
      <About />
      <Testimonials />
      <FaqSection />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
