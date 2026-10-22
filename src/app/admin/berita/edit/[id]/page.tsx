import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsById } from '@/actions/news';
import { NewsEditor } from '@/components/admin/NewsEditor';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const res = await getNewsById(id);

  if (!res.success || !res.data) {
    return {
      title: 'Artikel Tidak Ditemukan | Admin KONI',
    };
  }

  return {
    title: `Edit: ${res.data.title} | Admin KONI Kepahiang`,
    description: `Edit artikel berita ${res.data.title}`,
  };
}

export default async function EditNewsPage({ params }: Props) {
  const { id } = await params;
  const res = await getNewsById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="w-full">
      <NewsEditor mode="edit" initialData={res.data} />
    </div>
  );
}
