'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getDpwList() {
  try {
    const dpwList = await prisma.dpwOffice.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, data: dpwList.map(d => ({ ...d, createdAt: d.createdAt?.toISOString() || new Date().toISOString(), updatedAt: d.updatedAt?.toISOString() || new Date().toISOString() })) };
  } catch (error) {
    console.error('Error fetching DPW list:', error);
    return { success: false, error: 'Failed to fetch DPW list' };
  }
}

export async function addDpw(data: any) {
  try {
    const dpw = await prisma.dpwOffice.create({
      data: {
        name: data.name,
        code: data.code,
        coordinator: data.coordinator,
        phone: data.phone,
        email: data.email,
        address: data.address,
        activeCreators: data.activeCreators || 0,
        totalArtworks: data.totalArtworks || 0,
      },
    });
    revalidatePath('/admin/dpw');
    revalidatePath('/creators');
    return { success: true, data: { ...dpw, createdAt: dpw.createdAt?.toISOString() || new Date().toISOString(), updatedAt: dpw.updatedAt?.toISOString() || new Date().toISOString() } };
  } catch (error) {
    console.error('Error adding DPW:', error);
    return { success: false, error: 'Failed to add DPW' };
  }
}

export async function updateDpw(id: string, data: any) {
  try {
    const { id: _, createdAt, updatedAt, ...updateData } = data;
    const dpw = await prisma.dpwOffice.update({
      where: { id },
      data: updateData,
    });
    revalidatePath('/admin/dpw');
    revalidatePath('/creators');
    return { success: true, data: { ...dpw, createdAt: dpw.createdAt?.toISOString() || new Date().toISOString(), updatedAt: dpw.updatedAt?.toISOString() || new Date().toISOString() } };
  } catch (error) {
    console.error('Error updating DPW:', error);
    return { success: false, error: 'Failed to update DPW' };
  }
}

export async function deleteDpw(id: string) {
  try {
    await prisma.dpwOffice.delete({
      where: { id },
    });
    revalidatePath('/admin/dpw');
    revalidatePath('/creators');
    return { success: true };
  } catch (error) {
    console.error('Error deleting DPW:', error);
    return { success: false, error: 'Failed to delete DPW' };
  }
}
