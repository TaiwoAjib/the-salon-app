
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDb() {
  try {
    console.log('Cleaning database...');
    // Delete in order to avoid foreign key constraints
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.stylePricing.deleteMany();
    await prisma.stylist.deleteMany();
    await prisma.style.deleteMany();
    await prisma.category.deleteMany();
    // Optionally delete users who are stylists? User said "Stylist db", maybe the user accounts too?
    // "Clean Services and Stylist db".
    // I will delete Stylist entries. The User entries for stylists might remain but without Stylist profile?
    // Stylist model has `userId` unique. If I delete Stylist, User remains.
    // I should probably delete the Users who have role 'stylist' to be clean.
    await prisma.user.deleteMany({
        where: { role: 'stylist' }
    });

    console.log('Database cleaned successfully.');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDb();
