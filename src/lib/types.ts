export interface User {
  id: string;
  name: string;
  email: string;
  phone: string; // WhatsApp
  address: string; // Alamat Lengkap
  avatar?: string | null;
  region: string;
  role?: string | null;
  isVerified?: boolean;
  status?: string | null;
  totalArtworks?: number;
  totalDownloads?: number;
  gender?: string;
}

export interface Artwork {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  imageUrl: string;
  imageUrls?: string[];
  downloadUrl?: string | null;
  category: string;
  region: string;
  format?: string | null;
  tags?: string[];
  likesCount: number;
  likedUserIds?: string[];
  commentsCount: number;
  downloadsCount: number;
  stampsCount?: number;
  authorId?: string | null;
  author: any; // Using any or specific Prisma relation type to bypass nested issues for now
  createdAt: string | Date;
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
  ogImageUrl?: string | null;
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


export interface BrandKit {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  category: string;
  format: string;
  iconType: string;
  color: string;
  fileUrl: string;
  previewUrl?: string | null;
  isPublic?: boolean;
  downloadsCount?: number;
  createdAt: string;
  updatedAt?: string;
}
