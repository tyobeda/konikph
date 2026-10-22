'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { INITIAL_CABOR_KEPAHIANG } from '@/data/cabor';

export async function getDpwList() {
  try {
    let dpwList = await prisma.dpwOffice.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    // Auto-seed if database has no Cabor yet
    if (dpwList.length === 0) {
      await seedAllIndonesianDpw();
      dpwList = await prisma.dpwOffice.findMany({
        orderBy: { orderIndex: 'asc' },
      });
    }

    return { 
      success: true, 
      data: dpwList.map(d => ({
        ...d,
        lat: d.lat ?? -3.6496,
        lng: d.lng ?? 102.5768,
        createdAt: d.createdAt?.toISOString() || new Date().toISOString(), 
        updatedAt: d.updatedAt?.toISOString() || new Date().toISOString() 
      })) 
    };
  } catch (error) {
    console.error('Error fetching Cabor list:', error);
    return { success: false, error: 'Gagal mengambil data cabang olahraga' };
  }
}

export async function seedAllIndonesianDpw() {
  try {
    const existing = await prisma.dpwOffice.findMany();
    const existingCodes = new Set(existing.map(e => (e.code || '').trim().toUpperCase()).filter(Boolean));
    const existingNames = new Set(existing.map(e => (e.name || '').trim().toLowerCase()).filter(Boolean));

    let createdCount = 0;
    for (const item of INITIAL_CABOR_KEPAHIANG) {
      if (!existingCodes.has(item.code.toUpperCase()) && !existingNames.has(item.name.toLowerCase())) {
        await prisma.dpwOffice.create({
          data: {
            name: item.name,
            code: item.code,
            coordinator: item.coordinator,
            phone: item.phone,
            email: item.email,
            address: item.address,
            category: item.category,
            description: item.description,
            schedule: item.schedule,
            orderIndex: item.orderIndex,
            lat: item.lat,
            lng: item.lng,
            activeCreators: 0,
            totalArtworks: 0,
            isActive: true,
          }
        });
        createdCount++;
      }
    }

    revalidatePath('/admin/wilayah');
    revalidatePath('/cabor');
    revalidatePath('/creators');
    revalidatePath('/profile');
    revalidatePath('/register');
    return { success: true, count: createdCount };
  } catch (error) {
    console.error('Error seeding Cabor Kepahiang:', error);
    return { success: false, error: 'Gagal inisialisasi Cabang Olahraga Kepahiang' };
  }
}

export async function addDpw(data: any) {
  try {
    const lat = data.lat !== undefined && data.lat !== null && data.lat !== '' ? Number(data.lat) : -3.6496;
    const lng = data.lng !== undefined && data.lng !== null && data.lng !== '' ? Number(data.lng) : 102.5768;

    const dpw = await prisma.dpwOffice.create({
      data: {
        name: data.name,
        code: data.code,
        coordinator: data.coordinator,
        phone: data.phone,
        email: data.email || '',
        address: data.address || '',
        category: data.category || 'Umum',
        description: data.description || '',
        schedule: data.schedule || '',
        orderIndex: Number(data.orderIndex) || 0,
        lat,
        lng,
        activeCreators: data.activeCreators || 0,
        totalArtworks: data.totalArtworks || 0,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
    revalidatePath('/admin/wilayah');
    revalidatePath('/cabor');
    revalidatePath('/creators');
    revalidatePath('/profile');
    revalidatePath('/register');
    return { success: true, data: { ...dpw, createdAt: dpw.createdAt?.toISOString() || new Date().toISOString(), updatedAt: dpw.updatedAt?.toISOString() || new Date().toISOString() } };
  } catch (error) {
    console.error('Error adding Cabor:', error);
    return { success: false, error: 'Gagal menambah cabang olahraga' };
  }
}

export async function updateDpw(id: string, data: any) {
  try {
    const { id: _, createdAt, updatedAt, ...updateData } = data;
    if (updateData.lat !== undefined) {
      updateData.lat = updateData.lat !== null && updateData.lat !== '' ? Number(updateData.lat) : null;
    }
    if (updateData.lng !== undefined) {
      updateData.lng = updateData.lng !== null && updateData.lng !== '' ? Number(updateData.lng) : null;
    }
    if (updateData.orderIndex !== undefined) {
      updateData.orderIndex = Number(updateData.orderIndex) || 0;
    }
    const dpw = await prisma.dpwOffice.update({
      where: { id },
      data: updateData,
    });
    revalidatePath('/admin/wilayah');
    revalidatePath('/cabor');
    revalidatePath('/creators');
    revalidatePath('/profile');
    revalidatePath('/register');
    return { success: true, data: { ...dpw, createdAt: dpw.createdAt?.toISOString() || new Date().toISOString(), updatedAt: dpw.updatedAt?.toISOString() || new Date().toISOString() } };
  } catch (error) {
    console.error('Error updating Cabor:', error);
    return { success: false, error: 'Gagal memperbarui cabang olahraga' };
  }
}

export async function deleteDpw(id: string) {
  try {
    await prisma.dpwOffice.delete({
      where: { id },
    });
    revalidatePath('/admin/wilayah');
    revalidatePath('/cabor');
    revalidatePath('/creators');
    revalidatePath('/profile');
    revalidatePath('/register');
    return { success: true };
  } catch (error) {
    console.error('Error deleting Cabor:', error);
    return { success: false, error: 'Gagal menghapus cabang olahraga' };
  }
}

export async function getDpwOfficeByCode(code: string) {
  try {
    const item = await prisma.dpwOffice.findFirst({
      where: { code: { equals: code, mode: 'insensitive' } },
    });
    if (!item) return { success: false, error: 'Cabor tidak ditemukan' };
    return {
      success: true,
      data: {
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return { success: false, error: 'Gagal memuat cabor' };
  }
}

// Aliases for modern Cabor naming
export async function getCaborList(params?: any) {
  return getDpwList();
}
export async function getAllDpwOffices() {
  return getDpwList();
}
export async function seedAllCabor() {
  return seedAllIndonesianDpw();
}
export async function addCabor(data: any) {
  return addDpw(data);
}
export async function updateCabor(id: string, data: any) {
  return updateDpw(id, data);
}
export async function deleteCabor(id: string) {
  return deleteDpw(id);
}

