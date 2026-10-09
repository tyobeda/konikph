import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await (prisma as any).siteSettings.findUnique({
      where: { id: 'settings' }
    });
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Super Admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Hanya Super Admin yang diizinkan mengubah pengaturan.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.onlyAdminCanCreateTwibbon !== undefined) {
      updateData.onlyAdminCanCreateTwibbon = Boolean(body.onlyAdminCanCreateTwibbon);
    }

    const updated = await (prisma as any).siteSettings.upsert({
      where: { id: 'settings' },
      update: updateData,
      create: {
        id: 'settings',
        siteName: 'PKSart',
        siteDescription: 'Pusat Unduhan Aset Desain Resmi & Komunitas Desainer PKS',
        logoUrl: '/uploads/1785832971571.png',
        logoAdminUrl: '/uploads/1785832976919.png',
        logoFooterUrl: '/uploads/1785833539740.png',
        faviconUrl: '/favicon.ico',
        onlyAdminCanCreateTwibbon: Boolean(body.onlyAdminCanCreateTwibbon)
      }
    });

    revalidatePath('/', 'layout');
    revalidatePath('/twibbon');
    revalidatePath('/admin/twibbon');

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
