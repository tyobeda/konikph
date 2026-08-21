import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSessionCookie } from '@/lib/serverAuth';
import { checkRateLimit } from '@/lib/rateLimit';
import bcrypt from 'bcryptjs';

// Super Admin credentials stored server-side only (never sent to client)
const ADMIN_EMAIL = 'admin@pks.art';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pksart2026';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email dan kata sandi wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Rate limit per IP
    const rateCheck = checkRateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
    if (!rateCheck.success) {
      const minutesLeft = Math.ceil(rateCheck.resetInMs / 60000);
      return NextResponse.json(
        { success: false, message: `Terlalu banyak percobaan. Coba lagi dalam ${minutesLeft} menit.` },
        { status: 429 }
      );
    }

    // ── Super Admin path ────────────────────────────────────────────────────
    if (cleanEmail === ADMIN_EMAIL) {
      let isSuperAdminMatch = false;

      // 1. Check against DB user superadmin_1
      const superAdminUser = await prisma.user.findFirst({
        where: { OR: [{ id: 'superadmin_1' }, { email: ADMIN_EMAIL }] }
      });

      if (superAdminUser && superAdminUser.password) {
        if (superAdminUser.password.startsWith('$2a$') || superAdminUser.password.startsWith('$2b$')) {
          isSuperAdminMatch = await bcrypt.compare(password, superAdminUser.password);
        } else if (password === superAdminUser.password) {
          isSuperAdminMatch = true;
        }
      }

      // 2. Fallback check against ADMIN_PASSWORD env / default
      if (!isSuperAdminMatch && password === ADMIN_PASSWORD) {
        isSuperAdminMatch = true;
      }

      if (!isSuperAdminMatch) {
        return NextResponse.json({ success: false, message: 'Kata sandi Super Admin yang Anda masukkan salah.' }, { status: 401 });
      }

      await createSessionCookie('superadmin_1', 'Super Admin', ADMIN_EMAIL);
      return NextResponse.json({
        success: true,
        message: 'Selamat datang Super Admin PKSart!',
        user: {
          id: superAdminUser?.id || 'superadmin_1',
          name: superAdminUser?.name || 'Super Admin PKSart',
          email: ADMIN_EMAIL,
          role: 'Super Admin',
          isVerified: true,
          avatar: superAdminUser?.avatar || '/img/877859417715829.jpg',
          phone: superAdminUser?.phone || '+6281199887766',
          address: superAdminUser?.address || 'DPP PKS Official',
          region: superAdminUser?.region || 'DPP PKS Official',
          status: 'Active',
        },
      });
    }

    // ── Regular user path ───────────────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Email tidak ditemukan.' }, { status: 401 });
    }

    // Password verification for regular users (bcrypt compare + legacy fallback auto-upgrade)
    let isMatch = false;
    const storedPassword = user.password || user.phone;

    if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'))) {
      isMatch = await bcrypt.compare(password, storedPassword);
    } else if (storedPassword && password === storedPassword) {
      isMatch = true;
      // Auto-upgrade legacy plain text password to bcrypt hash
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
      } catch (e) {
        console.error('Failed to auto-upgrade password hash:', e);
      }
    }

    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Kata sandi yang Anda masukkan salah.' }, { status: 401 });
    }

    if (user.status === 'Pending' || user.status === 'Pending Approval') {
      await createSessionCookie(user.id, user.role || 'Desainer PKS', user.email);
      return NextResponse.json({
        success: true,
        isPendingApproval: true,
        message: 'Akun Anda sedang menunggu persetujuan (Approval) oleh Admin PKSart.',
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
    }

    if (user.status === 'Suspended') {
      return NextResponse.json({
        success: false,
        message: 'Akun Anda saat ini ditangguhkan. Silakan hubungi pengurus Admin PKSart.',
      }, { status: 403 });
    }

    // Allow regular user login if user exists and is active/pending
    // (Accepts any non-empty password provided during registration or login)
    if (!password) {
      return NextResponse.json({ success: false, message: 'Kata sandi wajib diisi.' }, { status: 401 });
    }

    await createSessionCookie(user.id, user.role || 'Desainer PKS', user.email);

    return NextResponse.json({
      success: true,
      message: `Selamat datang kembali, ${user.name}!`,
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
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
