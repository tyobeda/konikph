'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { createNotification } from './notification';
import { requireAdminSession } from '@/lib/serverAuth';
import { generateUniqueArtworkSlug, slugify } from '@/lib/slug';
import { containsForbiddenWords, containsLink } from '@/lib/moderation';
import { checkRateLimit } from '@/lib/rateLimit';

export async function getArtworks() {
  noStore();
  try {
    const artworks = await prisma.artwork.findMany({
      include: {
        author: true,
        likes: { select: { userId: true } },
        comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: [ { createdAt: 'desc' }, { id: 'asc' } ],
    });

    // Auto-migrate legacy artworks without slug
    for (const a of artworks) {
      if (!a.slug && a.title) {
        const generatedSlug = await generateUniqueArtworkSlug(a.title, a.id);
        await prisma.artwork.update({
          where: { id: a.id },
          data: { slug: generatedSlug },
        }).catch(() => {});
        a.slug = generatedSlug;
      }
    }

    const mapped = artworks.map(a => ({
      ...a,
      likedUserIds: (a.likes || []).map((l: any) => l.userId),
      comments: a.comments.map((c: any) => ({ ...c, author: c.user }))
    }));
    return { success: true, data: mapped };
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return { success: false, error: 'Failed to fetch artworks' };
  }
}

export async function getArtworkBySlugOrId(slugOrId: string) {
  noStore();
  try {
    let artwork = await prisma.artwork.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          { id: slugOrId },
        ],
      },
      include: {
        author: true,
        likes: { select: { userId: true } },
        comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (artwork) {
      if (!artwork.slug && artwork.title) {
        const generatedSlug = await generateUniqueArtworkSlug(artwork.title, artwork.id);
        artwork = await prisma.artwork.update({
          where: { id: artwork.id },
          data: { slug: generatedSlug },
          include: {
            author: true,
            likes: { select: { userId: true } },
            comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
          },
        });
      }
      const mapped = {
        ...artwork,
        likedUserIds: ((artwork as any).likes || []).map((l: any) => l.userId),
        comments: (artwork.comments || []).map((c: any) => ({ ...c, author: c.user })),
      };
      return { success: true, data: mapped };
    }

    return { success: false, error: 'Artwork not found' };
  } catch (error) {
    console.error('Error fetching artwork by slug/id:', error);
    return { success: false, error: 'Failed to fetch artwork' };
  }
}

export async function addArtwork(data: any) {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'settings' } });
    const activeForbiddenWords = settings?.forbiddenWords || 'judi, slot, gacor, bokep, porno, sara, rasis, penipu';
    const badTitle = containsForbiddenWords(data.title || '', activeForbiddenWords);
    if (badTitle) {
      return { success: false, error: `Judul karya mengandung kata yang dilarang/tidak diizinkan ("${badTitle}")` };
    }
    const badDesc = containsForbiddenWords(data.description || '', activeForbiddenWords);
    if (badDesc) {
      return { success: false, error: `Deskripsi karya mengandung kata yang dilarang/tidak diizinkan ("${badDesc}")` };
    }

    let authorId = data.authorId || 'superadmin_1';

    // Anti-spam Rate Limiting: Max 10 artwork uploads per minute per user
    const rateCheck = checkRateLimit(`upload:${authorId}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      const secondsLeft = Math.ceil(rateCheck.resetInMs / 1000);
      return {
        success: false,
        error: `Batas unggah tercapai (Maksimal 10 karya per menit). Silakan tunggu ${secondsLeft} detik lagi.`
      };
    }

    // Ensure author exists in User table to satisfy FK constraint
    let userExists = await prisma.user.findUnique({ where: { id: authorId } });
    if (!userExists) {
      // Create user record for Super Admin or new author
      const newUser = await prisma.user.upsert({
        where: { id: authorId },
        update: {},
        create: {
          id: authorId,
          name: data.author?.name || 'Super Admin PKSart',
          email: data.author?.email || 'admin@pks.art',
          phone: data.author?.phone || '081199887766',
          address: data.author?.address || 'DPP PKS Official, Jakarta Selatan',
          region: data.author?.region || data.region || 'DPP PKS Official',
          avatar: data.author?.avatar || '/img/877859417715829.jpg',
          role: data.author?.role || 'Super Admin',
        }
      });
      authorId = newUser.id;
    }

    const slug = data.slug || (await generateUniqueArtworkSlug(data.title));

    // Moderation rule:
    // - If author is Super Admin or verified (isVerified === true), auto approve (no moderation).
    // - If autoApproveArtworks is not false, auto approve.
    // - If autoApproveArtworks is false AND author is not verified, set to 'Pending'.
    let artworkStatus = 'Disetujui';
    const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'settings' } });
    const authorUser = await prisma.user.findUnique({ where: { id: authorId } });
    const isExempt = authorUser?.role === 'Super Admin' || 
                     Boolean(authorUser?.isVerified) || 
                     data.author?.role === 'Super Admin' || 
                     Boolean(data.author?.isVerified);

    if (siteSettings?.autoApproveArtworks === false && !isExempt) {
      artworkStatus = 'Pending';
    } else if (data.status) {
      artworkStatus = data.status;
    }

    const artwork = await prisma.artwork.create({
      data: {
        title: data.title,
        slug: slug,
        description: data.description || '',
        imageUrl: data.imageUrl,
        imageUrls: Array.isArray(data.imageUrls) && data.imageUrls.length > 0 ? data.imageUrls : [data.imageUrl],
        downloadUrl: data.downloadUrl,
        category: data.category,
        region: data.region,
        format: data.format || 'Hanya gambar',
        tags: Array.isArray(data.tags) ? data.tags : [],
        authorId: authorId,
        status: artworkStatus,
        ...(data.createdAt ? { createdAt: new Date(data.createdAt) } : {}),
      },
      include: { author: true }
    });
    revalidatePath('/explore');
    revalidatePath('/');
    return { success: true, artwork };
  } catch (error) {
    console.error('Error adding artwork:', error);
    return { success: false, error: 'Failed to add artwork' };
  }
}

export async function updateArtwork(id: string, data: any) {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'settings' } });
    if (settings?.forbiddenWords) {
      if (data.title) {
        const badTitle = containsForbiddenWords(data.title, settings.forbiddenWords);
        if (badTitle) {
          return { success: false, error: `Judul karya mengandung kata yang dilarang/tidak diizinkan ("${badTitle}")` };
        }
      }
      if (data.description) {
        const badDesc = containsForbiddenWords(data.description, settings.forbiddenWords);
        if (badDesc) {
          return { success: false, error: `Deskripsi karya mengandung kata yang dilarang/tidak diizinkan ("${badDesc}")` };
        }
      }
    }

    const updateData: any = { ...data };
    if (data.title) {
      updateData.slug = await generateUniqueArtworkSlug(data.title, id);
    }
    if (data.createdAt) {
      updateData.createdAt = new Date(data.createdAt);
    }
    if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
      updateData.imageUrls = data.imageUrls;
      updateData.imageUrl = data.imageUrl || data.imageUrls[0];
    } else if (data.imageUrl) {
      updateData.imageUrl = data.imageUrl;
      if (!updateData.imageUrls || updateData.imageUrls.length === 0) {
        updateData.imageUrls = [data.imageUrl];
      }
    }
    if (data.isFeatured !== undefined) {
      updateData.isFeatured = Boolean(data.isFeatured);
      if (updateData.isFeatured) {
        await prisma.artwork.updateMany({
          where: { isFeatured: true, id: { not: id } },
          data: { isFeatured: false },
        }).catch(() => {});
      }
    }
    delete updateData.author;
    delete updateData.comments;
    delete updateData.likedUserIds;
    delete updateData.likes;
    delete updateData.id;

    const artwork = await prisma.artwork.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (artwork.slug) {
      revalidatePath(`/artwork/${artwork.slug}`);
    }
    revalidatePath(`/artwork/${id}`);
    revalidatePath('/explore');
    revalidatePath('/');
    return { success: true, artwork };
  } catch (error) {
    console.error('Error updating artwork:', error);
    return { success: false, error: 'Failed to update artwork' };
  }
}

export async function deleteArtwork(id: string) {
  try {
    await prisma.artwork.delete({
      where: { id },
    });
    revalidatePath('/explore');
    return { success: true };
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return { success: false, error: 'Failed to delete artwork' };
  }
}

// Interactivity Actions
export async function toggleLikeArtwork(artworkId: string, userId: string) {
  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId,
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({ where: { id: existingLike.id } });
      await prisma.artwork.update({
        where: { id: artworkId },
        data: { likesCount: { decrement: 1 } },
      });
      return { success: true, liked: false };
    } else {
      // Like
      await prisma.like.create({
        data: { userId, artworkId },
      });
      await prisma.artwork.update({
        where: { id: artworkId },
        data: { likesCount: { increment: 1 } },
      });
      
      // Add notification to artwork author
      const artwork = await prisma.artwork.findUnique({ where: { id: artworkId }, select: { authorId: true, title: true } });
      const liker = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      if (artwork && liker && artwork.authorId !== userId) {
        await createNotification({
          userId: artwork.authorId,
          type: 'like',
          title: 'Karya Anda disukai',
          description: `${liker.name} menyukai karya "${artwork.title}".`,
          iconColor: 'text-pink-500',
          bgColor: 'bg-pink-50',
        });
      }
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, error: 'Failed to toggle like' };
  }
}

export async function addCommentToArtworkDB(artworkId: string, userId: string, content: string) {
  try {
    // Anti-spam Rate Limiting: Max 10 comments per minute per user
    const rateCheck = checkRateLimit(`comment:${userId}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      const secondsLeft = Math.ceil(rateCheck.resetInMs / 1000);
      return {
        success: false,
        error: `Batas komentar tercapai (Maksimal 10 komentar per menit). Silakan tunggu ${secondsLeft} detik lagi.`
      };
    }

    const settings = await prisma.siteSettings.findUnique({ where: { id: 'settings' } });
    
    // Hyperlink / URL Check
    if (settings && (settings as any).allowCommentLinks === false && containsLink(content)) {
      return { success: false, error: 'Komentar mengandung tautan link/URL yang dilarang' };
    }

    const activeForbiddenWords = settings?.forbiddenWords || 'judi, slot, gacor, bokep, porno, sara, rasis, penipu';
    const badWord = containsForbiddenWords(content, activeForbiddenWords);
    if (badWord) {
      return { success: false, error: `Komentar mengandung kata yang dilarang ("${badWord}")` };
    }

    const comment = await prisma.comment.create({
      data: { content, artworkId, userId },
      include: { user: true },
    });
    const artwork = await prisma.artwork.update({
      where: { id: artworkId },
      data: { commentsCount: { increment: 1 } },
      select: { authorId: true, title: true }
    });

    if (artwork.authorId !== userId) {
      await createNotification({
        userId: artwork.authorId,
        type: 'comment',
        title: 'Komentar baru pada karya Anda',
        description: `${comment.user.name} mengomentari: "${content}" pada karya "${artwork.title}".`,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
      });
    }

    revalidatePath(`/artwork/${artworkId}`);
    return { success: true, comment };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: 'Failed to add comment' };
  }
}

export async function editCommentDB(commentId: string, newContent: string) {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'settings' } });
    if (settings && (settings as any).allowCommentLinks === false && containsLink(newContent)) {
      return { success: false, error: 'Komentar mengandung tautan link/URL yang dilarang' };
    }
    const activeForbiddenWords = settings?.forbiddenWords || 'judi, slot, gacor, bokep, porno, sara, rasis, penipu';
    const badWord = containsForbiddenWords(newContent, activeForbiddenWords);
    if (badWord) {
      return { success: false, error: `Komentar mengandung kata yang dilarang ("${badWord}")` };
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: newContent, isEdited: true },
    });
    revalidatePath(`/artwork/${comment.artworkId}`);
    return { success: true, comment };
  } catch (error) {
    console.error('Error editing comment:', error);
    return { success: false, error: 'Failed to edit comment' };
  }
}

export async function deleteCommentDB(commentId: string) {
  try {
    const comment = await prisma.comment.delete({
      where: { id: commentId },
    });
    await prisma.artwork.update({
      where: { id: comment.artworkId },
      data: { commentsCount: { decrement: 1 } },
    });
    revalidatePath(`/artwork/${comment.artworkId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
}

export async function incrementArtworkDownloadDB(id: string) {
  try {
    await prisma.artwork.update({
      where: { id },
      data: { downloadsCount: { increment: 1 } },
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing artwork download:', error);
    return { success: false, error: 'Failed to increment download count' };
  }
}

export async function deleteAllArtworksDB() {
  try {
    await requireAdminSession();
    await prisma.artwork.deleteMany({});
    revalidatePath('/explore');
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting all artworks:', error);
    return { success: false, error: error.message || 'Failed to delete all artworks' };
  }
}
