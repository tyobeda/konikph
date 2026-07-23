import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PKS.art PostgreSQL database...');

  // Upsert users
  const user1 = await prisma.user.upsert({
    where: { email: 'ahmad.jauhari@pks.art' },
    update: {},
    create: {
      id: 'user_1',
      name: 'Ahmad Jauhari',
      email: 'ahmad.jauhari@pks.art',
      phone: '081298765432',
      address: 'Jl. Ahmad Yani No. 45, Bandung, Jawa Barat',
      region: 'Jawa Barat - DPW PKS',
      role: 'DPW PKS Jabar',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'lita@pks.art' },
    update: {},
    create: {
      id: 'user_3',
      name: 'Lita',
      email: 'lita@pks.art',
      phone: '081566778899',
      address: 'Jl. Malioboro No. 88, Yogyakarta',
      region: 'DIY',
      role: 'Kreator',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    },
  });

  // Seed sample artwork
  await prisma.artwork.upsert({
    where: { id: 'poster-pks-milenial-jabar' },
    update: {},
    create: {
      id: 'poster-pks-milenial-jabar',
      title: 'Poster PKS Milenial Jabar',
      description: 'Description anasi memgaimbung malan pembuliaan kawar benatan keoan desan jawa catlolarar fladir naran indonesia.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
      downloadUrl: '#download',
      category: 'Poster',
      region: 'DPW Jabar',
      format: 'PSD/AI/CDR',
      likesCount: 28,
      commentsCount: 1,
      downloadsCount: 142,
      stampsCount: 89,
      authorId: user1.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
