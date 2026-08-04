'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getCustomPages() {
  try {
    const pages = await prisma.customPage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: pages.map(p => ({ ...p, createdAt: p.createdAt?.toISOString() || new Date().toISOString(), updatedAt: p.updatedAt?.toISOString() || new Date().toISOString() })) };
  } catch (error) {
    console.error('Error fetching custom pages:', error);
    return { success: false, error: 'Failed to fetch custom pages' };
  }
}

export async function getCustomPageBySlug(slug: string, useRootPath?: boolean) {
  try {
    const where: any = { slug: { equals: slug, mode: 'insensitive' }, published: true };
    if (useRootPath !== undefined) {
      where.useRootPath = useRootPath;
    }
    const page = await prisma.customPage.findFirst({ where });
    if (!page) return { success: true, data: null };
    return { success: true, data: { ...page, createdAt: page.createdAt?.toISOString() || new Date().toISOString(), updatedAt: page.updatedAt?.toISOString() || new Date().toISOString() } };
  } catch (error) {
    console.error('Error fetching custom page by slug:', error);
    return { success: false, error: 'Failed to fetch page' };
  }
}

export async function addCustomPage(data: any) {
  try {
    const page = await prisma.customPage.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        published: data.published ?? true,
        useRootPath: data.useRootPath ?? false,
      },
    });
    revalidatePath('/admin/pages');
    revalidatePath('/[slug]', 'page');
    revalidatePath('/p/[slug]', 'page');
    return { success: true, data: { ...page, createdAt: page.createdAt?.toISOString() || new Date().toISOString(), updatedAt: page.updatedAt?.toISOString() || new Date().toISOString() } };
  } catch (error) {
    console.error('Error adding custom page:', error);
    return { success: false, error: 'Failed to add custom page' };
  }
}

export async function updateCustomPage(id: string, data: any) {
  try {
    const { id: _, createdAt, updatedAt, ...updateData } = data;
    const page = await prisma.customPage.update({
      where: { id },
      data: updateData,
    });
    revalidatePath('/admin/pages');
    revalidatePath('/[slug]', 'page');
    revalidatePath('/p/[slug]', 'page');
    return { success: true, data: { ...page, createdAt: page.createdAt?.toISOString() || new Date().toISOString(), updatedAt: page.updatedAt?.toISOString() || new Date().toISOString() } };
  } catch (error) {
    console.error('Error updating custom page:', error);
    return { success: false, error: 'Failed to update custom page' };
  }
}

export async function deleteCustomPage(id: string) {
  try {
    await prisma.customPage.delete({
      where: { id },
    });
    revalidatePath('/admin/pages');
    revalidatePath('/[slug]', 'page');
    revalidatePath('/p/[slug]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error deleting custom page:', error);
    return { success: false, error: 'Failed to delete custom page' };
  }
}
