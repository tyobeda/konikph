import { AuthCard } from '@/components/AuthCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Akun Pengurus - KONI Kabupaten Kepahiang',
  description: 'Daftar akun pengurus cabang olahraga dan kontributor resmi KONI Kabupaten Kepahiang.',
};

export default function RegisterPage() {
  return <AuthCard defaultTab="register" />;
}
