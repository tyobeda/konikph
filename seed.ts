import { PrismaClient } from '@prisma/client';
import { USERS, INITIAL_ARTWORKS } from './src/lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Seed Users
  for (const [key, user] of Object.entries(USERS)) {
    const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          region: user.region,
          avatar: user.avatar,
          role: user.role,
        },
      });
      console.log(`Created user: ${user.name}`);
    }
  }

  // 2. Seed Artworks
  for (const art of INITIAL_ARTWORKS) {
    const existingArt = await prisma.artwork.findUnique({ where: { id: art.id } });
    if (!existingArt) {
      await prisma.artwork.create({
        data: {
          id: art.id,
          title: art.title,
          description: art.description,
          imageUrl: art.imageUrl,
          downloadUrl: art.downloadUrl,
          category: art.category,
          region: art.region,
          format: art.format,
          likesCount: art.likesCount,
          commentsCount: art.commentsCount,
          downloadsCount: art.downloadsCount,
          stampsCount: art.stampsCount,
          authorId: art.author.id,
          createdAt: new Date(art.createdAt),
        },
      });
      console.log(`Created artwork: ${art.title}`);
    }
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
