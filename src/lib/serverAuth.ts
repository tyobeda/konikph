/**
 * serverAuth.ts
 * Server-side session authentication helper.
 * Uses HMAC-SHA256 signed tokens stored in HttpOnly cookies.
 * This file must only be imported in Server Components, Server Actions, and API Routes.
 */

import { cookies } from 'next/headers';
import { createHmac } from 'crypto';
import prisma from '@/lib/prisma';

const SESSION_COOKIE = 'pksart_session';
const SECRET = process.env.ADMIN_SECRET || 'pksart_fallback_secret';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

// ─── Token helpers ───────────────────────────────────────────────────────────

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex');
}

function buildToken(userId: string, role: string, email: string): string {
  const payload = JSON.stringify({ userId, role, email, iat: Date.now() });
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = sign(encoded);
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): { userId: string; role: string; email: string } | null {
  try {
    const [encoded, sig] = token.split('.');
    if (!encoded || !sig) return null;
    const expectedSig = sign(encoded);
    if (sig !== expectedSig) return null; // Tamper check
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    return payload;
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Create and set a signed HttpOnly session cookie after successful login.
 */
export async function createSessionCookie(userId: string, role: string, email: string): Promise<void> {
  const token = buildToken(userId, role, email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

/**
 * Read and verify the current session cookie.
 * Returns the decoded session payload, or null if invalid/absent.
 */
export async function getSession(): Promise<{ userId: string; role: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Destroy the session cookie (logout).
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Guard for Admin-only Server Actions.
 * Throws a descriptive error if caller is not authenticated as Super Admin.
 */
export async function requireAdminSession(): Promise<{ userId: string; role: string; email: string }> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized: Anda harus login terlebih dahulu.');
  }
  if (session.role !== 'Super Admin') {
    throw new Error('Forbidden: Hanya Super Admin yang dapat melakukan aksi ini.');
  }
  return session;
}

/**
 * Guard for any authenticated user (not just admin).
 * Throws if caller is not logged in at all.
 */
export async function requireSession(): Promise<{ userId: string; role: string; email: string }> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized: Anda harus login terlebih dahulu.');
  }
  return session;
}

/**
 * Fetch currently logged in user on the server for SSR (zero UI flash).
 */
export async function getCurrentServerUser(): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean;
  avatar?: string;
  phone?: string;
  address?: string;
  region?: string;
  status?: string;
} | null> {
  try {
    const session = await getSession();
    if (!session) return null;

    if (session.userId === 'superadmin_1' || session.role === 'Super Admin') {
      return {
        id: 'superadmin_1',
        name: 'Super Admin PKSart',
        email: session.email,
        role: 'Super Admin',
        isVerified: true,
        avatar: '/img/877859417715829.jpg',
        phone: '',
        address: 'DPP PKS Official',
        region: 'DPP PKS Official',
        status: 'Active',
      };
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.status === 'Suspended' || user.status === 'Pending') {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      region: user.region || '',
      role: user.role || 'Desainer PKS',
      avatar: user.avatar || '',
      isVerified: Boolean((user as any).isVerified),
      status: user.status || 'Aktif',
    };
  } catch (error) {
    console.error('Error fetching current server user:', error);
    return null;
  }
}

