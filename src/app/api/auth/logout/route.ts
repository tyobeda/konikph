import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/serverAuth';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true, message: 'Berhasil logout.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal logout.' }, { status: 500 });
  }
}
