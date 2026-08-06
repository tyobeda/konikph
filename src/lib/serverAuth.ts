/**
 * serverAuth.ts
 * Server-side session authentication helper.
 * Uses HMAC-SHA256 signed tokens stored in HttpOnly cookies.
 * This file must only be imported in Server Components, Server Actions, and API Routes.
 */

import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

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
