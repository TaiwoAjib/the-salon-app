
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({ take: 5 });
  console.log('Categories:', categories);

  const styles = await prisma.style.findMany({ take: 5 });
  console.log('Styles:', styles);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
