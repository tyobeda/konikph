'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork, User, Comment, ResetRequest } from '@/lib/types';
import { INITIAL_ARTWORKS, USERS } from '@/lib/data';

export interface TwibbonFrame {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  region: string;
  author: {
    name: string;
    avatar: string;
  };
  usedCount: number;
  status: 'Disetujui' | 'Pending' | 'Ditolak';
  isFeatured: boolean;
  createdAt: string;
}

export interface DpwOffice {
  id: string;
  name: string;
  code: string;
  coordinator: string;
  phone: string;
  email: string;
  address: string;
  activeCreators: number;
  totalArtworks: number;
}

export interface DataContextType {
  // Artworks
  artworks: Artwork[];
  addArtwork: (art: Omit<Artwork, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'downloadsCount' | 'stampsCount'>) => void;
  updateArtwork: (id: string, updated: Partial<Artwork>) => void;
  deleteArtwork: (id: string) => void;
  toggleLikeArtwork: (id: string) => void;
  incrementDownloadCount: (id: string) => void;
  addCommentToArtwork: (id: string, content: string) => void;
  editCommentInArtwork: (artworkId: string, commentId: string, newContent: string) => void;
  deleteCommentFromArtwork: (artworkId: string, commentId: string) => void;

  // Users / Creators
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loginUser: (emailInput: string, passwordInput: string) => { success: boolean; message: string; user?: User };
  logoutUser: () => void;
  updateUser: (id: string, updated: Partial<User>) => void;
  toggleVerifyUser: (id: string) => void;
  toggleSuspendUser: (id: string) => void;
  deleteUser: (id: string) => void;
  registerUser: (user: Omit<User, 'id'>) => void;

  // Twibbons
  twibbons: TwibbonFrame[];
  addTwibbon: (tw: Omit<TwibbonFrame, 'id' | 'usedCount' | 'createdAt'>) => void;
  updateTwibbon: (id: string, updated: Partial<TwibbonFrame>) => void;
  deleteTwibbon: (id: string) => void;

  // DPW
  dpwList: DpwOffice[];
  addDpw: (dpw: Omit<DpwOffice, 'id' | 'activeCreators' | 'totalArtworks'>) => void;
  updateDpw: (id: string, updated: Partial<DpwOffice>) => void;
  deleteDpw: (id: string) => void;

  // Site Settings
  siteSettings: {
    siteName: string;
    siteDescription: string;
    logoUrl: string;       // Logo Utama (Homepage)
    logoAdminUrl: string;  // Logo Warna Terang (Admin Panel)
    logoFooterUrl: string; // Logo Putih (Footer)
    faviconUrl: string;
    // CTA Banner Settings
    ctaTitle?: string;
    ctaDescription?: string;
    ctaButtonText?: string;
    ctaButtonLink?: string;
    ctaLogoUrl?: string;
    ctaImageUrl?: string;
    ctaBgUrl?: string;
    ctaEnabled?: boolean;
    ctaLinks?: { label: string; url: string }[];
    ctaSocialText?: string;
    ctaSocialUrl?: string;
  };
  updateSiteSettings: (settings: Partial<DataContextType['siteSettings']>) => void;

  // Hydration Mount State Indicator
  isMounted: boolean;

  // Reset Requests Management
  resetRequests: ResetRequest[];
  addResetRequest: (name: string, email: string, phone: string) => void;
  completeResetRequest: (id: string) => void;
  deleteResetRequest: (id: string) => void;

  // Mass Reset / Delete
  massDeletePosts: () => void;
  massDeleteUsers: () => void;
  massDeleteAll: () => void;
}

const INITIAL_TWIBBONS_LIST: TwibbonFrame[] = [
  {
    id: 'tw-1',
    title: 'Twibbon Resmi Kader PKS Indonesia 2026',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    category: 'Nasional',
    region: 'DPP PKS',
    author: {
      name: USERS.ahmad_jauhari.name,
      avatar: USERS.ahmad_jauhari.avatar,
    },
    usedCount: 12840,
    status: 'Disetujui',
    isFeatured: true,
    createdAt: '2026-07-20',
  },
  {
    id: 'tw-2',
    title: 'Twibbon Milenial PKS Jabar Juara',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=400',
    category: 'Milenial',
    region: 'DPW Jabar',
    author: {
      name: USERS.roni_sumut.name,
      avatar: USERS.roni_sumut.avatar,
    },
    usedCount: 8520,
    status: 'Disetujui',
    isFeatured: true,
    createdAt: '2026-07-18',
  },
  {
    id: 'tw-3',
    title: 'Twibbon Pemuda & Mahasiswa PKS DIY',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=400',
    category: 'Pemuda',
    region: 'DPW DIY',
    author: {
      name: USERS.lita_diy.name,
      avatar: USERS.lita_diy.avatar,
    },
    usedCount: 6310,
    status: 'Disetujui',
    isFeatured: false,
    createdAt: '2026-07-15',
  },
];

const INITIAL_DPW_DEFAULT: DpwOffice[] = [
  {
    id: 'dpw-1',
    name: 'DPW PKS Jawa Barat',
    code: 'DPW-JABAR',
    coordinator: 'Dr. H. Haru Suandharu, S.Si., M.Si.',
    phone: '0812-3456-7890',
    email: 'sekretariat@jabar.pks.id',
    address: 'Jl. Soekarno Hatta No. 538, Bandung, Jawa Barat',
    activeCreators: 48,
    totalArtworks: 312,
  },
  {
    id: 'dpw-2',
    name: 'DPW PKS DKI Jakarta',
    code: 'DPW-DKI',
    coordinator: 'Drs. H. Khoirudin, M.Si.',
    phone: '0813-9876-5432',
    email: 'humas@dki.pks.id',
    address: 'Jl. Letjend TB Simatupang No. 82, Pasar Minggu, Jakarta Selatan',
    activeCreators: 62,
    totalArtworks: 420,
  },
  {
    id: 'dpw-3',
    name: 'DPW PKS D.I. Yogyakarta',
    code: 'DPW-DIY',
    coordinator: 'M. Syafi\'i, S.T.',
    phone: '0857-1122-3344',
    email: 'diy@pks.id',
    address: 'Jl. Gambiran No. 45, Umbulharjo, Yogyakarta',
    activeCreators: 24,
    totalArtworks: 185,
  },
];

export const SUPER_ADMIN_USER: User = {
  id: 'superadmin_1',
  name: 'Super Admin PKSart',
  email: 'admin@pks.art',
  phone: '081199887766',
  address: 'DPP PKS Official, Jakarta Selatan',
  region: 'DPP PKS Official',
  avatar: '/img/877859417715829.jpg',
  role: 'Super Admin',
  isVerified: true,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Artworks State
  const [artworks, setArtworks] = useState<Artwork[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pksart_artworks');
      if (stored && !stored.includes('unsplash.com')) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return INITIAL_ARTWORKS.map((art, idx) => ({
      ...art,
      status: (idx % 3 === 0 ? 'Disetujui' : idx % 3 === 1 ? 'Disetujui' : 'Pending') as any,
      isFeatured: idx === 0 || idx === 2,
      comments: [
        {
          id: 'c1',
          content: 'Desainnya sangat menarik dan mudah diedit. Sukses selalu!',
          author: USERS.lita_diy,
          createdAt: '2 jam lalu',
        },
        {
          id: 'c2',
          content: 'Izin unduh untuk publikasi DPD daerah ya kang. Terima kasih!',
          author: USERS.roni_sumut,
          createdAt: '5 jam lalu',
        },
      ]
    }));
  });

  // 2. Users State
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pksart_users');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return [
      { ...USERS.ahmad_jauhari, isVerified: true, status: 'Active' },
      { ...USERS.lita_diy, isVerified: true, status: 'Active' },
      { ...USERS.roni_sumut, isVerified: false, status: 'Active' },
      { ...USERS.roni_diy, isVerified: false, status: 'Active' },
      { ...USERS.ahmasinan, isVerified: true, status: 'Active' },
    ] as any;
  });


  // Current Logged In User State (Nullable, Default to SUPER_ADMIN_USER if none stored)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pksart_current_user');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return SUPER_ADMIN_USER;
  });

  // 3. Twibbons State
  const [twibbons, setTwibbons] = useState<TwibbonFrame[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pksart_twibbons');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return INITIAL_TWIBBONS_LIST;
  });

  // 4. DPW State
  const [dpwList, setDpwList] = useState<DpwOffice[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pksart_dpw');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return INITIAL_DPW_DEFAULT;
  });

  // 5. Site Settings State
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'PKSart - Galeri Desain & Foto PKS Official',
    siteDescription: 'Platform galeri poster, spanduk, social media kit, dan aset desain resmi PKS.',
    logoUrl: '/favicon.ico',
    logoAdminUrl: '/favicon.ico',
    logoFooterUrl: '/favicon.ico',
    faviconUrl: '/favicon.ico',
    // CTA Banner Defaults
    ctaTitle: 'Ayo Gabung Jadi Kreator PKSart!',
    ctaDescription: 'Seluruh produk desain dan infografis yang tersaji di web ini adalah OFFICIAL milik PKSART.\nPKSART tidak bertanggungjawab atas penyalahgunaan elemen desain untuk kepentingan tertentu.\nSemua grafis yang tersebar di internet dan tidak tersaji di web ini adalah TIDAK OFFICIAL.',
    ctaButtonText: 'Daftar Sekarang',
    ctaButtonLink: '/register',
    ctaLogoUrl: '',
    ctaImageUrl: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22white%22 fill-opacity=%220.15%22/><path d=%22M35 30H65V70H35V30Z%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22/><path d=%22M35 55L48 45L58 52L65 47%22 stroke=%22white%22 stroke-width=%223%22 fill=%22none%22/><circle cx=%2242%22 cy=%2242%22 r=%223%22 fill=%22white%22/></svg>',
    ctaBgUrl: '',
    ctaEnabled: true,
    ctaLinks: [
      { label: 'Beranda', url: '/' },
      { label: 'Tentang PKSART', url: '#' },
      { label: 'PKS Bicara', url: '#' },
      { label: 'Khidmat PKS', url: '#' },
      { label: 'Galeri PKSART', url: '#' },
      { label: 'Jejaring', url: '#' },
      { label: 'Gabung', url: '/register' },
      { label: 'Download', url: '#' },
      { label: 'Login/Upload', url: '/login' }
    ],
    ctaSocialText: 'Follow @pksart',
    ctaSocialUrl: '#'
  });

  const [isMounted, setIsMounted] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);

  // Load stored state safely after client mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('pksart_current_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.avatar) {
            setCurrentUser(parsed);
          }
        } catch (e) {}
      }

      const storedUsers = localStorage.getItem('pksart_users');
      if (storedUsers) {
        try {
          const parsed = JSON.parse(storedUsers);
          if (parsed && parsed.length > 0) {
            setUsers(parsed);
          }
        } catch (e) {}
      }

      const storedArtworks = localStorage.getItem('pksart_artworks');
      if (storedArtworks) {
        try {
          const parsed = JSON.parse(storedArtworks);
          if (parsed && parsed.length > 0) {
            setArtworks(parsed);
          }
        } catch (e) {}
      }

      const storedSettings = localStorage.getItem('pksart_settings');
      if (storedSettings) {
        try {
          const parsed = JSON.parse(storedSettings);
          if (parsed && parsed.siteName) {
            setSiteSettings(parsed);
          }
        } catch (e) {}
      }

      const storedResets = localStorage.getItem('pksart_reset_requests');
      if (storedResets) {
        try {
          setResetRequests(JSON.parse(storedResets));
        } catch (e) {}
      }
      setIsSettingsLoaded(true);
    }
  }, []);

  // LocalStorage Persist Synchronization (Guarded by isMounted & isSettingsLoaded)
  useEffect(() => {
    if (!isMounted || !isSettingsLoaded) return;
    localStorage.setItem('pksart_settings', JSON.stringify(siteSettings));

    // Dynamic head update
    if (typeof window !== 'undefined') {
      if (siteSettings.siteName) {
        document.title = siteSettings.siteName;
      }
      if (siteSettings.faviconUrl) {
        // Clear all previous favicon nodes to avoid duplicates/overrides
        const existingLinks = document.querySelectorAll("link[rel*='icon']");
        existingLinks.forEach((el) => el.parentNode?.removeChild(el));

        // Create a single clean link element
        const link = document.createElement('link');
        link.rel = 'icon';
        
        const isDataUri = siteSettings.faviconUrl.startsWith('data:');
        link.type = siteSettings.faviconUrl.startsWith('data:image/svg') 
          ? 'image/svg+xml' 
          : isDataUri 
          ? 'image/png' 
          : 'image/x-icon';

        // ONLY append query parameters to normal URLs, not data URIs
        link.href = isDataUri 
          ? siteSettings.faviconUrl 
          : `${siteSettings.faviconUrl}?v=${Date.now()}`;
          
        document.head.appendChild(link);
      }
    }
  }, [siteSettings, isMounted, isSettingsLoaded]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pksart_artworks', JSON.stringify(artworks));
  }, [artworks, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pksart_users', JSON.stringify(users));
  }, [users, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    if (currentUser) {
      localStorage.setItem('pksart_current_user', JSON.stringify(currentUser));
    }
  }, [currentUser, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pksart_twibbons', JSON.stringify(twibbons));
  }, [twibbons, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pksart_dpw', JSON.stringify(dpwList));
  }, [dpwList, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pksart_reset_requests', JSON.stringify(resetRequests));
  }, [resetRequests, isMounted]);

  const addResetRequest = (name: string, email: string, phone: string) => {
    const newReq: ResetRequest = {
      id: 'req-' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setResetRequests((prev) => [newReq, ...prev]);
  };

  const completeResetRequest = (id: string) => {
    setResetRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'Completed' } : req))
    );
  };

  const deleteResetRequest = (id: string) => {
    setResetRequests((prev) => prev.filter((req) => req.id !== id));
  };

  // Actions
  const addArtwork = (art: Omit<Artwork, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'downloadsCount' | 'stampsCount'>) => {
    const newArt: Artwork = {
      ...art,
      id: `art-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      likesCount: 0,
      commentsCount: 0,
      downloadsCount: 0,
      stampsCount: 0,
      status: 'Disetujui',
    } as any;
    setArtworks((prev) => [newArt, ...prev]);
  };

  const updateArtwork = (id: string, updated: Partial<Artwork>) => {
    setArtworks((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  };

  const deleteArtwork = (id: string) => {
    setArtworks((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleLikeArtwork = (id: string) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, likesCount: a.likesCount + 1 } : a))
    );
  };

  const incrementDownloadCount = (id: string) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, downloadsCount: a.downloadsCount + 1 } : a))
    );
  };

  const addCommentToArtwork = (id: string, content: string) => {
    if (!content.trim()) return;
    const author = currentUser || SUPER_ADMIN_USER;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      content: content.trim(),
      author: { ...author },
      createdAt: 'Baru saja',
      timestampMs: Date.now(),
      isEdited: false,
    };

    setArtworks((prev) => {
      const nextArtworks = prev.map((a) => {
        if (a.id === id) {
          const existing = a.comments || [];
          return {
            ...a,
            commentsCount: (a.commentsCount || 0) + 1,
            comments: [newComment, ...existing],
          };
        }
        return a;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('pksart_artworks', JSON.stringify(nextArtworks));
      }
      return nextArtworks;
    });
  };

  const editCommentInArtwork = (artworkId: string, commentId: string, newContent: string) => {
    if (!newContent.trim()) return;
    setArtworks((prev) => {
      const nextArtworks = prev.map((a) => {
        if (a.id === artworkId && a.comments) {
          const updatedComments = a.comments.map((c) =>
            c.id === commentId ? { ...c, content: newContent.trim(), isEdited: true } : c
          );
          return { ...a, comments: updatedComments };
        }
        return a;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('pksart_artworks', JSON.stringify(nextArtworks));
      }
      return nextArtworks;
    });
  };

  const deleteCommentFromArtwork = (artworkId: string, commentId: string) => {
    setArtworks((prev) => {
      const nextArtworks = prev.map((a) => {
        if (a.id === artworkId && a.comments) {
          const filtered = a.comments.filter((c) => c.id !== commentId);
          return {
            ...a,
            commentsCount: Math.max(0, (a.commentsCount || 1) - 1),
            comments: filtered,
          };
        }
        return a;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('pksart_artworks', JSON.stringify(nextArtworks));
      }
      return nextArtworks;
    });
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    setUsers((prev) => {
      const nextUsers = prev.map((u) => (u.id === id ? { ...u, ...updated } : u));
      if (typeof window !== 'undefined') {
        localStorage.setItem('pksart_users', JSON.stringify(nextUsers));
      }
      return nextUsers;
    });

    if (currentUser?.id === id) {
      setCurrentUser((prev) => {
        const nextUser = prev ? ({ ...prev, ...updated } as User) : null;
        if (typeof window !== 'undefined' && nextUser) {
          localStorage.setItem('pksart_current_user', JSON.stringify(nextUser));
        }
        return nextUser;
      });
    }
  };

  const toggleVerifyUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isVerified: !(u as any).isVerified } : u))
    );
  };

  const toggleSuspendUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: (u as any).status === 'Suspended' ? 'Active' : 'Suspended' }
          : u
      )
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const loginUser = (emailInput: string, passwordInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    
    // Check Super Admin credentials
    if (
      (cleanEmail === 'admin@pks.art' || cleanEmail === 'admin') &&
      (passwordInput === 'admin123' || passwordInput === 'pksart2026')
    ) {
      setCurrentUser(SUPER_ADMIN_USER);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pksart_current_user', JSON.stringify(SUPER_ADMIN_USER));
      }
      return { success: true, message: 'Selamat datang Super Admin PKSart!', user: SUPER_ADMIN_USER };
    }

    // Check registered users in users list
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail || u.id === cleanEmail);
    if (found) {
      if (found.status === 'Pending') {
        return { success: false, message: 'Akun Anda sedang ditinjau dan menunggu persetujuan dari Administrator PKSart.' };
      }
      if (found.status === 'Suspended') {
        return { success: false, message: 'Akun Anda dinonaktifkan/ditangguhkan oleh Administrator.' };
      }
      setCurrentUser(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pksart_current_user', JSON.stringify(found));
      }
      return { success: true, message: `Selamat datang kembali, ${found.name}!`, user: found };
    }

    // Auto-create demo user for login testing
    const demoUser: User = {
      id: `user_${Date.now()}`,
      name: cleanEmail.split('@')[0] || 'Kreator PKS',
      email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@pks.art`,
      phone: '081234567890',
      address: 'DKI Jakarta',
      region: 'DKI Jakarta',
      avatar: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23E5E7EB%22/><path d=%22M50 50C41.7157 50 35 43.2843 35 35C35 26.7157 41.7157 20 50 20C58.2843 20 65 26.7157 65 35C65 43.2843 58.2843 50 50 50ZM50 55C66.5685 55 80 68.4315 80 85H20C20 68.4315 33.4315 55 50 55Z%22 fill=%22%239CA3AF%22/></svg>',
      role: 'Kreator',
      status: 'Active',
    };
    setCurrentUser(demoUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pksart_current_user', JSON.stringify(demoUser));
    }
    return { success: true, message: `Selamat datang, ${demoUser.name}!`, user: demoUser };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pksart_current_user');
    }
  };

  const registerUser = (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: `u-${Date.now()}`,
      avatar: user.avatar || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23E5E7EB%22/><path d=%22M50 50C41.7157 50 35 43.2843 35 35C35 26.7157 41.7157 20 50 20C58.2843 20 65 26.7157 65 35C65 43.2843 58.2843 50 50 50ZM50 55C66.5685 55 80 68.4315 80 85H20C20 68.4315 33.4315 55 50 55Z%22 fill=%22%239CA3AF%22/></svg>',
      status: 'Pending',
      isVerified: false,
      totalArtworks: 0,
      totalDownloads: 0,
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const addTwibbon = (tw: Omit<TwibbonFrame, 'id' | 'usedCount' | 'createdAt'>) => {
    const newTw: TwibbonFrame = {
      ...tw,
      id: `tw-${Date.now()}`,
      usedCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTwibbons((prev) => [newTw, ...prev]);
  };

  const updateTwibbon = (id: string, updated: Partial<TwibbonFrame>) => {
    setTwibbons((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTwibbon = (id: string) => {
    setTwibbons((prev) => prev.filter((t) => t.id !== id));
  };

  const addDpw = (dpw: Omit<DpwOffice, 'id' | 'activeCreators' | 'totalArtworks'>) => {
    const newDpw: DpwOffice = {
      ...dpw,
      id: `dpw-${Date.now()}`,
      activeCreators: 1,
      totalArtworks: 0,
    };
    setDpwList((prev) => [newDpw, ...prev]);
  };

  const updateDpw = (id: string, updated: Partial<DpwOffice>) => {
    setDpwList((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
  };

  const deleteDpw = (id: string) => {
    setDpwList((prev) => prev.filter((d) => d.id !== id));
  };

  const updateSiteSettings = (settings: Partial<DataContextType['siteSettings']>) => {
    setSiteSettings((prev) => ({ ...prev, ...settings }));
  };

  const massDeletePosts = () => {
    setArtworks([]);
  };

  const massDeleteUsers = () => {
    setUsers([]);
  };

  const massDeleteAll = () => {
    setArtworks([]);
    setUsers([]);
    setTwibbons([]);
    setDpwList([]);
  };

  return (
    <DataContext.Provider
      value={{
        artworks,
        addArtwork,
        updateArtwork,
        deleteArtwork,
        toggleLikeArtwork,
        incrementDownloadCount,
        addCommentToArtwork,
        editCommentInArtwork,
        deleteCommentFromArtwork,

        users,
        currentUser,
        setCurrentUser,
        loginUser,
        logoutUser,
        updateUser,
        toggleVerifyUser,
        toggleSuspendUser,
        deleteUser,
        registerUser,

        twibbons,
        addTwibbon,
        updateTwibbon,
        deleteTwibbon,

        dpwList,
        addDpw,
        updateDpw,
        deleteDpw,

        siteSettings,
        updateSiteSettings,
        isMounted,

        resetRequests,
        addResetRequest,
        completeResetRequest,
        deleteResetRequest,

        massDeletePosts,
        massDeleteUsers,
        massDeleteAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
