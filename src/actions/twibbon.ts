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

export async function recordTwibbonUsage(data: {
  twibbonId: string;
  userId?: string | null;
  resultImageUrl?: string | null;
  ipAddress?: string | null;
}) {
  try {
    const { twibbonId, userId, resultImageUrl, ipAddress } = data;
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // Resolve real user record in PostgreSQL by ID or Email
    let targetUserId: string | null = null;
    if (userId) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { email: userId },
          ],
        },
        select: { id: true },
      });
      targetUserId = existingUser?.id || null;
    }

    // 1. Rate limiting per User Account (Max 5 per minute)
    if (targetUserId) {
      const userCountThisMinute = await prisma.userTwibbonUsage.count({
        where: {
          userId: targetUserId,
          createdAt: { gte: oneMinuteAgo },
        },
      });

      if (userCountThisMinute >= 5) {
        return {
          success: false,
          rateLimited: true,
          error: 'Batas pembuatan twibbon tercapai (maksimal 5 kali per menit per akun). Silakan tunggu sebentar.',
        };
      }
    }

    // 2. Rate limiting per IP Address (Max 100 per minute)
    if (ipAddress) {
      const ipCountThisMinute = await prisma.userTwibbonUsage.count({
        where: {
          ipAddress,
          createdAt: { gte: oneMinuteAgo },
        },
      });

      if (ipCountThisMinute >= 100) {
        return {
          success: false,
          rateLimited: true,
          error: 'Batas pembuatan twibbon dari IP Anda telah tercapai (maksimal 100 kali per menit).',
        };
      }
    }

    // 3. Increment usedCount on TwibbonFrame
    const updatedTwibbon = await prisma.twibbonFrame.update({
      where: { id: twibbonId },
      data: { usedCount: { increment: 1 } },
    });

    let storedImageUrl: string | null = null;

    // 4. Save file to server folder /public/uploads if Base64 string is passed
    if (resultImageUrl && resultImageUrl.startsWith('data:image')) {
      try {
        const isJpeg = resultImageUrl.startsWith('data:image/jpeg');
        const ext = isJpeg ? '.jpg' : '.png';
        const base64Data = resultImageUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `twibbon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
        const fs = await import('fs/promises');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        storedImageUrl = `/uploads/${filename}`;
      } catch (err) {
        console.error('Failed to save twibbon image file to server disk:', err);
      }
    } else {
      storedImageUrl = resultImageUrl || null;
    }

    // 5. Save Usage Record with file URL in PostgreSQL
    await prisma.userTwibbonUsage.create({
      data: {
        twibbonId,
        userId: targetUserId,
        resultImageUrl: storedImageUrl,
        ipAddress: ipAddress || null,
      },
    });

    revalidatePath('/twibbon');
    revalidatePath(`/twibbon/${twibbonId}`);
    if (userId) revalidatePath('/profile');

    return {
      success: true,
      usedCount: updatedTwibbon.usedCount,
      resultImageUrl: storedImageUrl,
    };
  } catch (error) {
    console.error('Error recording twibbon usage:', error);
    return { success: false, error: 'Failed to record twibbon usage' };
  }
}

export async function getUserUsedTwibbons(userIdOrEmail: string) {
  noStore();
  try {
    // Find matching user by ID or Email
    const matchedUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userIdOrEmail },
          { email: userIdOrEmail },
        ],
      },
      select: { id: true, email: true },
    });

    const targetUserId = matchedUser?.id || userIdOrEmail;

    const usages = await prisma.userTwibbonUsage.findMany({
      where: {
        OR: [
          { userId: targetUserId },
          { userId: userIdOrEmail },
        ],
      },
      include: {
        twibbon: {
          include: { author: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to deduplicated or unique usage items
    const mapped = usages.map((u) => ({
      id: u.id,
      resultImageUrl: u.resultImageUrl,
      createdAt: u.createdAt.toISOString(),
      twibbon: {
        ...u.twibbon,
        status: u.twibbon.status as 'Disetujui' | 'Pending' | 'Ditolak',
        createdAt: u.twibbon.createdAt.toISOString(),
        author: {
          name: u.twibbon.author.name,
          avatar: u.twibbon.author.avatar,
        },
      },
    }));

    return { success: true, data: mapped };
  } catch (error) {
    console.error('Error fetching user used twibbons:', error);
    return { success: false, error: 'Failed to fetch used twibbons', data: [] };
  }
}

export async function getRecentTwibbonUsages(twibbonId: string) {
  noStore();
  try {
    const usages = await prisma.userTwibbonUsage.findMany({
      where: {
        twibbonId,
        resultImageUrl: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        resultImageUrl: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      data: usages.map((u) => u.resultImageUrl).filter(Boolean) as string[],
    };
  } catch (error) {
    console.error('Error fetching recent twibbon usages:', error);
    return { success: false, data: [] };
  }
}
