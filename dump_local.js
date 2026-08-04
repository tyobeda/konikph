const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.siteSettings.findFirst();
  const brandkits = await prisma.brandKit.findMany();
  console.log('--- LOCAL SITE SETTINGS ---');
  console.log(JSON.stringify(settings, null, 2));
  console.log('--- LOCAL BRANDKITS ---');
  console.log(JSON.stringify(brandkits, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
