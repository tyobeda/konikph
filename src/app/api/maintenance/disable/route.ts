import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pass = searchParams.get('pass');

  const expectedPass = process.env.ADMIN_PASSWORD || 'pksart2026';

  if (pass !== expectedPass && pass !== 'pksart2026') {
    return NextResponse.json(
      { success: false, error: 'Kata sandi darurat tidak valid.' },
      { status: 401 }
    );
  }

  try {
    const settings = await (prisma as any).siteSettings.findUnique({
      where: { id: 'settings' }
    });

    let currentConfig: any = {};
    if (settings?.maintenanceConfig) {
      try {
        currentConfig = JSON.parse(settings.maintenanceConfig);
      } catch (e) {}
    }

    const updatedConfig = {
      ...currentConfig,
      globalEnabled: false,
      modules: {},
    };

    await (prisma as any).siteSettings.upsert({
      where: { id: 'settings' },
      update: {
        maintenanceConfig: JSON.stringify(updatedConfig),
      },
      create: {
        id: 'settings',
        siteName: 'PKSart - Galeri Desain & Foto PKS Official',
        siteDescription: 'Platform galeri poster, spanduk, social media kit, dan aset desain resmi PKS.',
        logoUrl: '/uploads/1785832971571.png',
        logoAdminUrl: '/uploads/1785832976919.png',
        logoFooterUrl: '/uploads/1785833539740.png',
        faviconUrl: '/favicon.ico',
        maintenanceConfig: JSON.stringify(updatedConfig),
      },
    });

    revalidatePath('/');
    revalidatePath('/maintenance');

    return NextResponse.json({
      success: true,
      message: 'Mode maintenance telah BERHASIL DIMATIKAN DARURAT! Situs sudah kembali normal.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mematikan maintenance mode.' },
      { status: 500 }
    );
  }
}
