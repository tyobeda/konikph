'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';

const DEFAULT_SETTINGS = {
  id: 'settings',
  siteName: 'PKSart - Galeri Desain & Foto PKS Official',
  siteDescription: 'Platform galeri poster, spanduk, social media kit, dan aset desain resmi PKS.',
  logoUrl: '/favicon.ico',
  logoAdminUrl: '/favicon.ico',
  logoFooterUrl: '/favicon.ico',
  faviconUrl: '/favicon.ico',
  ctaTitle: 'Ayo Gabung Jadi Kreator PKSart!',
  ctaDescription: 'Seluruh produk desain dan infografis yang tersaji di web ini adalah OFFICIAL milik PKSART.\nPKSART tidak bertanggungjawab atas penyalahgunaan elemen desain untuk kepentingan tertentu.\nSemua grafis yang tersebar di internet dan tidak tersaji di web ini adalah TIDAK OFFICIAL.',
  ctaButtonText: 'Daftar Sekarang',
  ctaButtonLink: '/register',
  ctaLogoUrl: '',
  ctaImageUrl: '/img/970023295166107.jpg', // Use a clean local image path instead of raw SVG string
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
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'settings' }
    });
    if (!settings) {
      settings = await prisma.siteSettings.create({
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
    const serializedCtaLinks = data.ctaLinks ? JSON.stringify(data.ctaLinks) : DEFAULT_SETTINGS.ctaLinks;
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'settings' },
      update: {
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        logoUrl: data.logoUrl,
        logoAdminUrl: data.logoAdminUrl,
        logoFooterUrl: data.logoFooterUrl,
        faviconUrl: data.faviconUrl,
        ctaTitle: data.ctaTitle,
        ctaDescription: data.ctaDescription,
        ctaButtonText: data.ctaButtonText,
        ctaButtonLink: data.ctaButtonLink,
        ctaLogoUrl: data.ctaLogoUrl,
        ctaImageUrl: data.ctaImageUrl,
        ctaBgUrl: data.ctaBgUrl,
        ctaEnabled: data.ctaEnabled !== undefined ? Boolean(data.ctaEnabled) : true,
        ctaLinks: serializedCtaLinks,
        ctaSocialText: data.ctaSocialText,
        ctaSocialUrl: data.ctaSocialUrl,
      },
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
        ctaLinks: serializedCtaLinks,
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
