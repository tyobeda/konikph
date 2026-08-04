'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';

const DEFAULT_SETTINGS = {
  id: 'settings',
  siteName: 'PKSart - Galeri Desain & Foto PKS Official',
  siteDescription: 'Platform galeri poster, spanduk, social media kit, dan aset desain resmi PKS.',
  logoUrl: '',
  logoAdminUrl: '',
  logoFooterUrl: '',
  faviconUrl: '/favicon.ico',
  ctaTitle: 'Ayo Gabung Jadi Kreator PKSart!',
  ctaDescription: 'Seluruh produk desain dan infografis yang tersaji di web ini adalah OFFICIAL milik PKSART.\nPKSART tidak bertanggungjawab atas penyalahgunaan elemen desain untuk kepentingan tertentu.\nSemua grafis yang tersebar di internet dan tidak tersaji di web ini adalah TIDAK OFFICIAL.',
  ctaButtonText: 'Daftar Sekarang',
  ctaButtonLink: '/register',
  ctaLogoUrl: '',
  ctaImageUrl: '',
  ctaBgUrl: '',
  ctaEnabled: true,
  ctaLinks: JSON.stringify([
    { label: 'Beranda', url: '/' },
    { label: 'Tentang PKSART', url: '#' },
    { label: 'PKS Bicara', url: '#' },
    { label: 'Khidmat PKS', url: '#' },
    { label: 'Galeri PKSART', url: '#' },
    { label: 'Jejaring', url: '#' },
    { label: 'Gabung', url: '/register' },
    { label: 'Download', url: '#' },
    { label: 'Login/Upload', url: '/login' }
  ]),
  ctaSocialText: 'Follow @pksart',
  ctaSocialUrl: '#'
};

export async function getDBSiteSettings() {
  noStore();
  try {
    let settings = await (prisma as any).siteSettings.findUnique({
      where: { id: 'settings' }
    });
    if (!settings) {
      settings = await (prisma as any).siteSettings.create({
        data: DEFAULT_SETTINGS
      });
    }
    // Parse ctaLinks JSON string back into array object for frontend consumption
    const ctaLinksParsed = settings.ctaLinks ? JSON.parse(settings.ctaLinks) : [];
    return { success: true, data: { ...settings, ctaLinks: ctaLinksParsed } };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return { success: false, error: 'Failed to fetch settings' };
  }
}

export async function updateDBSiteSettings(data: any) {
  try {
    console.log("updateDBSiteSettings called with keys:", Object.keys(data));
    const updateData: any = {};
    if (data.siteName !== undefined) updateData.siteName = data.siteName;
    if (data.siteDescription !== undefined) updateData.siteDescription = data.siteDescription;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.logoAdminUrl !== undefined) updateData.logoAdminUrl = data.logoAdminUrl;
    if (data.logoFooterUrl !== undefined) updateData.logoFooterUrl = data.logoFooterUrl;
    if (data.faviconUrl !== undefined) updateData.faviconUrl = data.faviconUrl;
    if (data.ctaTitle !== undefined) updateData.ctaTitle = data.ctaTitle;
    if (data.ctaDescription !== undefined) updateData.ctaDescription = data.ctaDescription;
    if (data.ctaButtonText !== undefined) updateData.ctaButtonText = data.ctaButtonText;
    if (data.ctaButtonLink !== undefined) updateData.ctaButtonLink = data.ctaButtonLink;
    if (data.ctaLogoUrl !== undefined) updateData.ctaLogoUrl = data.ctaLogoUrl;
    if (data.ctaImageUrl !== undefined) updateData.ctaImageUrl = data.ctaImageUrl;
    if (data.ctaBgUrl !== undefined) updateData.ctaBgUrl = data.ctaBgUrl;
    if (data.ctaEnabled !== undefined) updateData.ctaEnabled = Boolean(data.ctaEnabled);
    if (data.ctaLinks !== undefined) updateData.ctaLinks = JSON.stringify(data.ctaLinks);
    if (data.ctaSocialText !== undefined) updateData.ctaSocialText = data.ctaSocialText;
    if (data.ctaSocialUrl !== undefined) updateData.ctaSocialUrl = data.ctaSocialUrl;

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
        ctaTitle: data.ctaTitle || DEFAULT_SETTINGS.ctaTitle,
        ctaDescription: data.ctaDescription || DEFAULT_SETTINGS.ctaDescription,
        ctaButtonText: data.ctaButtonText || DEFAULT_SETTINGS.ctaButtonText,
        ctaButtonLink: data.ctaButtonLink || DEFAULT_SETTINGS.ctaButtonLink,
        ctaLogoUrl: data.ctaLogoUrl || DEFAULT_SETTINGS.ctaLogoUrl,
        ctaImageUrl: data.ctaImageUrl || DEFAULT_SETTINGS.ctaImageUrl,
        ctaBgUrl: data.ctaBgUrl || DEFAULT_SETTINGS.ctaBgUrl,
        ctaEnabled: data.ctaEnabled !== undefined ? Boolean(data.ctaEnabled) : true,
        ctaLinks: data.ctaLinks ? JSON.stringify(data.ctaLinks) : DEFAULT_SETTINGS.ctaLinks,
        ctaSocialText: data.ctaSocialText || DEFAULT_SETTINGS.ctaSocialText,
        ctaSocialUrl: data.ctaSocialUrl || DEFAULT_SETTINGS.ctaSocialUrl,
      }
    });
    revalidatePath('/');
    const ctaLinksParsed = settings.ctaLinks ? JSON.parse(settings.ctaLinks) : [];
    return { success: true, data: { ...settings, ctaLinks: ctaLinksParsed } };
  } catch (error) {
    console.error('Error updating site settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}
