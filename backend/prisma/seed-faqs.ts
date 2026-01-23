import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const faqs = [
  {
    question: "How much do your services cost?",
    answer: "Our full price list is available online. Please visit www.victoriabraidsandweaves.com to view current service rates.",
    order: 1
  },
  {
    question: "How does the deposit work?",
    answer: "A $30 non-refundable booking deposit is required at the time of booking and is not applied toward your final service total. Please be prepared to make payment when booking.\nOnce your deposit is secured, you are allowed one reschedule within the approved time frame.",
    order: 2
  },
  {
    question: "Which stylist should I book with?",
    answer: "You may select “Any Available” and we’ll handle the rest. Our system automatically assigns your appointment to a stylist who specializes in the service you’ve chosen.",
    order: 3
  },
  {
    question: "Can I book directly with Victoria?",
    answer: "Yes, you can. For services not specifically listed under her name, an additional $100 fee applies.\nPlease contact us by phone to schedule appointments with Victoria.",
    order: 4
  },
  {
    question: "How do I reschedule my appointment?",
    answer: "All rescheduling must be completed through the confirmation email you receive immediately after booking.\nPlease note: changes must be made at least 48 hours before your scheduled appointment.",
    order: 5
  },
  {
    question: "What happens if I don’t cancel or I miss my appointment?",
    answer: "Missed appointments or failure to cancel may result in additional charges.\nClients who do not show up without notice may also be restricted from future bookings. Please cancel promptly if you’re unable to attend.",
    order: 6
  },
  {
    question: "Is braiding hair included?",
    answer: "Yes. Kanekalon braiding hair is included with most braid services.\nHuman hair is not included but is available for purchase.",
    order: 7
  },
  {
    question: "Can I bring my own hair?",
    answer: "Absolutely. You may bring your own human hair (minimum length: 18 inches).\nBraiding hair must be pre-stretched to be accepted.",
    order: 8
  },
  {
    question: "What hair colors are available?",
    answer: "We currently stock the following colors:\nBlack, 1B, #2, #4, #33, #30, #27, #700 series, Burgundy, and #613",
    order: 9
  }
];

async function main() {
  console.log('Seeding FAQs...');
  
  // Replace {{Salon Name}} in the first question if it exists in the user prompt, 
  // but the user prompt was: "Use the salon name as a dynamic data from the backend: {{Salon Name}} – Frequently Asked Questions"
  // The actual questions listed don't have {{Salon Name}} inside them, it's the title of the section.
  // However, I will check if any replacement is needed.
  // The user said: "Use the salon name as a dynamic data from the backend: {{Salon Name}} – Frequently Asked Questions"
  // This likely refers to the HEADER of the section, not the content of the FAQs themselves.
  // I will seed the FAQs as is.

  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({
      where: { question: faq.question }
    });

    if (!existing) {
      await prisma.faq.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          isActive: true
        }
      });
      console.log(`Created FAQ: ${faq.question}`);
    } else {
        // Update answer if it changed
        await prisma.faq.update({
            where: { id: existing.id },
            data: {
                answer: faq.answer,
                order: faq.order
            }
        });
        console.log(`Updated FAQ: ${faq.question}`);
    }
  }
  
  // Also ensure showFaqSection is true
  const settings = await prisma.salonSettings.findFirst();
  if (settings) {
      await prisma.salonSettings.update({
          where: { id: settings.id },
          data: { showFaqSection: true }
      });
      console.log('Enabled FAQ section in settings');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
