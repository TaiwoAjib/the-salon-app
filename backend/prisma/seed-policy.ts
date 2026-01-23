import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const policyContent = `Victoria Salon & Braids 
Appointment Guidelines & Booking Promise 

We value your time—and ours. To deliver flawless styles and a smooth experience, please review our booking guidelines before securing your spot. 

Securing Your Appointment 

A booking deposit is required to lock in your appointment. This deposit is applied to your final service cost. 

Deposits are non-refundable and non-transferable. 

Changes & Rescheduling 

One complimentary reschedule is allowed up to 48 hours before your appointment. 

Any changes made after this window will require a new deposit. 

All rescheduling must be completed using the link in your confirmation email. 

Cancellations & No-Shows 

Cancellations or no-shows result in loss of deposit. 

Clients who miss appointments without notice may be billed for the full service amount. 

Payments 

Remaining balances are due on appointment day. 

Cash is preferred, but card payments are accepted (tax included). 

Hair Preparation Requirements 

To ensure the best results: 

Hair must be clean, dry, product-free, and washed no more than 48 hours prior. 

Hair must be fully detangled and blown out. 

Washing or detangling at the salon will incur additional fees. 

Minimum hair length required: 3–4 inches around the entire hairline. 

Hair Extensions 

Kanekalon braiding hair is included with all braid services. 

Clients may bring their own hair if preferred; hair must be pre-stretched. 

Timing & Planning 

Please avoid scheduling important events immediately after your appointment to allow adequate styling time without pressure. 

Booking Window 

Appointments can be scheduled up to 40 days in advance.`;

async function main() {
  console.log('Start seeding booking policy...');

  // Check if policy exists
  const existingPolicy = await prisma.bookingPolicy.findFirst();

  if (existingPolicy) {
    console.log('Updating existing booking policy...');
    await prisma.bookingPolicy.update({
      where: { id: existingPolicy.id },
      data: { content: policyContent },
    });
  } else {
    console.log('Creating new booking policy...');
    await prisma.bookingPolicy.create({
      data: {
        content: policyContent,
        isActive: true,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
