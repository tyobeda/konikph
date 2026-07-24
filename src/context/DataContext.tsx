'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork, User, Comment } from '@/lib/types';
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
    logoUrl: string;
    faviconUrl: string;
  };
  updateSiteSettings: (settings: Partial<DataContextType['siteSettings']>) => void;

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
    faviconUrl: '/favicon.ico',
  });

  // LocalStorage Persist Synchronization
  useEffect(() => {
    localStorage.setItem('pksart_artworks', JSON.stringify(artworks));
  }, [artworks]);

  useEffect(() => {
    localStorage.setItem('pksart_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pksart_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pksart_twibbons', JSON.stringify(twibbons));
  }, [twibbons]);

  useEffect(() => {
    localStorage.setItem('pksart_dpw', JSON.stringify(dpwList));
  }, [dpwList]);

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
    setArtworks((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              commentsCount: a.commentsCount + 1,
            }
          : a
      )
    );
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? ({ ...prev, ...updated } as User) : null));
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
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      role: 'Kreator',
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
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
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
