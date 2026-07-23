export interface User {
  id: string;
  name: string;
  email: string;
  phone: string; // WhatsApp
  address: string; // Alamat Lengkap
  avatar: string;
  region: string;
  role?: string;
  isVerified?: boolean;
  status?: string;
  totalArtworks?: number;
  totalDownloads?: number;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  downloadUrl?: string;
  category: string;
  region: string;
  format?: string;
  likesCount: number;
  commentsCount: number;
  downloadsCount: number;
  stampsCount?: number;
  author: User;
  createdAt: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  status?: 'Disetujui' | 'Pending' | 'Ditolak';
  isFeatured?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}
