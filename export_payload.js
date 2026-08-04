const { PrismaClient } = require('@prisma/client');

// Connect to local PostgreSQL
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5432/pksart?schema=public",
    },
  },
});

// Connect to VPS PostgreSQL (via 127.0.0.1:5433 forwarded or executed on VPS)
async function main() {
  console.log('Fetching local settings & brandkits...');
  const settings = await localPrisma.siteSettings.findFirst();
  const brandkits = await localPrisma.brandKit.findMany();

  console.log('Local Settings Found:', settings?.siteName);
  console.log('Local BrandKits Count:', brandkits.length);

  // Write sync payload to file
  const fs = require('fs');
  fs.writeFileSync('./sync_payload.json', JSON.stringify({ settings, brandkits }, null, 2));
  console.log('Saved payload to sync_payload.json');
}

main()
  .catch(console.error)
  .finally(() => localPrisma.$disconnect());
