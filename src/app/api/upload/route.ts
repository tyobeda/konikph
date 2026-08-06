import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSession } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    // ── Auth check: must be logged in ────────────────────────────────────────
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'global_upload_ip';
    const rateCheck = checkRateLimit(`upload:${ip}`, 40, 10 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json({ success: false, error: 'Batas unggah berkas tercapai. Silakan coba 10 menit lagi.' }, { status: 429 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid form data' }, { status: 400 });
    }
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // 1. File Size Limit Check (Max 5MB for security)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'Ukuran berkas terlalu besar. Maksimal 5MB.' }, { status: 400 });
    }

    // 2. Extension & MIME Type Whitelist Check (SVG blocked — can embed JS)
    const ext = (path.extname(file.name) || '').toLowerCase();
    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.zip', '.pdf', '.ai', '.psd'];
    const DANGEROUS_EXTENSIONS = ['.html', '.htm', '.php', '.phtml', '.js', '.mjs', '.sh', '.bat', '.exe', '.py', '.svgz', '.svg'];

    if (DANGEROUS_EXTENSIONS.includes(ext) || (!ALLOWED_EXTENSIONS.includes(ext) && ext !== '')) {
      return NextResponse.json({ success: false, error: 'Format berkas tidak diizinkan demi keamanan.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const safeExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : '.png';
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${safeExt}`;

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL path
    const url = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
