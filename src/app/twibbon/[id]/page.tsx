import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import TwibbonDetailContent from './TwibbonDetailContent';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const twibbon = await prisma.twibbonFrame.findUnique({
    where: { id },
  });

  const settings = await prisma.siteSettings.findFirst();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pksart.site';

  if (!twibbon) {
    return {
      title: 'Twibbon Tidak Ditemukan | PKSart',
    };
  }

  const title = `Twibbon ${twibbon.title} - Bingkai Foto Official PKS`;
  const description = `Pasang foto Anda pada bingkai twibbon ${twibbon.title} official PKS secara online di PKSart.`;
  const rawImage = twibbon.imageUrl || (settings as any)?.ogImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop';
  const imageUrl = rawImage.startsWith('/') ? `${baseUrl}${rawImage}` : rawImage;

  return {
    title: twibbon.title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/twibbon/${twibbon.id}`,
      siteName: 'PKSart',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: twibbon.title,
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function TwibbonDetailPage() {
  return <TwibbonDetailContent />;
}
