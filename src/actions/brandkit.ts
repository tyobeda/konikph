'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';

export async function getBrandKits() {
  noStore();
  try {
    const brandKits = await prisma.brandKit.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: brandKits };
  } catch (error) {
    console.error('Error fetching brand kits:', error);
    return { success: false, error: 'Failed to fetch brand kits' };
  }
}

export async function addBrandKit(data: any) {
  try {
    const brandKit = await prisma.brandKit.create({
      data: {
        title: data.title || 'Aset Baru',
        category: data.category || 'Lainnya',
        format: data.format || '.png',
        iconType: data.iconType || 'image',
        color: data.color || 'bg-orange-50 text-[#F26522] border-orange-200',
        fileUrl: data.fileUrl || '',
        previewUrl: data.previewUrl || null,
      },
    });
    revalidatePath('/admin/brandkit');
    revalidatePath('/assets');
    return { success: true, data: brandKit };
  } catch (error) {
    console.error('Error adding brand kit:', error);
    return { success: false, error: 'Failed to add brand kit' };
  }
}

export async function updateBrandKit(id: string, data: any) {
  try {
    const brandKit = await prisma.brandKit.update({
      where: { id },
      data: {
        title: data.title,
        category: data.category,
        format: data.format,
        iconType: data.iconType,
        color: data.color,
        fileUrl: data.fileUrl,
        previewUrl: data.previewUrl ? data.previewUrl : null,
      },
    });

    revalidatePath('/admin/brandkit');
    revalidatePath('/assets');
    return { success: true, data: brandKit };
  } catch (error) {
    console.error('Error updating brand kit:', error);
    return { success: false, error: 'Failed to update brand kit' };
  }
}

export async function deleteBrandKit(id: string) {
  try {
    await prisma.brandKit.delete({
      where: { id },
    });
    revalidatePath('/admin/brandkit');
    revalidatePath('/assets');
    return { success: true };
  } catch (error) {
    console.error('Error deleting brand kit:', error);
    return { success: false, error: 'Failed to delete brand kit' };
  }
}
