import { AuthCard } from '@/components/AuthCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk / Login - KONI Kabupaten Kepahiang',
  description: 'Masuk ke portal resmi KONI Kabupaten Kepahiang untuk pengurus dan kontributor.',
};

export default function LoginPage() {
  return <AuthCard defaultTab="login" />;
}
