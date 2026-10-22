import React from 'react';
import { getNewsList } from '@/actions/news';
import HomePageClient from './HomePageClient';

export const revalidate = 10; // ISR cache 10s for fast SSR and fresh updates

export default async function HomePage() {
  const newsRes = await getNewsList({ status: 'Published' });
  const initialNews = newsRes && newsRes.success && newsRes.data ? newsRes.data : [];

  return <HomePageClient initialNews={initialNews} />;
}
