import { NextResponse } from 'next/server';
import { getSession } from '@/lib/serverAuth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Super Admin — return static profile (not in DB)
    if (session.userId === 'superadmin_1' || session.role === 'Super Admin') {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: 'superadmin_1',
          name: 'Super Admin PKSart',
          email: session.email,
          role: 'Super Admin',
          isVerified: true,
          avatar: '/img/877859417715829.jpg',
          phone: '',
          address: 'DPP PKS Official',
          region: 'DPP PKS Official',
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
