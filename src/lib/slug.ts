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
