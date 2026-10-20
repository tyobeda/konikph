'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { requireAdminSession } from '@/lib/serverAuth';

const DEFAULT_SETTINGS = {
  id: 'settings',
  siteName: 'PKSart - Galeri Desain & Foto PKS Official',
  siteDescription: 'Platform galeri poster, spanduk, social media kit, dan aset desain resmi PKS.',
  logoUrl: '/uploads/1785832971571.png',
  logoAdminUrl: '/uploads/1785832976919.png',
  logoFooterUrl: '/uploads/1785833539740.png',
  faviconUrl: '/favicon.ico',
  ctaTitle: 'Ayo Gabung Jadi Desainer PKSart!',
  ctaDescription: 'Seluruh produk desain dan infografis yang tersaji di web ini adalah OFFICIAL milik PKSART.\nPKSART tidak bertanggungjawab atas penyalahgunaan elemen desain untuk kepentingan tertentu.\nSemua grafis yang tersebar di internet dan tidak tersaji di web ini adalah TIDAK OFFICIAL.',
  ctaButtonText: 'Daftar Sekarang',
  ctaButtonLink: '/register',
  ctaLogoUrl: '',
  ctaImageUrl: '',
  ctaBgUrl: '',
  ctaEnabled: true,
  ctaLinks: JSON.stringify([
    { label: 'Beranda', url: '/' },
    { label: 'Tentang PKSART', url: '/p/profil' },
    { label: 'Galeri PKSART', url: '/explore' },
    { label: 'Jejaring', url: '/creators' },
    { label: 'Gabung', url: '/register' },
    { label: 'Download', url: '/assets' },
    { label: 'Login/Upload', url: '/login' }
  ]),
  ctaSocialText: 'Follow Kami',
  ctaSocialUrl: '#',
  ctaSocialLinks: JSON.stringify([
    { platform: 'instagram', label: '@pksart', url: 'https://instagram.com' },
    { platform: 'facebook', label: 'PKS Art', url: 'https://facebook.com' },
    { platform: 'youtube', label: 'PKS Art Official', url: 'https://youtube.com' },
    { platform: 'tiktok', label: '@pksart', url: 'https://tiktok.com' },
    { platform: 'twitter', label: '@pksart', url: 'https://twitter.com' },
    { platform: 'threads', label: '@pksart', url: 'https://threads.net' },
  ]),
  adminWhatsapp: '6281199887766',
  allowCommentLinks: true,
  forbiddenWords: 'judi, slot, gacor, bokep, porno, sara, rasis, penipu',
  onlyAdminCanCreateTwibbon: false,
  masterFileFormats: JSON.stringify([
    { id: 'PSD', label: 'PSD (Photoshop)' },
    { id: 'AI', label: 'AI (Illustrator)' },
    { id: 'CDR', label: 'CDR (CorelDraw)' },
    { id: 'CANVA', label: 'CANVA' },
    { id: 'FIGMA', label: 'FIGMA' },
    { id: 'PDF', label: 'PDF' },
  ])
};

const DEFAULT_MASTER_FILE_FORMATS = [
  { id: 'PSD', label: 'PSD (Photoshop)' },
  { id: 'AI', label: 'AI (Illustrator)' },
  { id: 'CDR', label: 'CDR (CorelDraw)' },
  { id: 'CANVA', label: 'CANVA' },
  { id: 'FIGMA', label: 'FIGMA' },
  { id: 'PDF', label: 'PDF' },
];

export async function getDBSiteSettings() {
  try {
    let settings = await (prisma as any).siteSettings.findUnique({
      where: { id: 'settings' }
    });
    if (!settings) {
      settings = await (prisma as any).siteSettings.create({
        data: DEFAULT_SETTINGS
      });
    }
    // Parse ctaLinks, ctaSocialLinks & maintenanceConfig JSON strings back into objects
    const ctaLinksParsed = settings.ctaLinks ? JSON.parse(settings.ctaLinks) : [];
    let ctaSocialLinksParsed = [];
    if (settings.ctaSocialLinks) {
      try {
        ctaSocialLinksParsed = JSON.parse(settings.ctaSocialLinks);
      } catch (e) {}
    } else {
      try {
        ctaSocialLinksParsed = JSON.parse(DEFAULT_SETTINGS.ctaSocialLinks);
      } catch (e) {}
    }

    let maintenanceConfigParsed = null;
    if (settings.maintenanceConfig) {
      try {
        maintenanceConfigParsed = JSON.parse(settings.maintenanceConfig);
      } catch (e) {}
    }

    let masterFileFormatsParsed = DEFAULT_MASTER_FILE_FORMATS;
    if (settings.masterFileFormats) {
      try {
        const parsed = JSON.parse(settings.masterFileFormats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          masterFileFormatsParsed = parsed;
        }
      } catch (e) {}
    }

    return { 
      success: true, 
      data: { 
        ...settings, 
        ctaLinks: ctaLinksParsed, 
        ctaSocialLinks: ctaSocialLinksParsed, 
        maintenanceConfig: maintenanceConfigParsed,
        masterFileFormats: masterFileFormatsParsed
      } 
    };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return { success: false, error: 'Failed to fetch settings' };
  }
}

export async function updateDBSiteSettings(data: any) {
  try {
    await requireAdminSession();
    console.log("updateDBSiteSettings called with keys:", Object.keys(data));
    const updateData: any = {};
    if (data.siteName !== undefined) updateData.siteName = data.siteName;
    if (data.siteDescription !== undefined) updateData.siteDescription = data.siteDescription;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.logoAdminUrl !== undefined) updateData.logoAdminUrl = data.logoAdminUrl;
    if (data.logoFooterUrl !== undefined) updateData.logoFooterUrl = data.logoFooterUrl;
    if (data.faviconUrl !== undefined) updateData.faviconUrl = data.faviconUrl;
    if (data.ogImageUrl !== undefined) updateData.ogImageUrl = data.ogImageUrl;
    if (data.ctaTitle !== undefined) updateData.ctaTitle = data.ctaTitle;
    if (data.ctaDescription !== undefined) updateData.ctaDescription = data.ctaDescription;
    if (data.ctaButtonText !== undefined) updateData.ctaButtonText = data.ctaButtonText;
    if (data.ctaButtonLink !== undefined) updateData.ctaButtonLink = data.ctaButtonLink;
    if (data.ctaLogoUrl !== undefined) updateData.ctaLogoUrl = data.ctaLogoUrl;
    if (data.ctaImageUrl !== undefined) updateData.ctaImageUrl = data.ctaImageUrl;
    if (data.ctaBgUrl !== undefined) updateData.ctaBgUrl = data.ctaBgUrl;
    if (data.ctaEnabled !== undefined) updateData.ctaEnabled = Boolean(data.ctaEnabled);
    if (data.ctaLinks !== undefined) updateData.ctaLinks = JSON.stringify(data.ctaLinks);
    if (data.ctaSocialLinks !== undefined) updateData.ctaSocialLinks = JSON.stringify(data.ctaSocialLinks);
    if (data.ctaSocialText !== undefined) updateData.ctaSocialText = data.ctaSocialText;
    if (data.ctaSocialUrl !== undefined) updateData.ctaSocialUrl = data.ctaSocialUrl;
    if (data.autoApproveArtworks !== undefined) updateData.autoApproveArtworks = Boolean(data.autoApproveArtworks);
    if (data.allowCommentLinks !== undefined) updateData.allowCommentLinks = Boolean(data.allowCommentLinks);
    if (data.forbiddenWords !== undefined) updateData.forbiddenWords = data.forbiddenWords;
    if (data.onlyAdminCanCreateTwibbon !== undefined) updateData.onlyAdminCanCreateTwibbon = Boolean(data.onlyAdminCanCreateTwibbon);
    if (data.masterFileFormats !== undefined) {
      updateData.masterFileFormats = typeof data.masterFileFormats === 'string'
        ? data.masterFileFormats
        : JSON.stringify(data.masterFileFormats);
    }
    if (data.maintenanceConfig !== undefined) {
      updateData.maintenanceConfig = typeof data.maintenanceConfig === 'string' 
        ? data.maintenanceConfig 
        : JSON.stringify(data.maintenanceConfig);
    }

    const settings = await (prisma as any).siteSettings.upsert({
      where: { id: 'settings' },
      update: updateData,
      create: {
        id: 'settings',
        siteName: data.siteName || DEFAULT_SETTINGS.siteName,
        siteDescription: data.siteDescription || DEFAULT_SETTINGS.siteDescription,
        logoUrl: data.logoUrl || DEFAULT_SETTINGS.logoUrl,
        logoAdminUrl: data.logoAdminUrl || DEFAULT_SETTINGS.logoAdminUrl,
        logoFooterUrl: data.logoFooterUrl || DEFAULT_SETTINGS.logoFooterUrl,
        faviconUrl: data.faviconUrl || DEFAULT_SETTINGS.faviconUrl,
        ogImageUrl: data.ogImageUrl || null,
        ctaTitle: data.ctaTitle || DEFAULT_SETTINGS.ctaTitle,
        ctaDescription: data.ctaDescription || DEFAULT_SETTINGS.ctaDescription,
        ctaButtonText: data.ctaButtonText || DEFAULT_SETTINGS.ctaButtonText,
        ctaButtonLink: data.ctaButtonLink || DEFAULT_SETTINGS.ctaButtonLink,
        ctaLogoUrl: data.ctaLogoUrl || DEFAULT_SETTINGS.ctaLogoUrl,
        ctaImageUrl: data.ctaImageUrl || DEFAULT_SETTINGS.ctaImageUrl,
        ctaBgUrl: data.ctaBgUrl || DEFAULT_SETTINGS.ctaBgUrl,
        ctaEnabled: data.ctaEnabled !== undefined ? Boolean(data.ctaEnabled) : true,
        ctaLinks: data.ctaLinks ? JSON.stringify(data.ctaLinks) : DEFAULT_SETTINGS.ctaLinks,
        ctaSocialLinks: data.ctaSocialLinks ? JSON.stringify(data.ctaSocialLinks) : DEFAULT_SETTINGS.ctaSocialLinks,
        ctaSocialText: data.ctaSocialText || DEFAULT_SETTINGS.ctaSocialText,
        ctaSocialUrl: data.ctaSocialUrl || DEFAULT_SETTINGS.ctaSocialUrl,
        adminWhatsapp: data.adminWhatsapp || '6281199887766',
        autoApproveArtworks: data.autoApproveArtworks !== undefined ? Boolean(data.autoApproveArtworks) : true,
        allowCommentLinks: data.allowCommentLinks !== undefined ? Boolean(data.allowCommentLinks) : true,
        forbiddenWords: data.forbiddenWords || DEFAULT_SETTINGS.forbiddenWords,
        onlyAdminCanCreateTwibbon: data.onlyAdminCanCreateTwibbon !== undefined ? Boolean(data.onlyAdminCanCreateTwibbon) : false,
        masterFileFormats: data.masterFileFormats 
          ? (typeof data.masterFileFormats === 'string' ? data.masterFileFormats : JSON.stringify(data.masterFileFormats)) 
          : DEFAULT_SETTINGS.masterFileFormats,
        maintenanceConfig: data.maintenanceConfig ? (typeof data.maintenanceConfig === 'string' ? data.maintenanceConfig : JSON.stringify(data.maintenanceConfig)) : null,
      }
    });
    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
    revalidatePath('/admin/settings');
    revalidatePath('/upload');
    revalidatePath('/explore');
    revalidatePath('/my-artworks');
    revalidatePath('/twibbon');
    revalidatePath('/admin/twibbon');
    const ctaLinksParsed = settings.ctaLinks ? JSON.parse(settings.ctaLinks) : [];
    let ctaSocialLinksParsed = [];
    if (settings.ctaSocialLinks) {
      try {
        ctaSocialLinksParsed = JSON.parse(settings.ctaSocialLinks);
      } catch (e) {}
    } else {
      try {
        ctaSocialLinksParsed = JSON.parse(DEFAULT_SETTINGS.ctaSocialLinks);
      } catch (e) {}
    }
    let maintenanceConfigParsed = null;
    if (settings.maintenanceConfig) {
      try {
        maintenanceConfigParsed = JSON.parse(settings.maintenanceConfig);
      } catch (e) {}
    }
    let masterFileFormatsParsed = DEFAULT_MASTER_FILE_FORMATS;
    if (settings.masterFileFormats) {
      try {
        const parsed = JSON.parse(settings.masterFileFormats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          masterFileFormatsParsed = parsed;
        }
      } catch (e) {}
    }
    return { 
      success: true, 
      data: { 
        ...settings, 
        ctaLinks: ctaLinksParsed, 
        ctaSocialLinks: ctaSocialLinksParsed, 
        maintenanceConfig: maintenanceConfigParsed,
        masterFileFormats: masterFileFormatsParsed
      } 
    };
  } catch (error) {
    console.error('Error updating site settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}

export async function verifyAdminPasswordAction(password: string) {
  try {
    await requireAdminSession();
    const expectedPassword = process.env.ADMIN_PASSWORD || 'pksart2026';
    if (password === expectedPassword) {
      return { success: true };
    }
    const superAdminUser = await (prisma as any).user.findUnique({
      where: { id: 'superadmin_1' }
    });
    if (superAdminUser && superAdminUser.password) {
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(password, superAdminUser.password).catch(() => false);
      if (isMatch) return { success: true };
    }
    return { success: false, error: 'Kata sandi Admin yang Anda masukkan salah.' };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Verifikasi gagal' };
  }
}

export async function getServerSystemStats() {
  noStore();
  try {
    await requireAdminSession();
    const os = require('os');
    const fs = require('fs');
    const path = require('path');

    // 1. Calculate folder size of public/uploads
    let uploadsSizeBytes = 0;
    let uploadsFileCount = 0;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    function calculateFolderSize(dirPath: string) {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          try {
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
              calculateFolderSize(filePath);
            } else if (stats.isFile()) {
              uploadsSizeBytes += stats.size;
              uploadsFileCount++;
            }
          } catch (_) {}
        }
      }
    }
    calculateFolderSize(uploadsDir);

    // Convert uploads size to human readable MB / GB
    const uploadsSizeMb = (uploadsSizeBytes / (1024 * 1024)).toFixed(2);
    const uploadsSizeGb = (uploadsSizeBytes / (1024 * 1024 * 1024)).toFixed(2);

    // 2. Query Database Stats
    const artworksCount = await (prisma as any).artwork.count().catch(() => 0);
    const usersCount = await (prisma as any).user.count().catch(() => 0);
    const twibbonsCount = await (prisma as any).twibbonFrame.count().catch(() => 0);

    let dbSizeBytes = 0;
    try {
      const dbSizeResult = await (prisma as any).$queryRaw`SELECT pg_database_size(current_database()) as size`;
      if (Array.isArray(dbSizeResult) && dbSizeResult[0]?.size) {
        dbSizeBytes = Number(dbSizeResult[0].size);
      }
    } catch (_) {}

    const dbSizeMb = (dbSizeBytes / (1024 * 1024)).toFixed(2);

    // 3. Server System Resource Stats (RAM & CPU)
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramUsagePercent = Math.round((usedMem / totalMem) * 100);
    const totalMemGb = (totalMem / (1024 * 1024 * 1024)).toFixed(1);
    const usedMemGb = (usedMem / (1024 * 1024 * 1024)).toFixed(1);

    // Node process memory usage
    const procMem = process.memoryUsage();
    const procRssMb = Math.round(procMem.rss / (1024 * 1024));

    // System CPU Load average (1 min)
    const cpus = os.cpus();
    const cpuCount = cpus.length;
    const loadAvg = os.loadavg ? os.loadavg()[0] : 0;
    const cpuLoadPercent = Math.min(100, Math.round((loadAvg / cpuCount) * 100)) || 12;

    return {
      success: true,
      data: {
        uploadsSizeBytes,
        uploadsSizeMb,
        uploadsSizeGb,
        uploadsFileCount,
        artworksCount,
        usersCount,
        twibbonsCount,
        dbSizeBytes,
        dbSizeMb,
        totalMemGb,
        usedMemGb,
        ramUsagePercent,
        procRssMb,
        cpuCount,
        cpuLoadPercent,
      },
    };
  } catch (error: any) {
    console.error('Error fetching system stats:', error);
    return {
      success: false,
      error: error?.message || 'Gagal membaca statistik server',
    };
  }
}

export async function exportBackupDataAction() {
  noStore();
  try {
    await requireAdminSession();
    
    // Fetch all database tables
    const users = await (prisma as any).user.findMany().catch(() => []);
    const artworks = await (prisma as any).artwork.findMany().catch(() => []);
    const twibbonFrames = await (prisma as any).twibbonFrame.findMany().catch(() => []);
    const dpwOffices = await (prisma as any).dpwOffice.findMany().catch(() => []);
    const customPages = await (prisma as any).customPage.findMany().catch(() => []);
    const brandKits = await (prisma as any).brandKit.findMany().catch(() => []);
    const siteSettings = await (prisma as any).siteSettings.findUnique({ where: { id: 'settings' } }).catch(() => null);

    const backupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'PKSart',
      data: {
        users,
        artworks,
        twibbonFrames,
        dpwOffices,
        customPages,
        brandKits,
        siteSettings,
      },
      summary: {
        totalUsers: users.length,
        totalArtworks: artworks.length,
        totalTwibbons: twibbonFrames.length,
        totalDpw: dpwOffices.length,
        totalPages: customPages.length,
        totalBrandKits: brandKits.length,
      },
    };

    return {
      success: true,
      data: backupPayload,
    };
  } catch (error: any) {
    console.error('Error exporting backup data:', error);
    return {
      success: false,
      error: error?.message || 'Gagal mengekspor data cadangan.',
    };
  }
}

export async function importRestoreDataAction(jsonString: string) {
  try {
    await requireAdminSession();
    
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.data) {
      return { success: false, error: 'Format file cadangan (.json) tidak valid.' };
    }

    const { users, artworks, twibbonFrames, dpwOffices, customPages, brandKits, siteSettings } = parsed.data;

    let restoredUsers = 0;
    let restoredArtworks = 0;
    let restoredTwibbons = 0;

    // Restore Users
    if (Array.isArray(users)) {
      for (const u of users) {
        if (u.id && u.email) {
          await (prisma as any).user.upsert({
            where: { id: u.id },
            update: {
              name: u.name,
              email: u.email,
              phone: u.phone || '',
              address: u.address || '',
              region: u.region || '',
              role: u.role || 'Desainer PKS',
              avatar: u.avatar || null,
              status: u.status || 'Active',
            },
            create: {
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone || '',
              password: u.password || null,
              address: u.address || '',
              region: u.region || '',
              role: u.role || 'Desainer PKS',
              avatar: u.avatar || null,
              status: u.status || 'Active',
            },
          }).catch(() => {});
          restoredUsers++;
        }
      }
    }

    // Restore Artworks
    if (Array.isArray(artworks)) {
      for (const a of artworks) {
        if (a.id && a.title && a.authorId) {
          await (prisma as any).artwork.upsert({
            where: { id: a.id },
            update: {
              title: a.title,
              description: a.description || null,
              imageUrl: a.imageUrl,
              downloadUrl: a.downloadUrl || null,
              category: a.category,
              region: a.region,
              format: a.format || 'Hanya gambar',
              tags: a.tags || [],
              likesCount: a.likesCount || 0,
              downloadsCount: a.downloadsCount || 0,
            },
            create: {
              id: a.id,
              title: a.title,
              slug: a.slug || null,
              description: a.description || null,
              imageUrl: a.imageUrl,
              downloadUrl: a.downloadUrl || null,
              category: a.category,
              region: a.region,
              format: a.format || 'Hanya gambar',
              tags: a.tags || [],
              likesCount: a.likesCount || 0,
              downloadsCount: a.downloadsCount || 0,
              authorId: a.authorId,
            },
          }).catch(() => {});
          restoredArtworks++;
        }
      }
    }

    // Restore Twibbons
    if (Array.isArray(twibbonFrames)) {
      for (const t of twibbonFrames) {
        if (t.id && t.title && t.authorId) {
          await (prisma as any).twibbonFrame.upsert({
            where: { id: t.id },
            update: {
              title: t.title,
              imageUrl: t.imageUrl,
              category: t.category,
              region: t.region,
              usedCount: t.usedCount || 0,
              status: t.status || 'Pending',
              isFeatured: Boolean(t.isFeatured),
            },
            create: {
              id: t.id,
              title: t.title,
              imageUrl: t.imageUrl,
              category: t.category,
              region: t.region,
              usedCount: t.usedCount || 0,
              status: t.status || 'Pending',
              isFeatured: Boolean(t.isFeatured),
              authorId: t.authorId,
            },
          }).catch(() => {});
          restoredTwibbons++;
        }
      }
    }

    // Restore Site Settings
    if (siteSettings) {
      await (prisma as any).siteSettings.upsert({
        where: { id: 'settings' },
        update: siteSettings,
        create: { id: 'settings', ...siteSettings },
      }).catch(() => {});
    }

    revalidatePath('/');
    revalidatePath('/admin/settings');

    return {
      success: true,
      message: `Pemulihan data berhasil! ${restoredArtworks} karya, ${restoredUsers} pengguna, dan ${restoredTwibbons} twibbon dipulihkan ke database.`,
    };
  } catch (error: any) {
    console.error('Error importing backup data:', error);
    return {
      success: false,
      error: error?.message || 'Gagal memproses file pemulihan cadangan.',
    };
  }
}
export async function updateSuperAdminCredentialsAction(data: { currentPassword?: string; newEmail?: string; newPassword?: string }) {
  try {
    await requireAdminSession();
    const bcrypt = require('bcryptjs');

    const superAdminUser = await (prisma as any).user.findFirst({
      where: {
        OR: [
          { id: 'superadmin_1' },
          { role: 'Super Admin' }
        ]
      }
    });

    if (!superAdminUser) {
      return { success: false, error: 'Akun Super Admin tidak ditemukan di database.' };
    }

    // 1. Verify current password
    if (data.currentPassword) {
      const storedPassword = superAdminUser.password || process.env.ADMIN_PASSWORD || 'pksart2026';
      let isMatch = false;
      if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(data.currentPassword, storedPassword).catch(() => false);
      } else {
        isMatch = data.currentPassword === storedPassword;
      }

      if (!isMatch) {
        return { success: false, error: 'Kata sandi saat ini (Lama) tidak cocok!' };
      }
    }

    const updatePayload: any = {};

    // 2. Validate and set new email
    if (data.newEmail && data.newEmail.trim()) {
      const cleanEmail = data.newEmail.trim().toLowerCase();
      if (!cleanEmail.includes('@')) {
        return { success: false, error: 'Format email tidak valid.' };
      }
      
      // Check if email already taken by another user
      const existing = await (prisma as any).user.findFirst({
        where: {
          email: cleanEmail,
          NOT: { id: superAdminUser.id }
        }
      });
      if (existing) {
        return { success: false, error: `Email ${cleanEmail} sudah digunakan oleh pengguna lain.` };
      }

      updatePayload.email = cleanEmail;
    }

    // 3. Validate and hash new password
    if (data.newPassword && data.newPassword.trim()) {
      const cleanPassword = data.newPassword.trim();
      if (cleanPassword.length < 6) {
        return { success: false, error: 'Kata sandi baru minimal 6 karakter.' };
      }
      updatePayload.password = await bcrypt.hash(cleanPassword, 10);
    }

    if (Object.keys(updatePayload).length === 0) {
      return { success: false, error: 'Tidak ada perubahan data email atau kata sandi.' };
    }

    const updatedUser = await (prisma as any).user.update({
      where: { id: superAdminUser.id },
      data: updatePayload,
    });

    revalidatePath('/admin/settings');
    revalidatePath('/admin/creators');

    return {
      success: true,
      message: 'Kredensial Super Admin (Email/Kata Sandi) berhasil diperbarui!',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      }
    };
  } catch (error: any) {
    console.error('Error updating Super Admin credentials:', error);
    return { success: false, error: error?.message || 'Gagal memperbarui kredensial Super Admin.' };
  }
}
