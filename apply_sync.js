const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://pksart_admin:pksart_secure_pass123@db:5432/pksart_db?schema=public",
    },
  },
});

async function sync() {
  if (!fs.existsSync('sync_payload.json')) {
    console.log('sync_payload.json not found!');
    return;
  }
  const payload = JSON.parse(fs.readFileSync('sync_payload.json', 'utf-8'));
  
  if (payload.settings) {
    const { id, createdAt, updatedAt, ...sData } = payload.settings;
    await prisma.siteSettings.deleteMany();
    await prisma.siteSettings.create({ data: sData });
    console.log('SiteSettings successfully synced to VPS PostgreSQL!');
  }

  if (payload.brandkits && payload.brandkits.length > 0) {
    await prisma.brandKit.deleteMany();
    for (const b of payload.brandkits) {
      const { id, createdAt, ...bData } = b;
      await prisma.brandKit.create({ data: bData });
    }
    console.log('BrandKits successfully synced to VPS PostgreSQL!');
  }

  if (payload.dpwList && payload.dpwList.length > 0) {
    await prisma.dpwOffice.deleteMany();
    for (const d of payload.dpwList) {
      const { id, createdAt, updatedAt, ...dData } = d;
      await prisma.dpwOffice.create({ data: dData });
    }
    console.log('DPW List successfully synced to VPS PostgreSQL!');
  }
}

sync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
