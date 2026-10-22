'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const INITIAL_BOARD_MEMBERS = [
  {
    name: 'Erwin Agustinus, ST',
    role: 'Ketua Umum',
    hierarchy: 1,
    department: 'Pimpinan Utama',
    orderIndex: 1,
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Jaya Saputra, S. Pd, Gr',
    role: 'Wakil Ketua Umum I (Bid. Organisasi & Kerjasama)',
    hierarchy: 2,
    department: 'Pimpinan Utama',
    orderIndex: 2,
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Redo Terisdo, S. Pd, Gr',
    role: 'Wakil Ketua Umum II (Bid. Pembinaan Prestasi & Litbang)',
    hierarchy: 2,
    department: 'Pimpinan Utama',
    orderIndex: 3,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Riki Yuliansyah',
    role: 'Sekretaris Umum',
    hierarchy: 2,
    department: 'Kesekretariatan',
    orderIndex: 4,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Heriyanto',
    role: 'Wakil Sekretaris',
    hierarchy: 3,
    department: 'Kesekretariatan',
    orderIndex: 5,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Yulia Bahraini, M.Pd.I',
    role: 'Bendahara Umum',
    hierarchy: 2,
    department: 'Keuangan',
    orderIndex: 6,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Rika Permata Sari',
    role: 'Wakil Bendahara',
    hierarchy: 3,
    department: 'Keuangan',
    orderIndex: 7,
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Robi Sugara, S.Pd',
    role: 'Ketua Bidang Pembinaan Prestasi (Binpres)',
    hierarchy: 3,
    department: 'Pembinaan Prestasi',
    orderIndex: 8,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Anton Sutrisno, SH',
    role: 'Ketua Bidang Organisasi & Hubungan Antar Lembaga',
    hierarchy: 3,
    department: 'Organisasi',
    orderIndex: 9,
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Hendri Yanto, SE',
    role: 'Ketua Bidang Perencanaan Anggaran',
    hierarchy: 3,
    department: 'Perencanaan',
    orderIndex: 10,
    photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'M. Reza Pahlevi, S.Kom',
    role: 'Ketua Bidang Humas, Publikasi & Media Informasi',
    hierarchy: 3,
    department: 'Humas & IT',
    orderIndex: 11,
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Doni Iskandar, ST',
    role: 'Ketua Bidang Sarana & Prasarana Olahraga',
    hierarchy: 3,
    department: 'Sarana Prasarana',
    orderIndex: 12,
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Beni Setiawan, SH, MH',
    role: 'Ketua Bidang Advokasi, Hukum & Keolahragaan',
    hierarchy: 3,
    department: 'Hukum',
    orderIndex: 13,
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600',
  },
];

export async function getBoardMembers() {
  try {
    let members = await prisma.boardMember.findMany({
      orderBy: [{ hierarchy: 'asc' }, { orderIndex: 'asc' }],
    });

    if (members.length === 0) {
      for (const m of INITIAL_BOARD_MEMBERS) {
        await prisma.boardMember.create({ data: m });
      }
      members = await prisma.boardMember.findMany({
        orderBy: [{ hierarchy: 'asc' }, { orderIndex: 'asc' }],
      });
    }

    return {
      success: true,
      data: members.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching board members:', error);
    return { success: false, data: INITIAL_BOARD_MEMBERS };
  }
}

export async function createBoardMember(data: {
  name: string;
  role: string;
  hierarchy?: number;
  department: string;
  orderIndex?: number;
  photo?: string;
}) {
  try {
    const member = await prisma.boardMember.create({
      data: {
        name: data.name,
        role: data.role,
        hierarchy: data.hierarchy || 3,
        department: data.department,
        orderIndex: data.orderIndex || 0,
        photo: data.photo || null,
      },
    });
    revalidatePath('/profil');
    return { success: true, data: member };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
