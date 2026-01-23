import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'import.xlsx');

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.error('Please create an Excel file named "import.xlsx" in the prisma directory.');
    process.exit(1);
  }

  console.log('Cleaning up existing data...');
  // Delete in order to satisfy foreign key constraints
  // Note: This will wipe bookings and payments as they depend on these core tables
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.stylePricing.deleteMany();
  await prisma.stylist.deleteMany();
  await prisma.style.deleteMany();
  await prisma.category.deleteMany();
  console.log('Database cleaned.');

  console.log(`Reading file: ${filePath}`);
  const workbook = XLSX.readFile(filePath);

  // Helper to get sheet data
  const getSheetData = (sheetName: string) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return null;
    return XLSX.utils.sheet_to_json(sheet);
  };

  // 1. Import Categories
  const categoriesData = getSheetData('Categories');
  if (categoriesData) {
    console.log(`Importing ${categoriesData.length} categories...`);
    for (const row of categoriesData as any[]) {
      if (!row.Name) continue;
      await prisma.category.upsert({
        where: { name: row.Name },
        update: {},
        create: { name: row.Name },
      });
    }
  }

  // 2. Import Services
  const servicesData = getSheetData('Services');
  if (servicesData) {
    console.log(`Importing ${servicesData.length} services...`);
    for (const row of servicesData as any[]) {
      if (!row.Name) continue;
      await prisma.style.upsert({
        where: { name: row.Name },
        update: {},
        create: { name: row.Name },
      });
    }
  }

  // 3. Import Stylists (and create Users if needed)
  const stylistsData = getSheetData('Stylists');
  if (stylistsData) {
    console.log(`Importing ${stylistsData.length} stylists...`);
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    for (const row of stylistsData as any[]) {
      if (!row.Email || !row['Full Name']) {
        console.warn('Skipping stylist row due to missing Email or Full Name', row);
        continue;
      }

      // Upsert User
      const user = await prisma.user.upsert({
        where: { email: row.Email },
        update: {
          fullName: row['Full Name'],
          phone: row.Phone ? String(row.Phone) : undefined,
          role: 'stylist' // Ensure they are a stylist
        },
        create: {
          email: row.Email,
          fullName: row['Full Name'],
          phone: row.Phone ? String(row.Phone) : undefined,
          role: 'stylist',
          passwordHash: defaultPassword,
        },
      });

      // Upsert Stylist Profile
      await prisma.stylist.upsert({
        where: { userId: user.id },
        update: {
          skillLevel: row['Skill Level'] || 'Senior',
        },
        create: {
          userId: user.id,
          skillLevel: row['Skill Level'] || 'Senior',
        },
      });
    }
  }

  /*
  // 4. Import Stylist Pricing (DEPRECATED: Schema changed to StylePricing without Stylist dependency)
  const pricingData = getSheetData('Pricing');
  if (pricingData) {
    console.log(`Importing ${pricingData.length} pricing records...`);
    for (const row of pricingData as any[]) {
      if (!row['Stylist Email'] || !row['Category Name'] || !row['Service Name'] || !row.Price) {
        console.warn('Skipping pricing row due to missing data', row);
        continue;
      }

      // Find related records
      const user = await prisma.user.findUnique({ where: { email: row['Stylist Email'] } });
      if (!user) {
        console.warn(`Stylist not found for email: ${row['Stylist Email']}`);
        continue;
      }
      const stylist = await prisma.stylist.findUnique({ where: { userId: user.id } });
      if (!stylist) {
        console.warn(`Stylist profile not found for user: ${row['Stylist Email']}`);
        continue;
      }

      const category = await prisma.category.findUnique({ where: { name: row['Category Name'] } });
      if (!category) {
        console.warn(`Category not found: ${row['Category Name']}`);
        continue;
      }

      const style = await prisma.style.findUnique({ where: { name: row['Service Name'] } });
      if (!style) {
        console.warn(`Style not found: ${row['Service Name']}`);
        continue;
      }

      // Upsert Pricing
      // await prisma.stylistPricing.upsert({ ... }) // Old logic
    }
  }
  */

  console.log('Import completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
