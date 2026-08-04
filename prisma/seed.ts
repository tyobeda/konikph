import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  // Delete in order to avoid foreign key constraint errors
  await prisma.comment.deleteMany();
  await prisma.artworkReport.deleteMany();
  await prisma.artwork.deleteMany();
  await prisma.twibbonFrame.deleteMany();
  await prisma.user.deleteMany();
  await prisma.dpwOffice.deleteMany();
  await prisma.brandKit.deleteMany();

  console.log('Seeding DPW...');
  const dpws = [
    { name: 'DPW PKS Jawa Barat', code: 'JBR', coordinator: 'Ahmad S.', email: 'jabar@pks.art', address: 'Jl. Soekarno Hatta No. 538, Bandung', phone: '022-1234567' },
    { name: 'DPW PKS DKI Jakarta', code: 'DKI', coordinator: 'Budi H.', email: 'dki@pks.art', address: 'Jl. Letjen Suprapto No. 17, Jakarta Pusat', phone: '021-9876543' },
    { name: 'DPW PKS Banten', code: 'BTN', coordinator: 'Cahya M.', email: 'banten@pks.art', address: 'Jl. Raya Serang Km. 4, Serang', phone: '0254-123123' },
    { name: 'DPW PKS Jawa Tengah', code: 'JTG', coordinator: 'Dedi K.', email: 'jateng@pks.art', address: 'Jl. Kelud Raya No. 46, Semarang', phone: '024-555666' },
    { name: 'DPW PKS Jawa Timur', code: 'JTM', coordinator: 'Eko P.', email: 'jatim@pks.art', address: 'Jl. Gayungsari Barat X No. 33, Surabaya', phone: '031-888999' }
  ];

  for (const dpw of dpws) {
    await prisma.dpwOffice.create({
      data: {
        id: `dpw-${dpw.code.toLowerCase()}`,
        ...dpw
      }
    });
  }

  console.log('Seeding Users...');
  const usersData = [
    { name: 'Ahmad Jauhari', email: 'ahmad@pks.art', region: 'DPW PKS Jawa Barat' },
    { name: 'Siti Aminah', email: 'siti@pks.art', region: 'DPW PKS DKI Jakarta' },
    { name: 'Budi Santoso', email: 'budi@pks.art', region: 'DPW PKS Jawa Tengah' },
    { name: 'Rina Wahyuni', email: 'rina@pks.art', region: 'DPW PKS Jawa Timur' },
    { name: 'Agus Pratama', email: 'agus@pks.art', region: 'DPW PKS Banten' }
  ];

  const createdUsers = [];
  for (const [index, user] of usersData.entries()) {
    const createdUser = await prisma.user.create({
      data: {
        id: `user_${index + 1}`,
        name: user.name,
        email: user.email,
        phone: `0812345678${index}`,
        address: `Jl. Merdeka No. ${index + 1}, ${user.region}`,
        region: user.region,
        role: index === 0 ? 'Admin' : 'Kreator',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=F26522&color=fff&size=200`,
      }
    });
    createdUsers.push(createdUser);
  }

  console.log('Seeding Artworks...');
  const imgDir = path.join(process.cwd(), 'public', 'img');
  const files = fs.readdirSync(imgDir).filter(file => file.endsWith('.jpg') || file.endsWith('.png'));

  const categories = ['Poster', 'Spanduk', 'Social Media', 'Banner', 'Flyer'];
  const formats = ['PSD/AI', 'CDR', 'PNG/JPG', 'Figma'];

  for (const [index, file] of files.entries()) {
    const user = createdUsers[index % createdUsers.length];
    const category = categories[index % categories.length];
    const format = formats[index % formats.length];
    
    const artwork = await prisma.artwork.create({
      data: {
        id: `artwork_${index + 1}`,
        title: `Desain ${category} PKS - Edisi ${index + 1}`,
        description: `Ini adalah deskripsi untuk desain ${category.toLowerCase()} PKS edisi ke-${index + 1}. Dibuat khusus untuk menyemarakkan kegiatan di ${user.region}.`,
        imageUrl: `/img/${file}`,
        downloadUrl: '#',
        category: category,
        region: user.region,
        format: format,
        likesCount: Math.floor(Math.random() * 100),
        commentsCount: 0,
        downloadsCount: Math.floor(Math.random() * 500),
        stampsCount: Math.floor(Math.random() * 50),
        authorId: user.id,
      }
    });

    // Add comments to the artwork
    const numComments = Math.floor(Math.random() * 4) + 1; // 1 to 4 comments
    for (let i = 0; i < numComments; i++) {
      const commenter = createdUsers[(index + i + 1) % createdUsers.length];
      const commentTexts = [
        'Wah desainnya bagus banget kak!',
        'Izin unduh ya, sangat bermanfaat.',
        'Keren! Terus berkarya untuk PKS.',
        'Warna dan komposisinya pas banget.',
        'Syukron katsiron, izin pakai untuk DPW kami.',
        'Masya Allah, desainnya menginspirasi.',
      ];
      
      await prisma.comment.create({
        data: {
          id: `comment_${artwork.id}_${i}`,
          artworkId: artwork.id,
          userId: commenter.id,
          content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        }
      });
    }

    // Update comment count on artwork
    await prisma.artwork.update({
      where: { id: artwork.id },
      data: { commentsCount: numComments }
    });
  }

  console.log('Seeding Brand Kit...');
  const brandKits = [
    { title: 'Logo Resmi PKS (Vektor)', format: 'AI / CDR / SVG / PNG', size: '12 MB', fileUrl: '#', iconType: 'image', color: 'bg-orange-50 text-orange-600 border-orange-200', category: 'Logo' },
    { title: 'Buku Pedoman Visual & Warna', format: 'PDF', size: '8.5 MB', fileUrl: '#', iconType: 'file-text', color: 'bg-blue-50 text-blue-600 border-blue-200', category: 'Pedoman' },
    { title: 'Template Presentasi (PPTX)', format: 'PPTX', size: '24 MB', fileUrl: '#', iconType: 'presentation', color: 'bg-green-50 text-green-600 border-green-200', category: 'Presentasi' },
    { title: 'Palet Warna Resmi (Swatches)', format: 'ASE / ACO', size: '1.2 MB', fileUrl: '#', iconType: 'palette', color: 'bg-purple-50 text-purple-600 border-purple-200', category: 'Warna' }
  ];

  for (const kit of brandKits) {
    await prisma.brandKit.create({
      data: kit
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
