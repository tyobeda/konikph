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
  gender?: string;
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
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  timestampMs?: number;
  isEdited?: boolean;
}

export interface ResetRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Pending' | 'Completed';
  createdAt: string;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  content: string; // JSON string of blocks
  published: boolean;
  useRootPath: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArtworkReport {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkImageUrl: string;
  reason: string;
  status: 'Pending' | 'Resolved' | 'Rejected';
  createdAt: string;
}

