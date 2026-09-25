'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { generateUniqueBrandKitSlug, slugify } from '@/lib/slug';

export async function getBrandKits() {
  noStore();
  try {
    const brandKits = await prisma.brandKit.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Auto-generate slugs for legacy brand kits without slug
    for (const b of brandKits) {
      if (!b.slug && b.title) {
        const generatedSlug = await generateUniqueBrandKitSlug(b.title, b.id);
        await prisma.brandKit.update({
          where: { id: b.id },
          data: { slug: generatedSlug },
        }).catch(() => {});
        b.slug = generatedSlug;
      }
    }

    return { 
      success: true, 
      data: brandKits.map(b => ({
        ...b,
        createdAt: b.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: b.updatedAt?.toISOString() || new Date().toISOString(),
      })) 
    };
  } catch (error) {
    console.error('Error fetching brand kits:', error);
    return { success: false, error: 'Failed to fetch brand kits' };
  }
}

export async function getBrandKitBySlugOrId(slugOrId: string) {
  noStore();
  try {
    let brandKit = await prisma.brandKit.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          { id: slugOrId },
        ],
      },
    });

    if (!brandKit) {
      return { success: false, error: 'Aset desain tidak ditemukan' };
    }

    // Auto-generate slug if missing
    if (!brandKit.slug && brandKit.title) {
      const generatedSlug = await generateUniqueBrandKitSlug(brandKit.title, brandKit.id);
      await prisma.brandKit.update({
        where: { id: brandKit.id },
        data: { slug: generatedSlug },
      }).catch(() => {});
      brandKit.slug = generatedSlug;
    }

    return { 
      success: true, 
      data: {
        ...brandKit,
        createdAt: brandKit.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: brandKit.updatedAt?.toISOString() || new Date().toISOString(),
      }
    };
  } catch (error) {
    console.error('Error fetching brand kit by slug/id:', error);
    return { success: false, error: 'Gagal memuat detail aset desain' };
  }
}

export async function incrementBrandKitDownload(id: string) {
  try {
    const updated = await prisma.brandKit.update({
      where: { id },
      data: {
        downloadsCount: { increment: 1 },
      },
    });
    return { success: true, count: updated.downloadsCount };
  } catch (error) {
    return { success: false };
  }
}

export async function addBrandKit(data: any) {
  try {
    const cleanTitle = (data.title || 'Aset Desain').trim();
    let slug = data.slug ? slugify(data.slug) : '';
    if (!slug) {
      slug = await generateUniqueBrandKitSlug(cleanTitle);
    } else {
      // Check if provided custom slug already taken
      const existing = await prisma.brandKit.findUnique({ where: { slug } });
      if (existing) {
        slug = await generateUniqueBrandKitSlug(slug);
      }
    }

    const brandKit = await prisma.brandKit.create({
      data: {
        title: cleanTitle,
        slug,
        description: data.description ? data.description.trim() : null,
        category: data.category || 'Lainnya',
        format: data.format || '.png',
        iconType: data.iconType || 'image',
        color: data.color || 'bg-orange-50 text-[#F26522] border-orange-200',
        fileUrl: data.fileUrl || '',
        previewUrl: data.previewUrl || null,
        isPublic: data.isPublic !== undefined ? Boolean(data.isPublic) : true,
      },
    });

    revalidatePath('/admin/brandkit');
    revalidatePath('/assets');
    return { 
      success: true, 
      data: {
        ...brandKit,
        createdAt: brandKit.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: brandKit.updatedAt?.toISOString() || new Date().toISOString(),
      }
    };
  } catch (error) {
    console.error('Error adding brand kit:', error);
    return { success: false, error: 'Failed to add brand kit' };
  }
}

export async function updateBrandKit(id: string, data: any) {
  try {
    const cleanTitle = data.title ? data.title.trim() : undefined;
    let slug = data.slug ? slugify(data.slug) : undefined;

    if (slug) {
      // Verify uniqueness if changed
      const existing = await prisma.brandKit.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });
      if (existing) {
        slug = await generateUniqueBrandKitSlug(slug, id);
      }
    } else if (cleanTitle) {
      const current = await prisma.brandKit.findUnique({ where: { id } });
      if (!current?.slug) {
        slug = await generateUniqueBrandKitSlug(cleanTitle, id);
      }
    }

    const updateData: any = {};
    if (cleanTitle !== undefined) updateData.title = cleanTitle;
    if (slug !== undefined) updateData.slug = slug;
    if (data.description !== undefined) updateData.description = data.description ? data.description.trim() : null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.format !== undefined) updateData.format = data.format;
    if (data.iconType !== undefined) updateData.iconType = data.iconType;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;
    if (data.previewUrl !== undefined) updateData.previewUrl = data.previewUrl ? data.previewUrl : null;
    if (data.isPublic !== undefined) updateData.isPublic = Boolean(data.isPublic);

    const brandKit = await prisma.brandKit.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/admin/brandkit');
    revalidatePath('/assets');
    if (brandKit.slug) {
      revalidatePath(`/assets/${brandKit.slug}`);
    }
    return { 
      success: true, 
      data: {
        ...brandKit,
        createdAt: brandKit.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: brandKit.updatedAt?.toISOString() || new Date().toISOString(),
      }
    };
  } catch (error) {
    console.error('Error updating brand kit:', error);
    return { success: false, error: 'Failed to update brand kit' };
  }
}

export async function deleteBrandKit(id: string) {
  try {
    const brandKit = await prisma.brandKit.findUnique({ where: { id } });
    await prisma.brandKit.delete({
      where: { id },
    });
    revalidatePath('/admin/brandkit');
    revalidatePath('/assets');
    if (brandKit?.slug) {
      revalidatePath(`/assets/${brandKit.slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting brand kit:', error);
    return { success: false, error: 'Failed to delete brand kit' };
  }
}
