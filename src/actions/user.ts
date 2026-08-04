'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { createNotification } from './notification';

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
    // Basic mock login: just find a user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (user) {
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
  address: string;
  region: string;
  role?: string;
  avatar?: string;
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }

    const user = await prisma.user.create({
      data: {
        ...data,
        role: data.role || 'Kreator',
        avatar: data.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200',
      }
    });

    return { success: true, user, message: 'Pendaftaran berhasil!' };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Gagal mendaftar.' };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return { success: true, user };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: 'Gagal memperbarui user' };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, error: 'Gagal menghapus user' };
  }
}
