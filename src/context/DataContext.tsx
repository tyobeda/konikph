'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork, User, Comment, ResetRequest, CustomPage, ArtworkReport, BrandKit } from '@/lib/types';
import { getUsers, loginUser as dbLoginUser, registerUser as dbRegisterUser, updateUser as dbUpdateUser, deleteUser as dbDeleteUser } from '@/actions/user';
import { getArtworks, addArtwork as dbAddArtwork, updateArtwork as dbUpdateArtwork, deleteArtwork as dbDeleteArtwork, toggleLikeArtwork as dbToggleLikeArtwork, addCommentToArtworkDB, editCommentDB, deleteCommentDB } from '@/actions/artwork';
import { getUnreadNotificationCount } from '@/actions/notification';
import { getTwibbons, addTwibbon as dbAddTwibbon, updateTwibbon as dbUpdateTwibbon, deleteTwibbon as dbDeleteTwibbon } from '@/actions/twibbon';
import { getDpwList, addDpw as dbAddDpw, updateDpw as dbUpdateDpw, deleteDpw as dbDeleteDpw } from '@/actions/dpw';
import { getCustomPages, addCustomPage as dbAddPage, updateCustomPage as dbUpdatePage, deleteCustomPage as dbDeletePage } from '@/actions/page';
import { getArtworkReports, addArtworkReport as dbAddReport, resolveArtworkReport as dbResolveReport } from '@/actions/report';
import { getBrandKits, addBrandKit as dbAddBrandKit, updateBrandKit as dbUpdateBrandKit, deleteBrandKit as dbDeleteBrandKit } from '@/actions/brandkit';
import { getDBSiteSettings, updateDBSiteSettings } from '@/actions/settings';
import { INITIAL_ARTWORKS, USERS } from '@/lib/data';

export interface TwibbonFrame {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  region: string;
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
  email: string;
  address: string;
  activeCreators: number;
  totalArtworks: number;
}

export interface DataContextType {
  // Artworks
  artworks: Artwork[];
  addArtwork: (art: Omit<Artwork, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'downloadsCount' | 'stampsCount'>) => Promise<void> | void;
  updateArtwork: (id: string, updated: Partial<Artwork>) => void;
  deleteArtwork: (id: string) => void;
  toggleLikeArtwork: (id: string) => void;
  incrementDownloadCount: (id: string) => void;
  addCommentToArtwork: (id: string, content: string) => Promise<void> | void;
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
  addTwibbon: (tw: Omit<TwibbonFrame, 'id' | 'usedCount' | 'createdAt'>) => void;
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
  unreadNotificationCount: number;
  refreshUnreadNotifications: () => void;

  // Reset Requests Management
  resetRequests: ResetRequest[];
  addResetRequest: (name: string, email: string, phone: string) => void;
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
}

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
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  // 2. Users State
  const [users, setUsers] = useState<User[]>([]);

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

  // Reports State
  const [artworkReports, setArtworkReports] = useState<ArtworkReport[]>([]);

  const [twibbons, setTwibbons] = useState<TwibbonFrame[]>([]);

  const [dpwList, setDpwList] = useState<DpwOffice[]>([]);

  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);

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
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);

  // Load stored state safely after client mount
  useEffect(() => {
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

      // Fetch Site Settings from DB
      getDBSiteSettings().then(res => {
        if (res.success && res.data) {
          setSiteSettings(res.data as any);
        }
      });

      const storedResets = localStorage.getItem('pksart_reset_requests');
      if (storedResets) {
        try {
          setResetRequests(JSON.parse(storedResets));
        } catch (e) {}
      }

      // Mark mounted early so UI can render with cached/default data
      setIsMounted(true);
      setIsSettingsLoaded(true);

      // Fetch artworks FIRST independently (highest priority for homepage)
      getArtworks().then(res => {
        if (res.success && res.data) {
          setArtworks(res.data as any);
        }
      });

      // Fetch users next (needed for header/auth)
      getUsers().then(res => {
        if (res.success && res.data) {
          setUsers(res.data as any);
        }
      });

      // Fetch secondary data in parallel (lower priority, not needed for homepage)
      Promise.all([
        getTwibbons(),
        getDpwList(),
        getCustomPages(),
        getBrandKits(),
        getArtworkReports(),
      ]).then(([twibbonsRes, dpwRes, pagesRes, brandKitsRes, reportsRes]) => {
        if (twibbonsRes.success && twibbonsRes.data) {
          setTwibbons(twibbonsRes.data as any);
        }
        if (dpwRes.success && dpwRes.data) {
          setDpwList(dpwRes.data as any);
        }
        if (pagesRes.success && pagesRes.data) {
          setCustomPages(pagesRes.data as any);
        }
        if (brandKitsRes.success && brandKitsRes.data) {
          const mapped = (brandKitsRes.data as any[]).map((b: any) => ({
            ...b,
            createdAt: typeof b.createdAt === 'string' ? b.createdAt : b.createdAt.toISOString(),
          }));
          setBrandKits(mapped);
        }
        if (reportsRes.success && reportsRes.data) {
          const mapped = (reportsRes.data as any[]).map((r: any) => ({
            ...r,
            status: r.status as any,
            createdAt: typeof r.createdAt === 'string' ? r.createdAt : r.createdAt.toISOString(),
          }));
          setArtworkReports(mapped);
        }
      });
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
    localStorage.setItem('pksart_reports', JSON.stringify(artworkReports));
  }, [artworkReports, isMounted]);

  useEffect(() => {
    if (!isMounted || !isSettingsLoaded) return;
    localStorage.setItem('pksart_twibbons', JSON.stringify(twibbons));
  }, [twibbons, isMounted, isSettingsLoaded]);

  useEffect(() => {
    if (!isMounted || !isSettingsLoaded) return;
    localStorage.setItem('pksart_dpw', JSON.stringify(dpwList));
  }, [dpwList, isMounted, isSettingsLoaded]);

  useEffect(() => {
    if (!isMounted || !isSettingsLoaded) return;
    localStorage.setItem('pksart_reset_requests', JSON.stringify(resetRequests));
  }, [resetRequests, isMounted, isSettingsLoaded]);

  useEffect(() => {
    if (!isMounted || !isSettingsLoaded) return;
    localStorage.setItem('pksart_custom_pages', JSON.stringify(customPages));
  }, [customPages, isMounted, isSettingsLoaded]);

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
  const addArtwork = async (art: Omit<Artwork, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'downloadsCount' | 'stampsCount'>) => {
    const res = await dbAddArtwork(art);
    if (res && res.success && res.artwork) {
      setArtworks((prev) => [JSON.parse(JSON.stringify(res.artwork)), ...prev]);
    }
  };

  const updateArtwork = async (id: string, updated: Partial<Artwork>) => {
    const res = await dbUpdateArtwork(id, updated);
    if (res && res.success && res.artwork) {
      setArtworks((prev) => prev.map((a) => (a.id === id ? JSON.parse(JSON.stringify(res.artwork)) : a)));
    } else {
      setArtworks((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    }
  };

  const deleteArtwork = async (id: string) => {
    const res = await dbDeleteArtwork(id);
    if (res && res.success) {
      setArtworks((prev) => prev.filter((a) => a.id !== id));
      setArtworkReports(prev => prev.filter(r => r.artworkId !== id));
    }
  };

  const toggleLikeArtwork = async (id: string) => {
    const author = currentUser || SUPER_ADMIN_USER;
    const res = await dbToggleLikeArtwork(id, author.id);
    if (res && res.success) {
      setArtworks((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            return { ...a, likesCount: res.liked ? a.likesCount + 1 : Math.max(0, a.likesCount - 1) };
          }
          return a;
        })
      );
    } else {
      // optimistic fallback (not recommended but works)
      setArtworks((prev) =>
        prev.map((a) => (a.id === id ? { ...a, likesCount: a.likesCount + 1 } : a))
      );
    }
  };

  const incrementDownloadCount = (id: string) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, downloadsCount: a.downloadsCount + 1 } : a))
    );
  };

  const addCommentToArtwork = async (id: string, content: string) => {
    if (!content.trim()) return;
    const author = currentUser || SUPER_ADMIN_USER;

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

        if (typeof window !== 'undefined') {
          localStorage.setItem('pksart_artworks', JSON.stringify(nextArtworks));
        }
        return nextArtworks;
      });
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

  const addDpw = (dpw: Omit<DpwOffice, 'id' | 'activeCreators' | 'totalArtworks'>) => {
    const newDpw: DpwOffice = {
      ...dpw,
      id: `dpw-${Date.now()}`,
      activeCreators: 1,
      totalArtworks: 0,
    };
    setDpwList((prev) => [newDpw, ...prev]);
  };

  const updateDpw = async (id: string, updated: Partial<DpwOffice>) => {
    const res = await dbUpdateDpw(id, updated);
    if (res.success && res.data) {
      setDpwList(prev => prev.map(d => d.id === id ? JSON.parse(JSON.stringify(res.data)) : d).sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const deleteDpw = async (id: string) => {
    const res = await dbDeleteDpw(id);
    if (res.success) {
      setDpwList(prev => prev.filter(d => d.id !== id));
    }
  };

  const updateSiteSettings = async (settings: Partial<DataContextType['siteSettings']>) => {
    const updated = { ...siteSettings, ...settings };
    setSiteSettings(updated);
    await updateDBSiteSettings(updated);
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

  const massDeletePosts = () => {
    setArtworks([]);
  };

  const massDeleteUsers = () => {
    setUsers([]);
  };

  const addBrandKit = async (kit: Omit<BrandKit, 'id' | 'createdAt'>) => {
    const res = await dbAddBrandKit(kit);
    if (res.success && res.data) {
      setBrandKits(prev => [...prev, { ...res.data, createdAt: res.data.createdAt.toISOString() }]);
    }
  };

  const updateBrandKit = async (id: string, updated: Partial<BrandKit>) => {
    const res = await dbUpdateBrandKit(id, updated);
    if (res.success && res.data) {
      setBrandKits(prev => prev.map(k => k.id === id ? { ...res.data, createdAt: res.data.createdAt.toISOString() } : k));
    }
  };

  const deleteBrandKit = async (id: string) => {
    const res = await dbDeleteBrandKit(id);
    if (res.success) {
      setBrandKits(prev => prev.filter(k => k.id !== id));
    }
  };

  const massDeleteAll = () => {
    setArtworks([]);
    setUsers([]);
    setTwibbons([]);
    setDpwList([]);
    setCustomPages([]);
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

        customPages,
        addCustomPage,
        updateCustomPage,
        deleteCustomPage,

        siteSettings,
        updateSiteSettings,
        isMounted,
        unreadNotificationCount,
        refreshUnreadNotifications,

        resetRequests,
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
