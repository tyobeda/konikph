'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Only fetch the latest 50 notifications
    });
    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Failed to fetch notifications' };
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    revalidatePath('/notifikasi');
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Failed to mark as read' };
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath('/notifikasi');
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: 'Failed to mark all as read' };
  }
}

// Helper to create notifications (can be used from other server actions)
export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  description: string;
  iconColor?: string;
  bgColor?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        ...data,
      },
    });
    
    // Optional: implement logic to delete older notifications if count > 50
    const count = await prisma.notification.count({ where: { userId: data.userId } });
    if (count > 50) {
      const oldest = await prisma.notification.findMany({
        where: { userId: data.userId },
        orderBy: { createdAt: 'desc' },
        skip: 50,
      });
      
      if (oldest.length > 0) {
        await prisma.notification.deleteMany({
          where: {
            id: { in: oldest.map(n => n.id) }
          }
        });
      }
    }
    
    revalidatePath('/notifikasi');
    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}
