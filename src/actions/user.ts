'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { createNotification } from './notification';
import { checkRateLimit } from '@/lib/rateLimit';
import { requireAdminSession } from '@/lib/serverAuth';

export async function getUsers() {
  noStore();
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function loginUser(email: string, phone: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const rateCheck = checkRateLimit(`login:${cleanEmail}`, 20, 15 * 60 * 1000);
    if (!rateCheck.success) {
      const minutesLeft = Math.ceil(rateCheck.resetInMs / 60000);
      return { 
        success: false, 
        message: `Terlalu banyak percobaan login untuk akun ${cleanEmail}. Silakan coba lagi dalam ${minutesLeft} menit.` 
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    
    if (user) {
      // Check user status approval
      if (user.status === 'Pending' || user.status === 'Pending Approval') {
        return { 
          success: false, 
          message: 'Akun Anda sedang dalam proses persetujuan (Approval) oleh Admin PKSart. Silakan tunggu konfirmasi Admin.' 
        };
      }
      if (user.status === 'Suspended') {
        return { 
          success: false, 
          message: 'Akun Anda saat ini ditangguhkan. Silakan hubungi pengurus Admin PKSart.' 
        };
      }
      return { success: true, user, message: 'Login berhasil!' };
    }
    return { success: false, message: 'Email tidak ditemukan.' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Terjadi kesalahan sistem.' };
  }
}

export async function registerUser(data: {
  name: string;
  email: string;
  phone: string;
  address?: string;
  region?: string;
  role?: string;
  avatar?: string;
  gender?: string;
}) {
  try {
    const cleanEmail = data.email.trim().toLowerCase();
    const rateCheck = checkRateLimit(`register:${cleanEmail}`, 12, 60 * 60 * 1000);
    if (!rateCheck.success) {
      return { 
        success: false, 
        message: 'Batas pendaftaran tercapai untuk email ini. Silakan tunggu beberapa saat.' 
      };
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: cleanEmail,
        phone: data.phone,
        address: data.address || '',
        region: data.region || '',
        role: data.role || 'Desainer PKS',
        status: 'Pending', // Memerlukan approval admin
        avatar: data.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200',
      }
    });

    return { 
      success: true, 
      user, 
      message: 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan (Approval) dari Admin.' 
    };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Gagal mendaftar.' };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const { id: _, createdAt, updatedAt, totalArtworks, totalDownloads, ...updateData } = data;
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath('/admin/creators');
    return {
      success: true,
      user: {
        ...user,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: (user as any).updatedAt?.toISOString?.() || new Date().toISOString(),
      }
    };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: 'Gagal memperbarui user' };
  }
}

export async function deleteUser(id: string) {
  try {
    await requireAdminSession();
    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error('Delete user error:', error);
    return { success: false, error: error.message || 'Gagal menghapus user' };
  }
}

export async function deleteAllUsersDB() {
  try {
    await requireAdminSession();
    await prisma.user.deleteMany({
      where: { id: { not: 'superadmin_1' } },
    });
    revalidatePath('/admin/creators');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting all users:', error);
    return { success: false, error: error.message || 'Failed to delete all users' };
  }
}
