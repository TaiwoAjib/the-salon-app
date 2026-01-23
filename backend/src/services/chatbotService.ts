import OpenAI from 'openai';
import prisma from '../utils/prisma';

const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

const baseURL =
  process.env.OPENAI_BASE_URL ||
  (process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined);

const openRouterHeaders =
  process.env.OPENROUTER_SITE_URL || process.env.OPENROUTER_APP_NAME
    ? {
        ...(process.env.OPENROUTER_SITE_URL ? { 'HTTP-Referer': process.env.OPENROUTER_SITE_URL } : {}),
        ...(process.env.OPENROUTER_APP_NAME ? { 'X-Title': process.env.OPENROUTER_APP_NAME } : {}),
      }
    : undefined;

const openai = apiKey
  ? new OpenAI({
      apiKey,
      baseURL,
      defaultHeaders: openRouterHeaders,
    })
  : null;

const POLICIES = `
1. BOOKING POLICY: A $50 non-refundable Booking Scheduling Fee is required to confirm appointments. This fee is SEPARATE and is NOT deducted from the final service price.
2. CANCELLATIONS: Cancellations must be made at least 24 hours in advance.
3. LATE ARRIVAL: A 15-minute grace period is allowed. After that, the appointment may be cancelled or a late fee may apply.
4. PAYMENTS: We accept cash, credit cards, and Stripe payments.
5. LOCATION: We are located at Victoria Braids & Weaves, [Insert Address Here].
6. HOURS: Monday - Saturday, 10:00 AM - 4:00 PM. Closed on Sundays.
`;

export const getSystemPrompt = async () => {
  // Fetch pricing with Style and Category names
  const pricing = await prisma.stylePricing.findMany({
      include: {
          style: true,
          category: true
      },
      orderBy: {
          style: { name: 'asc' }
      }
  });

  const servicesText = pricing.map(p => {
      return `- ${p.style.name} (${p.category.name}): $${p.price}`;
  }).join('\n');

  return `
You are a helpful and friendly AI assistant for "Victoria Braids & Weaves", a hair salon.
Your goal is to answer customer questions about services, pricing, policies, and booking.

Here is the current list of services and prices:
${servicesText}

Here are the salon policies:
${POLICIES}

Instructions:
- Be polite, professional, and welcoming.
- Use emojis sparingly but effectively to sound friendly.
- If a customer asks about booking, guide them to click the "Book Appointment" button.
- Do NOT invent services or prices. Only use the information provided above.
- If you don't know the answer, ask them to call the salon directly.
- Keep answers concise.
`;
};

export const processMessage = async (userMessage: string) => {
  if (!openai) {
    return "I'm sorry, the AI assistant is currently offline (API Key missing). Please contact the salon directly.";
  }

  try {
    const systemPrompt = await getSystemPrompt();

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || process.env.OPENROUTER_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content || "I'm sorry, I couldn't understand that.";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "I'm currently experiencing technical difficulties. Please try again later.";
  }
};
