'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTwibbons() {
  try {
    const twibbons = await prisma.twibbonFrame.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
    
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

export async function addTwibbon(data: any) {
  try {
    const { authorId, ...rest } = data;
    
    // We expect authorId in the payload. If not provided, fallback or fail.
    // The frontend currently doesn't pass authorId directly to addTwibbon if it assumes currentUser is doing it.
    // We will expect it to pass authorId.
    const twibbon = await prisma.twibbonFrame.create({
      data: {
        title: rest.title,
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
