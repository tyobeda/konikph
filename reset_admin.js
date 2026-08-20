const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const newPasswordInput = process.argv[2];

  if (!newPasswordInput) {
    console.log('\n======================================================');
    console.log('❌ HARAP SERTAKAN KATA SANDI BARU!');
    console.log('Penggunaan: node reset_admin.js "kata_sandi_baru_anda"');
    console.log('Contoh:     node reset_admin.js "SuperPksart2026!"');
    console.log('======================================================\n');
    process.exit(1);
  }

  if (newPasswordInput.length < 6) {
    console.log('\n❌ Kata sandi minimal 6 karakter!');
    process.exit(1);
  }

  console.log('\n🔄 Memproses reset kata sandi Super Admin di PostgreSQL...');

  // Hash password using bcrypt
  const hashedPassword = await bcrypt.hash(newPasswordInput, 10);

  // Find Super Admin user record
  const superAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { id: 'superadmin_1' },
        { role: 'Super Admin' },
        { email: 'admin@pks.art' }
      ]
    }
  });

  if (superAdmin) {
    await prisma.user.update({
      where: { id: superAdmin.id },
      data: {
        password: hashedPassword,
      }
    });

    console.log('\n======================================================');
    console.log('✅ BERHASIL! KATA SANDI SUPER ADMIN TELAH DIUBAH.');
    console.log(`👤 ID Akun : ${superAdmin.id}`);
    console.log(`📧 Email   : ${superAdmin.email}`);
    console.log(`🔑 Password: ${newPasswordInput}`);
    console.log('======================================================\n');
  } else {
    // If Super Admin user doesn't exist, create it
    const newUser = await prisma.user.create({
      data: {
        id: 'superadmin_1',
        name: 'Super Admin PKSart',
        email: 'admin@pks.art',
        phone: '+6281199887766',
        password: hashedPassword,
        role: 'Super Admin',
        status: 'Active',
        region: 'DPP PKS Official',
        address: 'DPP PKS Official, Jakarta',
      }
    });

    console.log('\n======================================================');
    console.log('✅ BERHASIL! AKUN SUPER ADMIN BARU TELAH DIBUAT.');
    console.log(`👤 ID Akun : ${newUser.id}`);
    console.log(`📧 Email   : ${newUser.email}`);
    console.log(`🔑 Password: ${newPasswordInput}`);
    console.log('======================================================\n');
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('\n❌ Gagal mereset kata sandi Admin:', err);
  prisma.$disconnect();
  process.exit(1);
});
