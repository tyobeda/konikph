'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { checkRateLimit } from '@/lib/rateLimit';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function getResetRequests() {
  noStore();
  try {
    const requests = await (prisma as any).resetRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return {
      success: true,
      data: requests.map((r: any) => ({
        ...r,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
        expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
      })),
    };
  } catch (error) {
    console.error('Error fetching reset requests:', error);
    return { success: false, error: 'Gagal mengambil data permintaan reset' };
  }
}

export async function addResetRequest(data: { name: string; email: string; phone: string }) {
  try {
    const cleanEmail = data.email.trim().toLowerCase();

    // 1. Check database for existing reset request created within last 2 minutes (120,000 ms)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const recentRequest = await (prisma as any).resetRequest.findFirst({
      where: {
        email: cleanEmail,
        createdAt: {
          gte: twoMinutesAgo,
        },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => null);

    if (recentRequest) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(recentRequest.createdAt).getTime()) / 1000);
      const remainingSeconds = Math.max(1, 120 - elapsedSeconds);
      return {
        success: false,
        error: `Permohonan reset untuk akun ini hanya dapat dilakukan 2 menit sekali. Silakan tunggu ${remainingSeconds} detik lagi.`,
      };
    }

    // 2. Memory rate limit check (1 request per 2 minutes)
    const rateCheck = checkRateLimit(`reset:${cleanEmail}`, 1, 2 * 60 * 1000);
    if (!rateCheck.success) {
      return {
        success: false,
        error: 'Permohonan reset untuk akun ini hanya dapat dilakukan 2 menit sekali. Silakan coba lagi sebentar lagi.',
      };
    }

    // Generate a secure 32-character token
    const token = crypto.randomBytes(24).toString('hex');
    // Set 5 minutes expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const request = await (prisma as any).resetRequest.create({
      data: {
        name: data.name || 'User',
        email: cleanEmail,
        phone: data.phone || '',
        token: token,
        expiresAt: expiresAt,
        used: false,
        status: 'Pending',
      },
    }).catch(async () => {
      // Fallback create if token field had conflict or issue
      return await (prisma as any).resetRequest.create({
        data: {
          name: data.name || 'User',
          email: cleanEmail,
          phone: data.phone || '',
          status: 'Pending',
        },
      });
    });

    revalidatePath('/admin/creators');
    return {
      success: true,
      data: {
        ...request,
        createdAt: request.createdAt ? request.createdAt.toISOString() : new Date().toISOString(),
        expiresAt: request.expiresAt ? request.expiresAt.toISOString() : null,
      },
    };
  } catch (error: any) {
    console.error('Error adding reset request:', error);
    return { success: false, error: error?.message || 'Gagal membuat permohonan reset kata sandi' };
  }
}

/**
  Admin approves reset request & generates fresh 5-minute link if needed
 */
export async function generateResetLinkAction(id: string) {
  try {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 1. Find target record ID using raw SQL
    let targetId: string | null = null;

    if (id && !id.startsWith('req-')) {
      const rows: any[] = await (prisma as any).$queryRawUnsafe(
        `SELECT "id" FROM "ResetRequest" WHERE "id" = $1 LIMIT 1`, id
      );
      if (rows.length > 0) targetId = rows[0].id;
    }

    if (!targetId) {
      const rows: any[] = await (prisma as any).$queryRawUnsafe(
        `SELECT "id" FROM "ResetRequest" ORDER BY "createdAt" DESC LIMIT 1`
      );
      if (rows.length > 0) targetId = rows[0].id;
    }

    // 2. Update or create using raw SQL
    if (targetId) {
      await (prisma as any).$executeRawUnsafe(
        `UPDATE "ResetRequest" SET "token" = $1, "expiresAt" = $2, "used" = false, "status" = 'Pending' WHERE "id" = $3`,
        token, expiresAt, targetId
      );
    } else {
      await (prisma as any).$executeRawUnsafe(
        `INSERT INTO "ResetRequest" ("id", "name", "email", "phone", "token", "expiresAt", "used", "status", "createdAt") VALUES (gen_random_uuid(), 'Desainer PKSart', 'user@pks.art', '', $1, $2, false, 'Pending', NOW())`,
        token, expiresAt
      );
    }

    // 3. Verify using raw SQL (bypasses stale Prisma client)
    const verify: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT "id", "token" FROM "ResetRequest" WHERE "token" = $1 LIMIT 1`, token
    );

    if (!verify || verify.length === 0) {
      console.error('CRITICAL: Token NOT found in DB after raw SQL update');
      return { success: false, error: 'Token gagal disimpan. Restart dev server lalu coba lagi.' };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    revalidatePath('/admin/creators');

    return {
      success: true,
      resetUrl,
    };
  } catch (error: any) {
    console.error('Error generating reset link:', error);
    return { success: false, error: error?.message || 'Gagal membuat link reset kata sandi' };
  }
}

/**
  Verify token validity (< 5 minutes, not used, request exists)
 */
export async function verifyResetTokenAction(token: string) {
  noStore();
  try {
    if (!token) {
      return { status: 'INVALID', error: 'Token reset tidak ditemukan.' };
    }

    // Use raw SQL because Prisma client may not recognize the token column
    const rows: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT "id", "name", "email", "phone", "token", "expiresAt", "used", "status" FROM "ResetRequest" WHERE "token" = $1 LIMIT 1`,
      token
    );

    if (!rows || rows.length === 0) {
      return { status: 'INVALID', error: 'Tautan reset kata sandi tidak valid.' };
    }

    const request = rows[0];

    if (request.used) {
      return { status: 'USED', error: 'Tautan reset kata sandi ini sudah pernah digunakan.' };
    }

    const now = new Date();
    if (request.expiresAt && now > new Date(request.expiresAt)) {
      return { status: 'EXPIRED', error: 'Tautan reset kata sandi telah kadaluarsa (lebih dari 5 menit).' };
    }

    return {
      status: 'VALID',
      data: {
        name: request.name,
        email: request.email,
        expiresAt: request.expiresAt,
      },
    };
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return { status: 'INVALID', error: 'Gagal memverifikasi token reset.' };
  }
}

/**
  Execute password reset with new password
 */
export async function executePasswordResetAction(token: string, newPassword: string) {
  try {
    if (!token || !newPassword) {
      return { success: false, error: 'Data tidak lengkap.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Kata sandi minimal 6 karakter.' };
    }

    // Verify token validity
    const check = await verifyResetTokenAction(token);
    if (check.status !== 'VALID' || !check.data) {
      return { success: false, error: check.error || 'Tautan reset tidak valid atau telah kadaluarsa.' };
    }

    // Use raw SQL for token lookup
    const rows: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT "id", "email" FROM "ResetRequest" WHERE "token" = $1 LIMIT 1`,
      token
    );

    if (!rows || rows.length === 0) {
      return { success: false, error: 'Permintaan reset tidak ditemukan.' };
    }
    const request = rows[0];

    // Find corresponding user by email
    const user = await (prisma as any).user.findUnique({
      where: { email: request.email.trim().toLowerCase() },
    });

    if (!user) {
      return { success: false, error: `User dengan email ${request.email} tidak ditemukan.` };
    }

    // Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in database
    await (prisma as any).user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Mark reset request as used & completed via raw SQL
    await (prisma as any).$executeRawUnsafe(
      `UPDATE "ResetRequest" SET "used" = true, "status" = 'Selesai' WHERE "id" = $1`,
      request.id
    );

    revalidatePath('/admin/creators');
    return {
      success: true,
      message: 'Kata sandi Anda telah BERHASIL diubah! Silakan masuk dengan kata sandi baru Anda.',
    };
  } catch (error: any) {
    console.error('Error executing password reset:', error);
    return { success: false, error: error?.message || 'Gagal mengubah kata sandi.' };
  }
}

export async function completeResetRequest(id: string) {
  try {
    const request = await (prisma as any).resetRequest.update({
      where: { id },
      data: { status: 'Selesai' },
    });
    revalidatePath('/admin/creators');
    return {
      success: true,
      data: {
        ...request,
        createdAt: request.createdAt ? request.createdAt.toISOString() : new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error completing reset request:', error);
    return { success: false, error: 'Failed to complete reset request' };
  }
}

export async function deleteResetRequest(id: string) {
  try {
    await (prisma as any).resetRequest.delete({
      where: { id },
    });
    revalidatePath('/admin/creators');
    return { success: true };
  } catch (error) {
    console.error('Error deleting reset request:', error);
    return { success: false, error: 'Failed to delete reset request' };
  }
}
