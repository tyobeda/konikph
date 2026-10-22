import { NextResponse } from 'next/server';
import { getSession } from '@/lib/serverAuth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Super Admin — fetch from DB to get latest avatar and info
    if (session.userId === 'superadmin_1' || session.role === 'Super Admin') {
      const dbAdmin = await prisma.user.findUnique({ where: { id: 'superadmin_1' } });
      return NextResponse.json({
        authenticated: true,
        user: {
          id: 'superadmin_1',
          name: dbAdmin?.name || 'Super Admin KONI Kepahiang',
          email: dbAdmin?.email || session.email,
          role: 'Super Admin',
          isVerified: true,
          avatar: dbAdmin?.avatar || '/uploads/1792673968064_t0rm3q.png',
          phone: dbAdmin?.phone || '081199887766',
          address: dbAdmin?.address || 'GOR Tebat Monok, Kepahiang',
          region: dbAdmin?.region || 'KONI Kepahiang',
        },
      });
    }

    // Regular user — fetch from DB to get latest status
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.status === 'Suspended' || user.status === 'Pending') {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        region: user.region,
        role: user.role,
        avatar: user.avatar,
        isVerified: (user as any).isVerified,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
