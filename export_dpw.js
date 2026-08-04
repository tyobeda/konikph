const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5432/pksart?schema=public",
    },
  },
});

async function main() {
  console.log('Fetching local DPW list...');
  const dpwList = await localPrisma.dpwOffice.findMany();
  console.log('Local DPW Count:', dpwList.length);

  const payload = JSON.parse(fs.readFileSync('./sync_payload.json', 'utf-8'));
  payload.dpwList = dpwList;

  fs.writeFileSync('./sync_payload.json', JSON.stringify(payload, null, 2));
  console.log('Updated sync_payload.json with DPW list!');
}

main()
  .catch(console.error)
  .finally(() => localPrisma.$disconnect());
