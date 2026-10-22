export interface MatchScore {
  id: string;
  cabor: string;
  event: string;
  status: 'LIVE' | 'FT' | 'UPCOMING';
  statusLabel: string; // e.g. "LIVE 72'", "Set 3", "FT (Selesai)", "Hari Ini 15:30"
  teamHome: {
    name: string;
    score?: number | string;
    isKepahiang?: boolean;
  };
  teamAway: {
    name: string;
    score?: number | string;
    isKepahiang?: boolean;
  };
  note?: string; // e.g. "Babak Semifinal", "Perebutan Emas", "21-18, 21-15"
  venue?: string;
}

export const MATCH_SCORES_DATA: MatchScore[] = [
  {
    id: 'match-1',
    cabor: 'Futsal',
    event: 'PORPROV X Bengkulu',
    status: 'LIVE',
    statusLabel: "LIVE 68'",
    teamHome: { name: 'Kepahiang', score: 3, isKepahiang: true },
    teamAway: { name: 'Benteng', score: 2, isKepahiang: false },
    note: 'Semifinal • GOR Tebat Monok',
  },
  {
    id: 'match-2',
    cabor: 'Bola Voli',
    event: 'Kejurda Pelajar',
    status: 'LIVE',
    statusLabel: 'Set 3 (18-14)',
    teamHome: { name: 'Kepahiang (Pa)', score: 2, isKepahiang: true },
    teamAway: { name: 'Rejang Lebong', score: 1, isKepahiang: false },
    note: 'Babak 8 Besar',
  },
  {
    id: 'match-3',
    cabor: 'Karate',
    event: 'PORPROV X Bengkulu',
    status: 'FT',
    statusLabel: 'SELESAI (Emas 🥇)',
    teamHome: { name: 'Rian Hidayat (KPH)', score: 7, isKepahiang: true },
    teamAway: { name: 'Kota Bengkulu', score: 1, isKepahiang: false },
    note: 'Kumite -67kg Putra',
  },
  {
    id: 'match-4',
    cabor: 'Sepak Bola',
    event: 'Piala Gubernur',
    status: 'FT',
    statusLabel: 'FT (Selesai)',
    teamHome: { name: 'PS Kepahiang', score: 2, isKepahiang: true },
    teamAway: { name: 'Mukomuko FC', score: 0, isKepahiang: false },
    note: 'Fase Grup A',
  },
  {
    id: 'match-5',
    cabor: 'Bulu Tangkis',
    event: 'Sirkuit PBSI',
    status: 'FT',
    statusLabel: 'FT (2-0)',
    teamHome: { name: 'Ganda Putra KPH', score: 2, isKepahiang: true },
    teamAway: { name: 'Seluma', score: 0, isKepahiang: false },
    note: '21-18, 21-15',
  },
  {
    id: 'match-6',
    cabor: 'Bola Basket',
    event: 'Kejurda 3x3',
    status: 'UPCOMING',
    statusLabel: '15:30 WIB',
    teamHome: { name: 'Kepahiang 3x3', isKepahiang: true },
    teamAway: { name: 'Kaur 3x3', isKepahiang: false },
    note: 'Penyisihan Lap. Bencoolen',
  },
];
