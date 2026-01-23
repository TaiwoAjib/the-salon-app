import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqService, Faq } from '@/services/faqService';
import { settingsService } from '@/services/settingsService';

export default function FaqSection() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [salonName, setSalonName] = useState("Victoria Braids & Weaves");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check settings first
        const settings = await settingsService.getPublicSettings();
        if (settings.showFaqSection === false) {
          setIsVisible(false);
          return;
        }
        if (settings.salonName) {
          setSalonName(settings.salonName);
        }

        // Fetch FAQs
        const data = await faqService.getPublicFaqs();
        setFaqs(data);
      } catch (error) {
        console.error('Failed to load FAQs:', error);
      }
    };
    fetchData();
  }, []);

  if (!isVisible || faqs.length === 0) return null;

  return (
    <section className="relative py-20 bg-[#221F1B]">
      <div className="absolute top-0 left-0 w-full h-px bg-[#DFAC2A]" />
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
            {salonName}
          </h2>
          <p className="text-xl text-white/80 font-sans">
            Frequently Asked Questions
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              className="bg-[#120F0D] border border-[#DFAC2A]/20 rounded-lg px-6 shadow-sm"
            >
              <AccordionTrigger className="text-left font-sans font-bold text-lg py-5 text-white hover:text-primary transition-colors hover:no-underline [&[data-state=open]>svg]:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#DFAC2A] font-sans text-base pb-6 whitespace-pre-line leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
