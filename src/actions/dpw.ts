'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const INITIAL_38_DPW = [
  { name: 'Wilayah Aceh', code: 'DPW-ACEH', coordinator: 'Koordinator Wilayah Aceh', phone: '081200000001', email: 'dpw.aceh@pks.art', address: 'Banda Aceh' },
  { name: 'Wilayah Sumatera Utara', code: 'DPW-SUMUT', coordinator: 'Koordinator Wilayah Sumatera Utara', phone: '081200000002', email: 'dpw.sumut@pks.art', address: 'Medan' },
  { name: 'Wilayah Sumatera Barat', code: 'DPW-SUMBAR', coordinator: 'Koordinator Wilayah Sumatera Barat', phone: '081200000003', email: 'dpw.sumbar@pks.art', address: 'Padang' },
  { name: 'Wilayah Riau', code: 'DPW-RIAU', coordinator: 'Koordinator Wilayah Riau', phone: '081200000004', email: 'dpw.riau@pks.art', address: 'Pekanbaru' },
  { name: 'Wilayah Kepulauan Riau', code: 'DPW-KEPRI', coordinator: 'Koordinator Wilayah Kepri', phone: '081200000005', email: 'dpw.kepri@pks.art', address: 'Tanjungpinang' },
  { name: 'Wilayah Jambi', code: 'DPW-JAMBI', coordinator: 'Koordinator Wilayah Jambi', phone: '081200000006', email: 'dpw.jambi@pks.art', address: 'Jambi' },
  { name: 'Wilayah Bengkulu', code: 'DPW-BENGKULU', coordinator: 'Koordinator Wilayah Bengkulu', phone: '081200000007', email: 'dpw.bengkulu@pks.art', address: 'Bengkulu' },
  { name: 'Wilayah Sumatera Selatan', code: 'DPW-SUMSEL', coordinator: 'Koordinator Wilayah Sumsel', phone: '081200000008', email: 'dpw.sumsel@pks.art', address: 'Palembang' },
  { name: 'Wilayah Bangka Belitung', code: 'DPW-BABEL', coordinator: 'Koordinator Wilayah Babel', phone: '081200000009', email: 'dpw.babel@pks.art', address: 'Pangkalpinang' },
  { name: 'Wilayah Lampung', code: 'DPW-LAMPUNG', coordinator: 'Koordinator Wilayah Lampung', phone: '081200000010', email: 'dpw.lampung@pks.art', address: 'Bandar Lampung' },
  { name: 'Wilayah Banten', code: 'DPW-BANTEN', coordinator: 'Koordinator Wilayah Banten', phone: '081200000011', email: 'dpw.banten@pks.art', address: 'Serang' },
  { name: 'Wilayah DKI Jakarta', code: 'DPW-DKI', coordinator: 'Koordinator Wilayah DKI Jakarta', phone: '081200000012', email: 'dpw.dki@pks.art', address: 'Jakarta Selatan' },
  { name: 'Wilayah Jawa Barat', code: 'DPW-JABAR', coordinator: 'Koordinator Wilayah Jawa Barat', phone: '081200000013', email: 'dpw.jabar@pks.art', address: 'Bandung' },
  { name: 'Wilayah Jawa Tengah', code: 'DPW-JATENG', coordinator: 'Koordinator Wilayah Jawa Tengah', phone: '081200000014', email: 'dpw.jateng@pks.art', address: 'Semarang' },
  { name: 'Wilayah DI Yogyakarta', code: 'DPW-DIY', coordinator: 'Koordinator Wilayah DIY', phone: '081200000015', email: 'dpw.diy@pks.art', address: 'Yogyakarta' },
  { name: 'Wilayah Jawa Timur', code: 'DPW-JATIM', coordinator: 'Koordinator Wilayah Jawa Timur', phone: '081200000016', email: 'dpw.jatim@pks.art', address: 'Surabaya' },
  { name: 'Wilayah Bali', code: 'DPW-BALI', coordinator: 'Koordinator Wilayah Bali', phone: '081200000017', email: 'dpw.bali@pks.art', address: 'Denpasar' },
  { name: 'Wilayah Nusa Tenggara Barat', code: 'DPW-NTB', coordinator: 'Koordinator Wilayah NTB', phone: '081200000018', email: 'dpw.ntb@pks.art', address: 'Mataram' },
  { name: 'Wilayah Nusa Tenggara Timur', code: 'DPW-NTT', coordinator: 'Koordinator Wilayah NTT', phone: '081200000019', email: 'dpw.ntt@pks.art', address: 'Kupang' },
  { name: 'Wilayah Kalimantan Barat', code: 'DPW-KALBAR', coordinator: 'Koordinator Wilayah Kalbar', phone: '081200000020', email: 'dpw.kalbar@pks.art', address: 'Pontianak' },
  { name: 'Wilayah Kalimantan Tengah', code: 'DPW-KALTENG', coordinator: 'Koordinator Wilayah Kalteng', phone: '081200000021', email: 'dpw.kalteng@pks.art', address: 'Palangkaraya' },
  { name: 'Wilayah Kalimantan Selatan', code: 'DPW-KALSEL', coordinator: 'Koordinator Wilayah Kalsel', phone: '081200000022', email: 'dpw.kalsel@pks.art', address: 'Banjarmasin' },
  { name: 'Wilayah Kalimantan Timur', code: 'DPW-KALTIM', coordinator: 'Koordinator Wilayah Kaltim', phone: '081200000023', email: 'dpw.kaltim@pks.art', address: 'Samarinda' },
  { name: 'Wilayah Kalimantan Utara', code: 'DPW-KALTARA', coordinator: 'Koordinator Wilayah Kaltara', phone: '081200000024', email: 'dpw.kaltara@pks.art', address: 'Tanjung Selor' },
  { name: 'Wilayah Sulawesi Utara', code: 'DPW-SULUT', coordinator: 'Koordinator Wilayah Sulut', phone: '081200000025', email: 'dpw.sulut@pks.art', address: 'Manado' },
  { name: 'Wilayah Gorontalo', code: 'DPW-GORONTALO', coordinator: 'Koordinator Wilayah Gorontalo', phone: '081200000026', email: 'dpw.gorontalo@pks.art', address: 'Gorontalo' },
  { name: 'Wilayah Sulawesi Tengah', code: 'DPW-SULTENG', coordinator: 'Koordinator Wilayah Sulteng', phone: '081200000027', email: 'dpw.sulteng@pks.art', address: 'Palu' },
  { name: 'Wilayah Sulawesi Barat', code: 'DPW-SULBAR', coordinator: 'Koordinator Wilayah Sulbar', phone: '081200000028', email: 'dpw.sulbar@pks.art', address: 'Mamuju' },
  { name: 'Wilayah Sulawesi Selatan', code: 'DPW-SULSEL', coordinator: 'Koordinator Wilayah Sulsel', phone: '081200000029', email: 'dpw.sulsel@pks.art', address: 'Makassar' },
  { name: 'Wilayah Sulawesi Tenggara', code: 'DPW-SULTRA', coordinator: 'Koordinator Wilayah Sultra', phone: '081200000030', email: 'dpw.sultra@pks.art', address: 'Kendari' },
  { name: 'Wilayah Maluku', code: 'DPW-MALUKU', coordinator: 'Koordinator Wilayah Maluku', phone: '081200000031', email: 'dpw.maluku@pks.art', address: 'Ambon' },
  { name: 'Wilayah Maluku Utara', code: 'DPW-MALUT', coordinator: 'Koordinator Wilayah Malut', phone: '081200000032', email: 'dpw.malut@pks.art', address: 'Sofifi' },
  { name: 'Wilayah Papua', code: 'DPW-PAPUA', coordinator: 'Koordinator Wilayah Papua', phone: '081200000033', email: 'dpw.papua@pks.art', address: 'Jayapura' },
  { name: 'Wilayah Papua Barat', code: 'DPW-PB', coordinator: 'Koordinator Wilayah Papua Barat', phone: '081200000034', email: 'dpw.pb@pks.art', address: 'Manokwari' },
  { name: 'Wilayah Papua Selatan', code: 'DPW-PS', coordinator: 'Koordinator Wilayah Papua Selatan', phone: '081200000035', email: 'dpw.ps@pks.art', address: 'Merauke' },
  { name: 'Wilayah Papua Tengah', code: 'DPW-PT', coordinator: 'Koordinator Wilayah Papua Tengah', phone: '081200000036', email: 'dpw.pt@pks.art', address: 'Nabire' },
  { name: 'Wilayah Papua Pegunungan', code: 'DPW-PP', coordinator: 'Koordinator Wilayah Papua Pegunungan', phone: '081200000037', email: 'dpw.pp@pks.art', address: 'Jayawijaya' },
  { name: 'Wilayah Papua Barat Daya', code: 'DPW-PBD', coordinator: 'Koordinator Wilayah Papua Barat Daya', phone: '081200000038', email: 'dpw.pbd@pks.art', address: 'Sorong' },
  { name: 'Wilayah Nasional', code: 'DPP-PUSAT', coordinator: 'Sekretariat DPP PKS', phone: '081200000000', email: 'dpp@pks.art', address: 'MD Building Jl. TB Simatupang, Jakarta Selatan' },
  { name: 'Wilayah Luar Negeri', code: 'PIP-LN', coordinator: 'Koordinator PIP PKS Luar Negeri', phone: '081200000099', email: 'pip.ln@pks.art', address: 'Luar Negeri' },
];

export async function getDpwList() {
  try {
    let dpwList = await prisma.dpwOffice.findMany({
      orderBy: { name: 'asc' },
    });

    // Auto-seed if database has no DPWs yet
    if (dpwList.length === 0) {
      await seedAllIndonesianDpw();
      dpwList = await prisma.dpwOffice.findMany({
        orderBy: { name: 'asc' },
      });
    }

    return { 
      success: true, 
      data: dpwList.map(d => ({ 
        ...d, 
        createdAt: d.createdAt?.toISOString() || new Date().toISOString(), 
        updatedAt: d.updatedAt?.toISOString() || new Date().toISOString() 
      })) 
    };
  } catch (error) {
    console.error('Error fetching DPW list:', error);
    return { success: false, error: 'Failed to fetch DPW list' };
  }
}

export async function seedAllIndonesianDpw() {
  try {
    const existing = await prisma.dpwOffice.findMany();
    const existingCodes = new Set(existing.map(e => e.code.toUpperCase()));
    const existingNames = new Set(existing.map(e => e.name.toLowerCase()));

    let createdCount = 0;
    for (const item of INITIAL_38_DPW) {
      if (!existingCodes.has(item.code.toUpperCase()) && !existingNames.has(item.name.toLowerCase())) {
        await prisma.dpwOffice.create({
          data: {
            name: item.name,
            code: item.code,
            coordinator: item.coordinator,
            phone: item.phone,
            email: item.email,
            address: item.address,
            activeCreators: 0,
            totalArtworks: 0,
            isActive: true,
          }
        });
        createdCount++;
      }
    }

    revalidatePath('/admin/wilayah');
    revalidatePath('/creators');
    revalidatePath('/profile');
    revalidatePath('/register');
    return { success: true, count: createdCount };
  } catch (error) {
    console.error('Error seeding 38 DPW:', error);
    return { success: false, error: 'Gagal inisialisasi 38 Wilayah DPW' };
  }
}

export async function addDpw(data: any) {
  try {
    const dpw = await prisma.dpwOffice.create({
      data: {
        name: data.name,
        code: data.code,
        coordinator: data.coordinator,
        phone: data.phone,
        email: data.email,
        address: data.address,
        lat: data.lat !== undefined && data.lat !== null ? Number(data.lat) : null,
        lng: data.lng !== undefined && data.lng !== null ? Number(data.lng) : null,
        activeCreators: data.activeCreators || 0,
        totalArtworks: data.totalArtworks || 0,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
    revalidatePath('/admin/wilayah');
    revalidatePath('/creators');
    revalidatePath('/profile');
    revalidatePath('/register');
    return { success: true, data: { ...dpw, createdAt: dpw.createdAt?.toISOString() || new Date().toISOString(), updatedAt: dpw.updatedAt?.toISOString() || new Date().toISOString() } };
  } catch (error) {
    console.error('Error adding DPW:', error);
    return { success: false, error: 'Failed to add DPW' };
  }
}

export async function updateDpw(id: string, data: any) {
  try {
    const { id: _, createdAt, updatedAt, ...updateData } = data;
    const dpw = await prisma.dpwOffice.update({
      where: { id },
      data: updateData,
    });
    revalidatePath('/admin/wilayah');
    revalidatePath('/creators');
    revalidatePath('/profile');
    revalidatePath('/register');
    return { success: true, data: { ...dpw, createdAt: dpw.createdAt?.toISOString() || new Date().toISOString(), updatedAt: dpw.updatedAt?.toISOString() || new Date().toISOString() } };
  } catch (error) {
    console.error('Error updating DPW:', error);
    return { success: false, error: 'Failed to update DPW' };
  }
}

export async function deleteDpw(id: string) {
  try {
    await prisma.dpwOffice.delete({
      where: { id },
    });
    revalidatePath('/admin/wilayah');
    revalidatePath('/creators');
    revalidatePath('/profile');
    revalidatePath('/register');
    return { success: true };
  } catch (error) {
    console.error('Error deleting DPW:', error);
    return { success: false, error: 'Failed to delete DPW' };
  }
}

