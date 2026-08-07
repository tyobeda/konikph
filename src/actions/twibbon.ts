'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { generateUniqueTwibbonSlug } from '@/lib/slug';

export async function getTwibbons() {
  noStore();
  try {
    const twibbons = await prisma.twibbonFrame.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });

    // Auto-migrate legacy twibbons without slug
    for (const t of twibbons) {
      if (!t.slug && t.title) {
        const generatedSlug = await generateUniqueTwibbonSlug(t.title, t.id);
        await prisma.twibbonFrame.update({
          where: { id: t.id },
          data: { slug: generatedSlug },
        }).catch(() => {});
        t.slug = generatedSlug;
      }
    }
    
    // Map to include author.name and author.avatar as expected by frontend
    const mapped = twibbons.map(t => ({
      ...t,
      status: t.status as 'Disetujui' | 'Pending' | 'Ditolak',
      createdAt: t.createdAt.toISOString(),
      author: {
        name: t.author.name,
        avatar: t.author.avatar,
      }
    }));
    return { success: true, data: mapped };
  } catch (error) {
    console.error('Error fetching twibbons:', error);
    return { success: false, error: 'Failed to fetch twibbons' };
  }
}

export async function getTwibbonBySlugOrId(slugOrId: string) {
  noStore();
  try {
    let twibbon = await prisma.twibbonFrame.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          { id: slugOrId },
        ],
      },
      include: { author: true },
    });

    if (twibbon) {
      if (!twibbon.slug && twibbon.title) {
        const generatedSlug = await generateUniqueTwibbonSlug(twibbon.title, twibbon.id);
        twibbon = await prisma.twibbonFrame.update({
          where: { id: twibbon.id },
          data: { slug: generatedSlug },
          include: { author: true },
        });
      }
      const mapped = {
        ...twibbon,
        status: twibbon.status as 'Disetujui' | 'Pending' | 'Ditolak',
        createdAt: twibbon.createdAt.toISOString(),
        author: {
          name: twibbon.author.name,
          avatar: twibbon.author.avatar,
        },
      };
      return { success: true, data: mapped };
    }

    return { success: false, error: 'Twibbon not found' };
  } catch (error) {
    console.error('Error fetching twibbon by slug/id:', error);
    return { success: false, error: 'Failed to fetch twibbon' };
  }
}

export async function addTwibbon(data: any) {
  try {
    const { authorId: rawAuthorId, ...rest } = data;
    let authorId = rawAuthorId || 'superadmin_1';

    let userExists = await prisma.user.findUnique({ where: { id: authorId } });
    if (!userExists) {
      const newUser = await prisma.user.upsert({
        where: { id: authorId },
        update: {},
        create: {
          id: authorId,
          name: rest.author?.name || 'Super Admin PKSart',
          email: 'admin@pks.art',
          phone: '081199887766',
          address: 'DPP PKS Official, Jakarta Selatan',
          region: rest.region || 'DPP PKS Official',
          avatar: '/img/877859417715829.jpg',
          role: 'Super Admin',
        }
      });
      authorId = newUser.id;
    }
    
    const slug = rest.slug || (await generateUniqueTwibbonSlug(rest.title));

    const twibbon = await prisma.twibbonFrame.create({
      data: {
        title: rest.title,
        slug: slug,
        imageUrl: rest.imageUrl,
        category: rest.category,
        region: rest.region,
        authorId: authorId,
        status: rest.status || 'Pending',
        isFeatured: rest.isFeatured || false,
      },
      include: { author: true },
    });
    
    revalidatePath('/admin/twibbon');
    revalidatePath('/twibbon');
    
    return { 
      success: true, 
      data: {
        ...twibbon,
        status: twibbon.status as 'Disetujui' | 'Pending' | 'Ditolak',
        createdAt: twibbon.createdAt.toISOString(),
        author: { name: twibbon.author.name, avatar: twibbon.author.avatar }
      } 
    };
  } catch (error) {
    console.error('Error adding twibbon:', error);
    return { success: false, error: 'Failed to add twibbon' };
  }
}

export async function updateTwibbon(id: string, data: any) {
  try {
    const { author, authorId, id: _, createdAt, usedCount, ...updateData } = data;
    const twibbon = await prisma.twibbonFrame.update({
      where: { id },
      data: updateData,
      include: { author: true },
    });
    revalidatePath('/admin/twibbon');
    revalidatePath('/twibbon');
    revalidatePath(`/twibbon/${id}`);
    
    return { 
      success: true, 
      data: {
        ...twibbon,
        status: twibbon.status as 'Disetujui' | 'Pending' | 'Ditolak',
        createdAt: twibbon.createdAt.toISOString(),
        author: { name: twibbon.author.name, avatar: twibbon.author.avatar }
      } 
    };
  } catch (error) {
    console.error('Error updating twibbon:', error);
    return { success: false, error: 'Failed to update twibbon' };
  }
}

export async function deleteTwibbon(id: string) {
  try {
    await prisma.twibbonFrame.delete({
      where: { id },
    });
    revalidatePath('/admin/twibbon');
    revalidatePath('/twibbon');
    return { success: true };
  } catch (error) {
    console.error('Error deleting twibbon:', error);
    return { success: false, error: 'Failed to delete twibbon' };
  }
}

export async function toggleTwibbonFavorite(twibbonId: string, userId: string) {
  try {
    const existing = await prisma.twibbonFavorite.findUnique({
      where: {
        userId_twibbonId: {
          userId,
          twibbonId
        }
      }
    });

    if (existing) {
      await prisma.twibbonFavorite.delete({ where: { id: existing.id } });
      revalidatePath('/twibbon');
      revalidatePath(`/twibbon/${twibbonId}`);
      return { success: true, favorited: false };
    } else {
      await prisma.twibbonFavorite.create({
        data: {
          userId,
          twibbonId
        }
      });
      revalidatePath('/twibbon');
      revalidatePath(`/twibbon/${twibbonId}`);
      return { success: true, favorited: true };
    }
  } catch (error) {
    console.error('Error toggling twibbon favorite:', error);
    return { success: false, error: 'Failed to toggle twibbon favorite' };
  }
}

export async function incrementTwibbonUsedDB(id: string) {
  try {
    const updated = await prisma.twibbonFrame.update({
      where: { id },
      data: {
        usedCount: { increment: 1 }
      }
    });
    revalidatePath('/twibbon');
    revalidatePath(`/twibbon/${id}`);
    return { success: true, usedCount: updated.usedCount };
  } catch (error) {
    console.error('Error incrementing twibbon used count:', error);
    return { success: false, error: 'Failed to increment count' };
  }
}

export async function getUserTwibbonFavorites(userId: string) {
  try {
    const favorites = await prisma.twibbonFavorite.findMany({
      where: { userId },
      select: { twibbonId: true }
    });
    return { success: true, data: favorites.map(f => f.twibbonId) };
  } catch (error) {
    console.error('Error fetching twibbon favorites:', error);
    return { success: false, error: 'Failed to fetch favorites', data: [] };
  }
}
