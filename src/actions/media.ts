'use server';

import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export interface MediaGalleryItem {
  id: string;
  url: string;
  title: string;
  source: 'upload' | 'artwork' | 'news';
  createdAt?: string;
}

export async function getMediaGalleryItems(): Promise<{
  success: boolean;
  data: MediaGalleryItem[];
  error?: string;
}> {
  try {
    const items: MediaGalleryItem[] = [];

    // 1. Scan public/uploads directory for uploaded images
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadDir)) {
      try {
        const files = fs.readdirSync(uploadDir);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (imageExtensions.includes(ext) && !file.startsWith('.')) {
            const filePath = path.join(uploadDir, file);
            let createdAt = new Date().toISOString();
            try {
              const stat = fs.statSync(filePath);
              createdAt = stat.mtime.toISOString();
            } catch (_) {}

            items.push({
              id: `upload-${file}`,
              url: `/uploads/${file}`,
              title: file,
              source: 'upload',
              createdAt,
            });
          }
        }
      } catch (err) {
        console.error('Error reading uploads folder:', err);
      }
    }

    // 2. Scan artworks from database
    try {
      const artworks = await prisma.artwork.findMany({
        select: { id: true, title: true, imageUrl: true, imageUrls: true, createdAt: true },
        take: 40,
        orderBy: { createdAt: 'desc' },
      });

      for (const art of artworks) {
        if (art.imageUrl && !items.some(i => i.url === art.imageUrl)) {
          items.push({
            id: `art-${art.id}`,
            url: art.imageUrl,
            title: art.title,
            source: 'artwork',
            createdAt: art.createdAt.toISOString(),
          });
        }
        if (Array.isArray(art.imageUrls)) {
          art.imageUrls.forEach((imgUrl, idx) => {
            if (imgUrl && !items.some(i => i.url === imgUrl)) {
              items.push({
                id: `art-${art.id}-${idx}`,
                url: imgUrl,
                title: `${art.title} (Foto ${idx + 1})`,
                source: 'artwork',
                createdAt: art.createdAt.toISOString(),
              });
            }
          });
        }
      }
    } catch (err) {
      console.error('Error fetching artwork media:', err);
    }

    // 3. Scan news images from database
    try {
      const newsArticles = await prisma.news.findMany({
        where: { imageUrl: { not: null } },
        select: { id: true, title: true, imageUrl: true, publishedAt: true },
        take: 30,
        orderBy: { publishedAt: 'desc' },
      });

      for (const n of newsArticles) {
        if (n.imageUrl && !items.some(i => i.url === n.imageUrl)) {
          items.push({
            id: `news-${n.id}`,
            url: n.imageUrl,
            title: n.title,
            source: 'news',
            createdAt: n.publishedAt.toISOString(),
          });
        }
      }
    } catch (err) {
      console.error('Error fetching news media:', err);
    }

    // Sort by latest first
    items.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return { success: true, data: items };
  } catch (error: any) {
    console.error('getMediaGalleryItems error:', error);
    return { success: false, data: [], error: error?.message || 'Gagal memuat galeri media' };
  }
}
