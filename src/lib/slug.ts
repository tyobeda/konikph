import prisma from '@/lib/prisma';

/**
 * Generate a clean URL slug from title string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with -
    .replace(/^-+|-+$/g, ''); // Trim dashes
}

/**
 * Generate a user slug from name or username
 */
export function getUserSlug(user: { id?: string; name?: string; email?: string }): string {
  if (!user) return 'desainer';
  if (user.id === 'superadmin_1' || user.id === 'admin' || user.id === 'super-admin') return 'super-admin';
  const nameSlug = slugify(user.name || '');
  if (nameSlug) return nameSlug;
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    const emailSlug = slugify(emailPrefix);
    if (emailSlug) return emailSlug;
  }
  return user.id || 'desainer';
}

/**
 * Generate a unique artwork slug in the database
 */
export async function generateUniqueArtworkSlug(title: string, currentArtworkId?: string): Promise<string> {
  const baseSlug = slugify(title) || 'artwork';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.artwork.findFirst({
      where: {
        slug: slug,
        ...(currentArtworkId ? { id: { not: currentArtworkId } } : {}),
      },
    });

    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

/**
 * Generate a unique twibbon slug in the database
 */
export async function generateUniqueTwibbonSlug(title: string, currentTwibbonId?: string): Promise<string> {
  const baseSlug = slugify(title) || 'twibbon';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.twibbonFrame.findFirst({
      where: {
        slug: slug,
        ...(currentTwibbonId ? { id: { not: currentTwibbonId } } : {}),
      },
    });

    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

/**
 * Generate a unique brand kit / asset slug in the database
 */
export async function generateUniqueBrandKitSlug(title: string, currentBrandKitId?: string): Promise<string> {
  const baseSlug = slugify(title) || 'aset';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.brandKit.findFirst({
      where: {
        slug: slug,
        ...(currentBrandKitId ? { id: { not: currentBrandKitId } } : {}),
      },
    });

    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}
