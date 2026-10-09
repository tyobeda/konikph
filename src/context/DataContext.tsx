'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork, User, Comment, ResetRequest, CustomPage, ArtworkReport, BrandKit } from '@/lib/types';
import { getUsers, loginUser as dbLoginUser, registerUser as dbRegisterUser, updateUser as dbUpdateUser, deleteUser as dbDeleteUser, deleteAllUsersDB } from '@/actions/user';
import { getArtworks, addArtwork as dbAddArtwork, updateArtwork as dbUpdateArtwork, deleteArtwork as dbDeleteArtwork, toggleLikeArtwork as dbToggleLikeArtwork, addCommentToArtworkDB, editCommentDB, deleteCommentDB, incrementArtworkDownloadDB, deleteAllArtworksDB } from '@/actions/artwork';
import { getUnreadNotificationCount } from '@/actions/notification';
import { getTwibbons, addTwibbon as dbAddTwibbon, updateTwibbon as dbUpdateTwibbon, deleteTwibbon as dbDeleteTwibbon } from '@/actions/twibbon';
import { getDpwList, addDpw as dbAddDpw, updateDpw as dbUpdateDpw, deleteDpw as dbDeleteDpw, seedAllIndonesianDpw } from '@/actions/dpw';
import { getCustomPages, addCustomPage as dbAddPage, updateCustomPage as dbUpdatePage, deleteCustomPage as dbDeletePage } from '@/actions/page';
import { getArtworkReports, addArtworkReport as dbAddReport, resolveArtworkReport as dbResolveReport } from '@/actions/report';
import { getBrandKits, addBrandKit as dbAddBrandKit, updateBrandKit as dbUpdateBrandKit, deleteBrandKit as dbDeleteBrandKit } from '@/actions/brandkit';
import { getDBSiteSettings, updateDBSiteSettings } from '@/actions/settings';
import { getResetRequests as dbGetResetRequests, addResetRequest as dbAddResetRequest, completeResetRequest as dbCompleteResetRequest, deleteResetRequest as dbDeleteResetRequest } from '@/actions/resetRequest';
import { getClientCookie, setClientCookie, deleteClientCookie } from '@/lib/cookies';

export interface TwibbonFrame {
  id: string;
  title: string;
  slug?: string | null;
  imageUrl: string;
  imageUrls?: string[];
  category?: string;
  region?: string;
  description?: string | null;
  aspectRatio?: string | null;
  width?: number | null;
  height?: number | null;
  author: {
    name: string;
    avatar?: string | null;
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
  email?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  activeCreators: number;
  totalArtworks: number;
  isActive?: boolean;
}

export interface DataContextType {
  // Artworks
  artworks: Artwork[];
  addArtwork: (art: Omit<Artwork, 'id' | 'likesCount' | 'commentsCount' | 'downloadsCount' | 'stampsCount'> & { createdAt?: string | Date }) => Promise<void> | void;
  updateArtwork: (id: string, updated: Partial<Artwork>) => Promise<any>;
  deleteArtwork: (id: string) => void;
  toggleLikeArtwork: (id: string) => void;
  incrementDownloadCount: (id: string) => void;
  addCommentToArtwork: (id: string, content: string) => Promise<{ success: boolean; error?: string }>;
  editCommentInArtwork: (artworkId: string, commentId: string, newContent: string) => void;
  deleteCommentFromArtwork: (artworkId: string, commentId: string) => void;

  // Reports
  artworkReports: ArtworkReport[];
  addArtworkReport: (report: Omit<ArtworkReport, 'id' | 'createdAt' | 'status'>) => void;
  resolveArtworkReport: (id: string, action: 'delete_artwork' | 'reject_report') => void;

  // Users / Creators
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loginUser: (emailInput: string, passwordInput: string) => Promise<{ success: boolean; message: string; user?: User }> | { success: boolean; message: string; user?: User };
  logoutUser: () => void;
  updateUser: (id: string, updated: Partial<User>) => void;
  toggleVerifyUser: (id: string) => void;
  toggleSuspendUser: (id: string) => void;
  deleteUser: (id: string) => void;
  registerUser: (user: Omit<User, 'id'>) => Promise<any> | void;

  // Twibbons
  twibbons: TwibbonFrame[];
  addTwibbon: (tw: Omit<TwibbonFrame, 'id' | 'usedCount' | 'createdAt'>) => Promise<any> | void;
  updateTwibbon: (id: string, updated: Partial<TwibbonFrame>) => void;
  deleteTwibbon: (id: string) => void;

  // Custom Pages
  customPages: CustomPage[];
  addCustomPage: (page: Omit<CustomPage, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomPage: (id: string, updated: Partial<CustomPage>) => void;
  deleteCustomPage: (id: string) => void;

  // DPW
  dpwList: DpwOffice[];
  addDpw: (dpw: Omit<DpwOffice, 'id' | 'activeCreators' | 'totalArtworks'>) => void;
  updateDpw: (id: string, updated: Partial<DpwOffice>) => void;
  deleteDpw: (id: string) => void;
  seedDpw38: () => Promise<{ success: boolean; count?: number; error?: string }>;

  // Site Settings
  siteSettings: {
    siteName: string;
    siteDescription: string;
    logoUrl: string;       // Logo Utama (Homepage)
    logoAdminUrl: string;  // Logo Warna Terang (Admin Panel)
    logoFooterUrl: string; // Logo Putih (Footer)
    faviconUrl: string;
    ogImageUrl?: string;   // Social Share Preview Thumbnail (1200x630)
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
    ctaSocialLinks?: { platform: string; label: string; url: string }[];
    adminWhatsapp?: string;
    autoApproveArtworks?: boolean;
    allowCommentLinks?: boolean;
    forbiddenWords?: string;
    onlyAdminCanCreateTwibbon?: boolean;
    maintenanceConfig?: {
      globalEnabled: boolean;
      modules: {
        explore?: boolean;
        assets?: boolean;
        creators?: boolean;
        twibbon?: boolean;
        upload?: boolean;
        auth?: boolean;
        register?: boolean;
        pages?: boolean;
      };
      title?: string;
      description?: string;
      estimatedTime?: string;
      allowAdminBypass?: boolean;
    };
  };
  updateSiteSettings: (settings: Partial<DataContextType['siteSettings']>) => void;
  isModuleUnderMaintenance: (moduleKey?: 'explore' | 'assets' | 'creators' | 'twibbon' | 'upload' | 'auth' | 'register' | 'pages') => boolean;

  // Hydration Mount State Indicator
  isMounted: boolean;
  unreadNotificationCount: number;
  refreshUnreadNotifications: () => void;

  // Reset Requests Management
  resetRequests: ResetRequest[];
  refreshResetRequests: () => Promise<void>;
  addResetRequest: (data: { name: string; email: string; phone: string }) => Promise<any>;
  completeResetRequest: (id: string) => void;
  deleteResetRequest: (id: string) => void;

  // Mass Reset / Delete
  massDeletePosts: () => void;
  massDeleteUsers: () => void;
  massDeleteAll: () => void;
  brandKits: BrandKit[];
  addBrandKit: (kit: Omit<BrandKit, 'id' | 'createdAt'>) => void;
  updateBrandKit: (id: string, updated: Partial<BrandKit>) => void;
  deleteBrandKit: (id: string) => void;
  isSettingsLoaded: boolean;
  isPagesLoaded: boolean;
  isTwibbonsLoaded: boolean;
  isBrandKitsLoaded: boolean;
}

export const SUPER_ADMIN_USER: User = {
  id: 'superadmin_1',
  name: 'Super Admin PKSart',
  email: 'admin@pks.art',
  phone: '+6281199887766',
  address: 'DPP PKS Official, Jakarta Selatan',
  region: 'DPP PKS Official',
  avatar: '/img/877859417715829.jpg',
  role: 'Super Admin',
  isVerified: true,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ 
  children: React.ReactNode; 
  initialSettings?: any;
  initialUser?: User | null;
}> = ({ children, initialSettings, initialUser }) => {
  // 1. Artworks State
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  // 2. Users State
  const [users, setUsers] = useState<User[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (initialUser) return initialUser;
    if (typeof window !== 'undefined') {
      try {
        const cachedUser = localStorage.getItem('pksart_user_cache');
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          if (parsed && parsed.id) return parsed;
        }
      } catch (_) {}
    }
    return null;
  });

  // Reports & Reset Requests State
  const [artworkReports, setArtworkReports] = useState<ArtworkReport[]>([]);
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);

  const [twibbons, setTwibbons] = useState<TwibbonFrame[]>([]);
  const [isTwibbonsLoaded, setIsTwibbonsLoaded] = useState(false);

  const [dpwList, setDpwList] = useState<DpwOffice[]>([]);

  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [isPagesLoaded, setIsPagesLoaded] = useState(false);
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [isBrandKitsLoaded, setIsBrandKitsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadCache = (key: string, setter: (val: any) => void) => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setter(parsed);
            }
          }
        } catch (e) {}
      };
      loadCache('pksart_artworks', setArtworks);
      loadCache('pksart_users', setUsers);
      loadCache('pksart_twibbons', (val) => { setTwibbons(val); setIsTwibbonsLoaded(true); });
      loadCache('pksart_dpwlist', setDpwList);
      loadCache('pksart_custompages', (val) => { setCustomPages(val); setIsPagesLoaded(true); });
      loadCache('pksart_brandkits', (val) => { setBrandKits(val); setIsBrandKitsLoaded(true); });
    }
  }, []);

  // 5. Site Settings State — use server-injected initialSettings to prevent logo flash
  const DEFAULT_SETTINGS = {
    siteName: 'PKSart - Galeri Desain & Foto PKS Official',
    siteDescription: 'Platform galeri poster, spanduk, social media kit, dan aset desain resmi PKS.',
    logoUrl: '',
    logoAdminUrl: '',
    logoFooterUrl: '',
    faviconUrl: '/favicon.ico',
    ctaTitle: 'Ayo Gabung Jadi Desainer PKSart!',
    ctaDescription: 'Seluruh produk desain dan infografis yang tersaji di web ini adalah OFFICIAL milik PKSART.\nPKSART tidak bertanggungjawab atas penyalahgunaan elemen desain untuk kepentingan tertentu.\nSemua grafis yang tersebar di internet dan tidak tersaji di web ini adalah TIDAK OFFICIAL.',
    ctaButtonText: 'Daftar Sekarang',
    ctaButtonLink: '/register',
    ctaLogoUrl: '',
    ctaImageUrl: '',
    ctaBgUrl: '',
    ctaEnabled: true,
    ctaLinks: [
      { label: 'Beranda', url: '/' },
      { label: 'Tentang PKSART', url: '/p/profil' },
      { label: 'Galeri PKSART', url: '/explore' },
      { label: 'Jejaring', url: '/creators' },
      { label: 'Gabung', url: '/register' },
      { label: 'Download', url: '/assets' },
      { label: 'Login/Upload', url: '/login' }
    ],
    ctaSocialText: 'Follow @pksart',
    ctaSocialUrl: '#',
    allowCommentLinks: true,
    forbiddenWords: 'judi, slot, gacor, bokep, porno, sara, rasis, penipu',
    onlyAdminCanCreateTwibbon: false
  };

  const [siteSettings, setSiteSettings] = useState(() => {
    // Priority 1: Server-injected initialSettings (zero flash)
    if (initialSettings) return initialSettings;
    // Priority 2: Cookie cache (returning visitors)
    if (typeof window !== 'undefined') {
      const cached = getClientCookie('pksart_site_settings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.ctaLinks)) {
            parsed.ctaLinks = parsed.ctaLinks.filter((l: any) => l.label !== 'PKS Bicara' && l.label !== 'Khidmat PKS');
          }
          return parsed;
        } catch (e) {}
      }
    }
    // Priority 3: Hardcoded defaults
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    if (initialSettings) {
      setSiteSettings(initialSettings);
      if (typeof window !== 'undefined') {
        setClientCookie('pksart_site_settings', JSON.stringify(initialSettings), 365);
      }
    }
  }, [initialSettings]);

  const [isMounted, setIsMounted] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const refreshUnreadNotifications = async () => {
    if (currentUser?.id) {
      const res = await getUnreadNotificationCount(currentUser.id);
      if (res.success) {
        setUnreadNotificationCount(res.count);
      }
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      refreshUnreadNotifications();
    }
  }, [currentUser?.id]);

  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // Load stored state safely after client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Restore cached user session synchronously on mount to prevent top-right header UI flash
      try {
        const cachedUser = localStorage.getItem('pksart_user_cache');
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          if (parsed && parsed.id) {
            setCurrentUser(parsed);
          }
        }
      } catch (_) {}

      // ── Restore session from server (HttpOnly cookie validated server-side) ──
      fetch('/api/auth/session')
        .then(r => r.json())
        .then(data => {
          if (data.authenticated && data.user) {
            setCurrentUser(data.user as User);
            try {
              localStorage.setItem('pksart_user_cache', JSON.stringify(data.user));
            } catch (_) {}
          } else {
            setCurrentUser(null);
            try {
              localStorage.removeItem('pksart_user_cache');
            } catch (_) {}
            deleteClientCookie('pksart_current_user');
          }
        })
        .catch(() => {});

  // Fetch Site Settings from DB in background to sync
  // If initialSettings was provided from server, mark as loaded immediately
      if (initialSettings) {
        setIsSettingsLoaded(true);
        setClientCookie('pksart_site_settings', JSON.stringify(initialSettings), 365);
      }
      getDBSiteSettings().then(res => {
        if (res.success && res.data) {
          setSiteSettings(res.data as any);
          setClientCookie('pksart_site_settings', JSON.stringify(res.data), 365);
        }
        setIsSettingsLoaded(true);
      }).catch(() => {
        setIsSettingsLoaded(true);
      });

      // Mark mounted early so UI can render
      setIsMounted(true);

      // Fetch artworks FIRST independently (highest priority for homepage)
      getArtworks().then(res => {
        if (res.success && res.data) {
          setArtworks(res.data as any);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('pksart_artworks', JSON.stringify((res.data as any[]).slice(0, 50))); } catch (e) {}
          }
        }
      });

      // Fetch users next (needed for header/auth)
      getUsers().then(res => {
        if (res.success && res.data) {
          setUsers(res.data as any);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('pksart_users', JSON.stringify(res.data)); } catch (e) {}
          }
        }
      });

      // Fetch custom pages independently for instant load
      getCustomPages().then(pagesRes => {
        if (pagesRes.success && pagesRes.data) {
          setCustomPages(pagesRes.data as any);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('pksart_custompages', JSON.stringify(pagesRes.data)); } catch (e) {}
          }
        }
        setIsPagesLoaded(true);
      });

      // Fetch secondary data in parallel (lower priority, not needed for homepage)
      Promise.all([
        getTwibbons(),
        getDpwList(),
        getBrandKits(),
        getArtworkReports(),
        dbGetResetRequests(),
      ]).then(([twibbonsRes, dpwRes, brandKitsRes, reportsRes, resetsRes]) => {
        if (twibbonsRes.success && twibbonsRes.data) {
          setTwibbons(twibbonsRes.data as any);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('pksart_twibbons', JSON.stringify(twibbonsRes.data)); } catch (e) {}
          }
        }
        setIsTwibbonsLoaded(true);
        if (dpwRes.success && dpwRes.data) {
          setDpwList(dpwRes.data as any);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('pksart_dpwlist', JSON.stringify(dpwRes.data)); } catch (e) {}
          }
        }
        if (brandKitsRes.success && brandKitsRes.data) {
          const mapped = (brandKitsRes.data as any[]).map((b: any) => ({
            ...b,
            createdAt: typeof b.createdAt === 'string' ? b.createdAt : b.createdAt.toISOString(),
          }));
          setBrandKits(mapped);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('pksart_brandkits', JSON.stringify(mapped));
            } catch (e) {}
          }
        }
        setIsBrandKitsLoaded(true);
        if (reportsRes.success && reportsRes.data) {
          const mapped = (reportsRes.data as any[]).map((r: any) => ({
            ...r,
            status: r.status as any,
            createdAt: typeof r.createdAt === 'string' ? r.createdAt : r.createdAt.toISOString(),
          }));
          setArtworkReports(mapped);
        }
        if (resetsRes && resetsRes.success && resetsRes.data) {
          setResetRequests(resetsRes.data as any);
        }
      }).catch(() => {
        setIsTwibbonsLoaded(true);
        setIsBrandKitsLoaded(true);
      });
    }
  }, []);

  // Settings synchronization
  useEffect(() => {
    if (!isMounted || !isSettingsLoaded) return;

    // Dynamic head update
    if (typeof window !== 'undefined') {
      if (siteSettings.siteName) {
        document.title = siteSettings.siteName;
      }
      if (siteSettings.faviconUrl) {
        let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        
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
      }
    }
  }, [siteSettings, isMounted, isSettingsLoaded]);

  useEffect(() => {
    if (!isMounted) return;
    if (currentUser) {
      setClientCookie('pksart_current_user', JSON.stringify(currentUser), 30);
    } else {
      deleteClientCookie('pksart_current_user');
    }
  }, [currentUser, isMounted]);


  // Report Functions
  const addArtworkReport = async (report: Omit<ArtworkReport, 'id' | 'createdAt' | 'status'>) => {
    const res = await dbAddReport(report);
    if (res.success && res.data) {
      const newReport = { ...res.data, status: res.data.status as any, createdAt: res.data.createdAt.toISOString() };
      setArtworkReports(prev => [newReport, ...prev]);
    }
  };

  const resolveArtworkReport = async (id: string, action: 'delete_artwork' | 'reject_report') => {
    const statusToSet = action === 'delete_artwork' ? 'Resolved' : 'Rejected';
    const res = await dbResolveReport(id, statusToSet);
    if (res.success && res.data) {
      setArtworkReports(prev => prev.map(r => r.id === id ? { ...res.data, status: res.data.status as any, createdAt: res.data.createdAt.toISOString() } : r));
      if (action === 'delete_artwork') {
        const report = artworkReports.find(r => r.id === id);
        if (report) {
          deleteArtwork(report.artworkId);
        }
      }
    }
  };

  // Actions
  const addArtwork = async (art: Omit<Artwork, 'id' | 'likesCount' | 'commentsCount' | 'downloadsCount' | 'stampsCount'> & { createdAt?: string | Date }) => {
    // Pass authorId explicitly to the server action
    const payload = {
      ...art,
      authorId: art.author?.id || SUPER_ADMIN_USER.id
    };
    const res = await dbAddArtwork(payload);
    if (res && res.success && res.artwork) {
      // Append the nested author object for local state rendering
      const newArtwork: Artwork = {
        ...res.artwork,
        status: res.artwork.status as any,
        author: art.author || SUPER_ADMIN_USER,
        comments: []
      };
      setArtworks((prev) => [newArtwork, ...prev]);
    }
  };

  const updateArtwork = async (id: string, updated: Partial<Artwork>) => {
    const res = await dbUpdateArtwork(id, updated);
    if (res && res.success && res.artwork) {
      const serverArt = JSON.parse(JSON.stringify(res.artwork));
      setArtworks((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            return {
              ...a,
              ...serverArt,
              author: serverArt.author || a.author || SUPER_ADMIN_USER,
              comments: serverArt.comments || a.comments || [],
            };
          }
          if (updated.isFeatured === true) {
            return { ...a, isFeatured: false };
          }
          return a;
        })
      );
    } else {
      setArtworks((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            return { ...a, ...updated };
          }
          if (updated.isFeatured === true) {
            return { ...a, isFeatured: false };
          }
          return a;
        })
      );
    }
    return res;
  };

  const deleteArtwork = async (id: string) => {
    const res = await dbDeleteArtwork(id);
    if (res && res.success) {
      setArtworks((prev) => prev.filter((a) => a.id !== id));
      setArtworkReports(prev => prev.filter(r => r.artworkId !== id));
    }
  };

  const toggleLikeArtwork = async (id: string) => {
    if (!currentUser) {
      alert('Silakan login terlebih dahulu untuk menyukai karya.');
      return;
    }
    const author = currentUser;
    const res = await dbToggleLikeArtwork(id, author.id);
    if (res && res.success) {
      setArtworks((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            const currentLiked = a.likedUserIds || [];
            const newLiked = res.liked
              ? Array.from(new Set([...currentLiked, author.id]))
              : currentLiked.filter((uid) => uid !== author.id);
            return {
              ...a,
              likesCount: res.liked ? a.likesCount + 1 : Math.max(0, a.likesCount - 1),
              likedUserIds: newLiked,
            };
          }
          return a;
        })
      );
    }
  };

  const incrementDownloadCount = async (id: string) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, downloadsCount: a.downloadsCount + 1 } : a))
    );
    await incrementArtworkDownloadDB(id);
  };

  const addCommentToArtwork = async (id: string, content: string) => {
    if (!currentUser) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk memberikan komentar.' };
    }
    if (!content.trim()) return { success: false, error: 'Komentar tidak boleh kosong' };
    const author = currentUser;

    const res = await addCommentToArtworkDB(id, author.id, content.trim());
    
    if (res && res.success && res.comment) {
      const newComment = {
        id: res.comment.id,
        content: res.comment.content,
        author: res.comment.user || { ...author },
        createdAt: res.comment.createdAt.toISOString(),
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
        return nextArtworks;
      });
      return { success: true };
    } else {
      return { success: false, error: res?.error || 'Gagal mengirim komentar' };
    }
  };

  const editCommentInArtwork = async (artworkId: string, commentId: string, newContent: string) => {
    if (!newContent.trim()) return;
    const res = await editCommentDB(commentId, newContent.trim());
    if (res && res.success) {
      setArtworks((prev) => {
        return prev.map((a) => {
          if (a.id === artworkId && a.comments) {
            const updatedComments = a.comments.map((c) =>
              c.id === commentId ? { ...c, content: newContent.trim(), isEdited: true } : c
            );
            return { ...a, comments: updatedComments };
          }
          return a;
        });
      });
    }
  };

  const deleteCommentFromArtwork = async (artworkId: string, commentId: string) => {
    const res = await deleteCommentDB(commentId);
    if (res && res.success) {
      setArtworks((prev) => {
        return prev.map((a) => {
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
      });
    }
  };

  const updateUser = async (id: string, updated: Partial<User>) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...updated } : u));
      if (typeof window !== 'undefined') localStorage.setItem('pksart_users', JSON.stringify(next));
      return next;
    });

    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? ({ ...prev, ...updated } as User) : null));
    }

    const res = await dbUpdateUser(id, updated);
    if (res.success && res.user) {
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === id ? { ...u, ...res.user } : u));
        if (typeof window !== 'undefined') localStorage.setItem('pksart_users', JSON.stringify(next));
        return next;
      });
    }
  };

  const toggleVerifyUser = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (target) {
      const updatedVerified = !target.isVerified;
      await updateUser(id, { isVerified: updatedVerified });
    }
  };

  const toggleSuspendUser = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (target) {
      const nextStatus = target.status === 'Aktif' || target.status === 'Active' ? 'Ditangguhkan' : 'Aktif';
      await updateUser(id, { status: nextStatus as any });
    }
  };

  const deleteUser = async (id: string) => {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id);
      if (typeof window !== 'undefined') localStorage.setItem('pksart_users', JSON.stringify(next));
      return next;
    });
    await dbDeleteUser(id);
  };

  const loginUser = async (emailInput: string, passwordInput: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim().toLowerCase(), password: passwordInput }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user as User);
        try {
          localStorage.setItem('pksart_user_cache', JSON.stringify(data.user));
        } catch (_) {}
      }
      return { success: data.success, message: data.message, user: data.user };
    } catch (error) {
      return { success: false, message: 'Gagal menghubungi server. Periksa koneksi Anda.' };
    }
  };

  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    try {
      localStorage.removeItem('pksart_user_cache');
    } catch (_) {}
    setCurrentUser(null);
  };

  const registerUser = async (user: Omit<User, 'id'>) => {
    try {
      const res = await dbRegisterUser({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        password: (user as any).password || '',
        address: user.address || '',
        region: user.region || 'Wilayah Jawa Barat',
        role: user.role || 'Desainer PKS',
        avatar: user.avatar || '',
      });

      if (res && res.success && res.user) {
        const newUser: User = {
          ...res.user,
          status: 'Pending',
          isVerified: false,
          totalArtworks: 0,
          totalDownloads: 0,
        };
        setUsers((prev) => [newUser, ...prev]);
        return { success: true, message: res.message || 'Pendaftaran berhasil!' };
      }
      return { success: false, message: res?.message || 'Gagal mendaftar ke server.' };
    } catch (e: any) {
      console.error('Error during registerUser:', e);
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
      return { success: true, message: 'Pendaftaran berhasil!' };
    }
  };


  const addTwibbon = async (tw: Omit<TwibbonFrame, 'id' | 'usedCount' | 'createdAt'>) => {
    try {
      const payload = {
        ...tw,
        authorId: currentUser?.id || 'system-admin',
      };
      const res = await dbAddTwibbon(payload);
      if (res && res.success && res.data) {
        setTwibbons((prev) => [res.data, ...prev]);
        return { success: true };
      }
      return { success: false, message: res?.error || 'Gagal menyimpan twibbon ke server.' };
    } catch (e: any) {
      console.error('Error in addTwibbon:', e);
      const newTw: TwibbonFrame = {
        ...tw,
        id: `tw-${Date.now()}`,
        usedCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTwibbons((prev) => [newTw, ...prev]);
      return { success: true };
    }
  };

  const updateTwibbon = async (id: string, updated: Partial<TwibbonFrame>) => {
    const res = await dbUpdateTwibbon(id, updated);
    if (res.success && res.data) {
      setTwibbons(prev => prev.map(t => t.id === id ? JSON.parse(JSON.stringify(res.data)) : t));
    }
  };

  const deleteTwibbon = async (id: string) => {
    const res = await dbDeleteTwibbon(id);
    if (res.success) {
      setTwibbons(prev => prev.filter(t => t.id !== id));
    }
  };

  const addDpw = async (dpw: Omit<DpwOffice, 'id' | 'activeCreators' | 'totalArtworks'>) => {
    const tempId = `dpw-${Date.now()}`;
    const newDpw: DpwOffice = {
      ...dpw,
      id: tempId,
      activeCreators: 0,
      totalArtworks: 0,
      isActive: true,
    };
    setDpwList((prev) => [newDpw, ...prev]);
    const res = await dbAddDpw(dpw);
    if (res.success && res.data) {
      setDpwList(prev => prev.map(d => d.id === tempId ? JSON.parse(JSON.stringify(res.data)) : d));
    }
  };

  const updateDpw = async (id: string, updated: Partial<DpwOffice>) => {
    setDpwList(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    const res = await dbUpdateDpw(id, updated);
    if (res.success && res.data) {
      setDpwList(prev => prev.map(d => d.id === id ? JSON.parse(JSON.stringify(res.data)) : d));
    }
  };

  const deleteDpw = async (id: string) => {
    setDpwList(prev => prev.filter(d => d.id !== id));
    await dbDeleteDpw(id);
  };

  const seedDpw38 = async () => {
    const res = await seedAllIndonesianDpw();
    if (res.success) {
      const refreshed = await getDpwList();
      if (refreshed.success && refreshed.data) {
        setDpwList(JSON.parse(JSON.stringify(refreshed.data)));
      }
    }
    return res;
  };

  const updateSiteSettings = async (updated: Partial<DataContextType['siteSettings']>) => {
    setSiteSettings((prev: DataContextType['siteSettings']) => {
      const newSettings = { ...prev, ...updated };
      setClientCookie('pksart_site_settings', JSON.stringify(newSettings), 365);
      return newSettings;
    });

    const res = await updateDBSiteSettings(updated);
    if (res && res.success && res.data) {
      setSiteSettings(res.data as any);
      setClientCookie('pksart_site_settings', JSON.stringify(res.data), 365);
    }
  };

  const isModuleUnderMaintenance = (moduleKey?: 'explore' | 'assets' | 'creators' | 'twibbon' | 'upload' | 'auth' | 'register' | 'pages'): boolean => {
    const config = siteSettings?.maintenanceConfig;
    if (!config) return false;
    // Super Admin ALWAYS bypasses maintenance
    if (currentUser?.role === 'Super Admin') {
      return false;
    }
    if (config.globalEnabled) return true;
    if (moduleKey && config.modules && (config.modules as any)[moduleKey]) {
      return true;
    }
    return false;
  };

  const addCustomPage = async (page: Omit<CustomPage, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await dbAddPage(page);
    if (res.success && res.data) {
      setCustomPages(prev => [JSON.parse(JSON.stringify(res.data)), ...prev]);
    }
  };
  const updateCustomPage = async (id: string, updated: Partial<CustomPage>) => {
    const res = await dbUpdatePage(id, updated);
    if (res.success && res.data) {
      setCustomPages(prev => prev.map(p => p.id === id ? JSON.parse(JSON.stringify(res.data)) : p));
    }
  };

  const deleteCustomPage = async (id: string) => {
    const res = await dbDeletePage(id);
    if (res.success) {
      setCustomPages(prev => prev.filter(p => p.id !== id));
    }
  };

  const refreshResetRequests = async () => {
    const res = await dbGetResetRequests();
    if (res && res.success && res.data) {
      setResetRequests(res.data as any);
    }
  };

  const addResetRequest = async (data: { name: string; email: string; phone: string }) => {
    const tempId = 'req-' + Date.now();
    const tempReq: ResetRequest = {
      id: tempId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setResetRequests((prev) => [tempReq, ...prev]);

    const res = await dbAddResetRequest(data);
    if (res.success && res.data) {
      setResetRequests((prev) => prev.map((r) => (r.id === tempId ? (res.data as any) : r)));
    }
    return res;
  };

  const completeResetRequest = async (id: string) => {
    setResetRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Completed' as const } : r)));
    await dbCompleteResetRequest(id);
  };

  const deleteResetRequest = async (id: string) => {
    setResetRequests((prev) => prev.filter((r) => r.id !== id));
    await dbDeleteResetRequest(id);
  };

  const massDeletePosts = async () => {
    setArtworks([]);
    if (typeof window !== 'undefined') localStorage.removeItem('pksart_artworks');
    await deleteAllArtworksDB();
  };

  const massDeleteUsers = async () => {
    setUsers((prev) => prev.filter((u) => u.id === 'superadmin_1'));
    if (typeof window !== 'undefined') localStorage.removeItem('pksart_users');
    await deleteAllUsersDB();
  };

  const addBrandKit = async (kit: Omit<BrandKit, 'id' | 'createdAt'>) => {
    const tempId = 'temp-' + Date.now();
    const tempKit: BrandKit = {
      id: tempId,
      createdAt: new Date().toISOString(),
      ...kit,
    };
    setBrandKits(prev => {
      const next = [...prev, tempKit];
      if (typeof window !== 'undefined') localStorage.setItem('pksart_brandkits', JSON.stringify(next));
      return next;
    });

    const res = await dbAddBrandKit(kit);
    if (res.success && res.data) {
      const realCreatedAt = res.data.createdAt ? new Date(res.data.createdAt).toISOString() : tempKit.createdAt;
      setBrandKits(prev => {
        const next = prev.map(k => k.id === tempId ? { ...res.data, createdAt: realCreatedAt } : k);
        if (typeof window !== 'undefined') localStorage.setItem('pksart_brandkits', JSON.stringify(next));
        return next;
      });
    }
  };

  const updateBrandKit = async (id: string, updated: Partial<BrandKit>) => {
    setBrandKits(prev => {
      const next = prev.map(k => k.id === id ? { ...k, ...updated } : k);
      if (typeof window !== 'undefined') localStorage.setItem('pksart_brandkits', JSON.stringify(next));
      return next;
    });

    const res = await dbUpdateBrandKit(id, updated);
    if (res.success && res.data) {
      const realCreatedAt = res.data.createdAt ? new Date(res.data.createdAt).toISOString() : new Date().toISOString();
      setBrandKits(prev => {
        const next = prev.map(k => k.id === id ? { ...res.data, createdAt: realCreatedAt } : k);
        if (typeof window !== 'undefined') localStorage.setItem('pksart_brandkits', JSON.stringify(next));
        return next;
      });
    }
  };

  const deleteBrandKit = async (id: string) => {
    setBrandKits(prev => {
      const next = prev.filter(k => k.id !== id);
      if (typeof window !== 'undefined') localStorage.setItem('pksart_brandkits', JSON.stringify(next));
      return next;
    });
    await dbDeleteBrandKit(id);
  };

  const massDeleteAll = async () => {
    setArtworks([]);
    setUsers((prev) => prev.filter((u) => u.id === 'superadmin_1'));
    setTwibbons([]);
    setDpwList([]);
    setCustomPages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pksart_artworks');
      localStorage.removeItem('pksart_users');
      localStorage.removeItem('pksart_twibbons');
      localStorage.removeItem('pksart_dpwlist');
      localStorage.removeItem('pksart_custompages');
    }
    await deleteAllArtworksDB();
    await deleteAllUsersDB();
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

        artworkReports,
        addArtworkReport,
        resolveArtworkReport,

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
        seedDpw38,

        customPages,
        addCustomPage,
        updateCustomPage,
        deleteCustomPage,

        siteSettings,
        updateSiteSettings,
        isModuleUnderMaintenance,
        isMounted,
        isSettingsLoaded,
        isPagesLoaded,
        isTwibbonsLoaded,
        unreadNotificationCount,
        refreshUnreadNotifications,

        resetRequests,
        refreshResetRequests,
        addResetRequest,
        completeResetRequest,
        deleteResetRequest,

        massDeletePosts,
        massDeleteUsers,
        massDeleteAll,
        brandKits,
        addBrandKit,
        updateBrandKit,
        deleteBrandKit,
        isBrandKitsLoaded,
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
