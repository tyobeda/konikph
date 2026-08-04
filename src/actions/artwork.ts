'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { createNotification } from './notification';

export async function getArtworks() {
  noStore();
  try {
    const artworks = await prisma.artwork.findMany({
      include: { author: true, comments: { include: { user: true }, orderBy: { createdAt: 'desc' } } },
      orderBy: [ { createdAt: 'desc' }, { id: 'asc' } ],
    });
    const mapped = artworks.map(a => ({
      ...a,
      comments: a.comments.map((c: any) => ({ ...c, author: c.user }))
    }));
    return { success: true, data: mapped };
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return { success: false, error: 'Failed to fetch artworks' };
  }
}

export async function addArtwork(data: any) {
  try {
    const artwork = await prisma.artwork.create({
      data: {
        title: data.title,
        description: data.description || '',
        imageUrl: data.imageUrl,
        downloadUrl: data.downloadUrl,
        category: data.category,
        region: data.region,
        format: data.format,
        authorId: data.authorId,
      }
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
    const artwork = await prisma.artwork.update({
      where: { id },
      data,
    });
    revalidatePath(`/artwork/${id}`);
    revalidatePath('/explore');
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
    await prisma.artwork.deleteMany({});
    revalidatePath('/explore');
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting all artworks:', error);
    return { success: false, error: 'Failed to delete all artworks' };
  }
}
