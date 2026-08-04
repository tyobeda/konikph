import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect favicon requests to site logo or clean transparent pixel
  return NextResponse.redirect('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64', 301);
}
