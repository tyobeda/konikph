'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getArtworkReports() {
  try {
    const reports = await prisma.artworkReport.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: reports };
  } catch (error) {
    console.error('Error fetching artwork reports:', error);
    return { success: false, error: 'Failed to fetch artwork reports' };
  }
}

export async function addArtworkReport(data: any) {
  try {
    const report = await prisma.artworkReport.create({
      data: {
        artworkId: data.artworkId,
        artworkTitle: data.artworkTitle,
        artworkImageUrl: data.artworkImageUrl,
        reason: data.reason,
        status: 'Pending',
      },
    });
    revalidatePath('/admin/artworks');
    return { success: true, data: report };
  } catch (error) {
    console.error('Error adding artwork report:', error);
    return { success: false, error: 'Failed to add artwork report' };
  }
}

export async function resolveArtworkReport(id: string, status: 'Resolved' | 'Rejected') {
  try {
    const report = await prisma.artworkReport.update({
      where: { id },
      data: { status },
    });
    revalidatePath('/admin/artworks');
    return { success: true, data: report };
  } catch (error) {
    console.error('Error resolving artwork report:', error);
    return { success: false, error: 'Failed to resolve artwork report' };
  }
}
