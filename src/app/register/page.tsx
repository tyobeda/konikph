import { AuthCard } from '@/components/AuthCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Akun Baru - PKSart Official',
  description: 'Daftar akun desainer resmi PKSart.',
};

export default function RegisterPage() {
  return <AuthCard defaultTab="register" />;
}
