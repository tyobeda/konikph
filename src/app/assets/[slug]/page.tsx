import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBrandKitBySlugOrId, getBrandKits } from '@/actions/brandkit';
import AssetDetailClient from './AssetDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getBrandKitBySlugOrId(slug);

  if (!res.success || !res.data) {
    return {
      title: 'Aset Desain Tidak Ditemukan - PKSart',
      description: 'Berkas aset desain yang Anda cari tidak tersedia atau telah dihapus.',
    };
  }

  const kit = res.data;
  const pageTitle = `${kit.title} | Pusat Aset Desain Resmi PKS`;
  const pageDesc = kit.description || `Unduh berkas mentahan resmi ${kit.title} (${kit.format}) kategori ${kit.category} di PKSart.`;
  const ogImage = kit.previewUrl || '/pks-logo.png';

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      images: ogImage ? [{ url: ogImage }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function AssetDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [res, allRes] = await Promise.all([
    getBrandKitBySlugOrId(slug),
    getBrandKits(),
  ]);

  if (!res.success || !res.data) {
    notFound();
  }

  const brandKit = res.data;
  const relatedKits = (allRes.data || [])
    .filter((k: any) => k.id !== brandKit.id)
    .slice(0, 4);

  return (
    <AssetDetailClient 
      brandKit={brandKit} 
      relatedKits={relatedKits} 
    />
  );
}
