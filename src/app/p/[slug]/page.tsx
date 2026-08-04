import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import CustomPageContent from './CustomPageContent';

export default async function CustomPageRenderer({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  const page = await prisma.customPage.findFirst({
    where: {
      slug: { equals: slug, mode: 'insensitive' },
      published: true,
    },
  });

  if (!page) {
    notFound();
  }

  const pageData = {
    id: page.id,
    title: page.title,
    content: page.content,
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px]">
      <Header />
      <CustomPageContent page={pageData} />
      <Footer />
    </div>
  );
}
