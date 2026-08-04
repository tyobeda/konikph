'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { checkRateLimit } from '@/lib/rateLimit';

export async function getResetRequests() {
  noStore();
  try {
    const requests = await (prisma as any).resetRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return {
      success: true,
      data: requests.map((r: any) => ({
        ...r,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching reset requests:', error);
    return { success: false, error: 'Failed to fetch reset requests' };
  }
}

export async function addResetRequest(data: { name: string; email: string; phone: string }) {
  try {
    const cleanEmail = data.email.trim().toLowerCase();
    const rateCheck = checkRateLimit(`reset:${cleanEmail}`, 12, 60 * 60 * 1000);
    if (!rateCheck.success) {
      return { success: false, error: 'Terlalu banyak permohonan reset untuk akun ini. Silakan coba lagi nanti.' };
    }
    const request = await (prisma as any).resetRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: 'Pending',
      },
    });
    revalidatePath('/admin/creators');
    return {
      success: true,
      data: {
        ...request,
        createdAt: request.createdAt ? request.createdAt.toISOString() : new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error adding reset request:', error);
    return { success: false, error: 'Failed to add reset request' };
  }
}

export async function completeResetRequest(id: string) {
  try {
    const request = await (prisma as any).resetRequest.update({
      where: { id },
      data: { status: 'Selesai' },
    });
    revalidatePath('/admin/creators');
    return {
      success: true,
      data: {
        ...request,
        createdAt: request.createdAt ? request.createdAt.toISOString() : new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error completing reset request:', error);
    return { success: false, error: 'Failed to complete reset request' };
  }
}

export async function deleteResetRequest(id: string) {
  try {
    await (prisma as any).resetRequest.delete({
      where: { id },
    });
    revalidatePath('/admin/creators');
    return { success: true };
  } catch (error) {
    console.error('Error deleting reset request:', error);
    return { success: false, error: 'Failed to delete reset request' };
  }
}
