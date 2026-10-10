import { AuthCard } from '@/components/AuthCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk / Daftar Akun - PKSart Official',
  description: 'Masuk atau daftar akun desainer resmi PKSart.',
};

export default function LoginPage() {
  return <AuthCard defaultTab="login" />;
}
