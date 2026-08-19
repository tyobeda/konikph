import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { twibbonId, userId, resultImageBase64 } = body;

    if (!twibbonId) {
      return NextResponse.json({ success: false, error: 'Missing twibbonId' }, { status: 400 });
    }

    // Resolve real user ID from database
    let targetUserId: string | null = null;
    if (userId) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { email: userId },
          ],
        },
        select: { id: true },
      });
      targetUserId = existingUser?.id || null;
    }

    // Rate limit check (max 5/min per user)
    if (targetUserId) {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const count = await prisma.userTwibbonUsage.count({
        where: { userId: targetUserId, createdAt: { gte: oneMinuteAgo } },
      });
      if (count >= 5) {
        return NextResponse.json({
          success: false,
          rateLimited: true,
          error: 'Batas pembuatan twibbon tercapai (maks 5/menit). Tunggu sebentar.',
        });
      }
    }

    // Increment usedCount on TwibbonFrame
    const updatedTwibbon = await prisma.twibbonFrame.update({
      where: { id: twibbonId },
      data: { usedCount: { increment: 1 } },
    });

    // Save image file to disk if base64 provided
    let storedImageUrl: string | null = null;
    if (resultImageBase64 && resultImageBase64.startsWith('data:image')) {
      const isJpeg = resultImageBase64.startsWith('data:image/jpeg');
      const ext = isJpeg ? '.jpg' : '.png';
      const base64Data = resultImageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `twibbon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      storedImageUrl = `/uploads/${filename}`;
    }

    // Save usage record
    const usage = await prisma.userTwibbonUsage.create({
      data: {
        twibbonId,
        userId: targetUserId,
        resultImageUrl: storedImageUrl,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      },
    });

    return NextResponse.json({
      success: true,
      usedCount: updatedTwibbon.usedCount,
      resultImageUrl: storedImageUrl,
      usageId: usage.id,
    });
  } catch (error: any) {
    console.error('POST /api/twibbon-usage error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
