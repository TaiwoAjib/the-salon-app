import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Exporting database...');

  const data = {
    users: await prisma.user.findMany(),
    categories: await prisma.category.findMany(),
    styles: await prisma.style.findMany(),
    stylists: await prisma.stylist.findMany(),
    stylePricing: await prisma.stylePricing.findMany(),
    availability: await prisma.availability.findMany(),
    bookings: await prisma.booking.findMany(),
    payments: await prisma.payment.findMany(),
    chatbotKnowledge: await prisma.chatbotKnowledge.findMany(),
    salonSettings: await prisma.salonSettings.findMany(),
    notifications: await prisma.notification.findMany(),
  };

  const outputPath = path.join(__dirname, 'seed-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Database exported to ${outputPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
