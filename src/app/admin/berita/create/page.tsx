import React from 'react';
import { Metadata } from 'next';
import { NewsEditor } from '@/components/admin/NewsEditor';

export const metadata: Metadata = {
  title: 'Tulis Berita Baru | Admin KONI Kepahiang',
  description: 'Tulis dan publikasikan artikel berita baru KONI Kepahiang',
};

export default function CreateNewsPage() {
  return (
    <div className="w-full">
      <NewsEditor mode="create" />
    </div>
  );
}
