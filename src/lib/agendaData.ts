export interface AgendaEvent {
  id: string;
  title: string;
  category: 'Kejuaraan' | 'Seleksi' | 'Pelatihan' | 'Organisasi';
  cabor: string;
  caborCode?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  time: string;
  location: string;
  description: string;
  status: 'Akan Datang' | 'Berlangsung' | 'Selesai';
  organizer: string;
  isFeatured?: boolean;
}

export const AGENDA_EVENTS: AgendaEvent[] = [
  {
    id: 'bimtek-sport-science-2026',
    title: 'Bimtek Manajemen Atlet & Penerapan Sport Science 2026',
    category: 'Pelatihan',
    cabor: 'KONI (Umum)',
    caborCode: 'KONI',
    startDate: '2026-10-28',
    endDate: '2026-10-29',
    time: '08:30 - 16:30 WIB',
    location: 'Aula Sekretariat KONI Kepahiang',
    description: 'Pelatihan intensif manajemen performa atlet dan gizi olahraga bagi 23 pelatih cabang olahraga se-Kabupaten Kepahiang.',
    status: 'Akan Datang',
    organizer: 'Bidang Pembinaan Prestasi KONI Kepahiang',
    isFeatured: true,
  },
  {
    id: 'kejuaraan-bulutangkis-sumpah-pemuda',
    title: 'Kejuaraan Bulutangkis Sumpah Pemuda PBSI Kepahiang',
    category: 'Kejuaraan',
    cabor: 'PBSI (Bulu Tangkis)',
    caborCode: 'PBSI',
    startDate: '2026-10-24',
    endDate: '2026-10-27',
    time: '14:00 - 22:00 WIB',
    location: 'GOR Bulutangkis Tebat Monok',
    description: 'Turnamen terbuka kelompok umur taruna dan dewasa memperebutkan Piala Bergilir Ketua PBSI Kabupaten Kepahiang.',
    status: 'Akan Datang',
    organizer: 'Pengkab PBSI Kepahiang',
    isFeatured: true,
  },
  {
    id: 'porprov-bengkulu-2026',
    title: 'Pekan Olahraga Provinsi (Porprov) Bengkulu 2026',
    category: 'Kejuaraan',
    cabor: 'KONI (Umum)',
    caborCode: 'KONI',
    startDate: '2026-11-10',
    endDate: '2026-11-20',
    time: '08:00 - 18:00 WIB',
    location: 'Stadion Semarak Bengkulu & GOR Tebat Monok',
    description: 'Pesta olahraga akbar se-Provinsi Bengkulu. Kontingen Kabupaten Kepahiang menargetkan peringkat 5 besar dengan 23 cabor unggulan.',
    status: 'Akan Datang',
    organizer: 'KONI Provinsi Bengkulu & KONI Kepahiang',
    isFeatured: true,
  },
  {
    id: 'pelepasan-kontingen-porprov',
    title: 'Apel Pelepasan Kontingen Atlet Porprov Kabupaten Kepahiang',
    category: 'Organisasi',
    cabor: 'KONI (Umum)',
    caborCode: 'KONI',
    startDate: '2026-11-05',
    time: '07:30 - 10:00 WIB',
    location: 'Halaman Kantor Bupati Kepahiang',
    description: 'Upacara pelepasan resmi ratusan patriot olahraga kontingen Kabupaten Kepahiang oleh Bupati dan Ketua Umum KONI.',
    status: 'Akan Datang',
    organizer: 'Pemerintah Kabupaten & KONI Kepahiang',
  },
  {
    id: 'seleksi-atlet-pasi-2026',
    title: 'Seleksi Terbuka Atletik Pelajar Menuju Kejuaraan Daerah',
    category: 'Seleksi',
    cabor: 'PASI (Atletik)',
    caborCode: 'PASI',
    startDate: '2026-11-28',
    endDate: '2026-11-29',
    time: '07:00 - 12:00 WIB',
    location: 'Lintasan Lari Stadion Mini Tebat Monok',
    description: 'Seleksi nomor lari 100m, 400m, 1500m, tolak peluru, dan lompat jauh bagi pelajar tingkat SMP dan SMA.',
    status: 'Akan Datang',
    organizer: 'Pengkab PASI Kepahiang',
  },
  {
    id: 'kejurda-karate-bupati-cup',
    title: 'Kejurda Karate Bupati Cup Kepahiang 2026',
    category: 'Kejuaraan',
    cabor: 'FORKI (Karate)',
    caborCode: 'FORKI',
    startDate: '2026-12-15',
    endDate: '2026-12-18',
    time: '09:00 - 17:00 WIB',
    location: 'Gedung Serbaguna GOR Tebat Monok',
    description: 'Kejuaraan karate terbuka memperebutkan Piala Bergilir Bupati Kepahiang untuk kategori usia dini, kadet, dan junior.',
    status: 'Akan Datang',
    organizer: 'Pengkab FORKI Kepahiang',
  },
  {
    id: 'rakerkab-evaluasi-tahunan',
    title: 'Rapat Kerja Akhir Tahun & Evaluasi Pembinaan Cabor',
    category: 'Organisasi',
    cabor: 'KONI (Umum)',
    caborCode: 'KONI',
    startDate: '2026-12-28',
    time: '09:00 - 16:00 WIB',
    location: 'Aula Pertemuan Pemkab Kepahiang',
    description: 'Rapat pleno tahunan evaluasi capaian prestasi medali 2026 dan penyusunan kalender kompetisi musim 2027.',
    status: 'Akan Datang',
    organizer: 'Sekretariat KONI Kepahiang',
  },
];
