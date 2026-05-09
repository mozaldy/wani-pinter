export type Student = {
  id: string;
  nama: string;
  nis: string;
  kelas: string;
  jk: 'L' | 'P';
  avatar_color: string;
  rerata: number;
  kehadiran: number;
  risiko: 'rendah' | 'sedang' | 'tinggi';
  ortu: string;
  alamat: string;
  cp_matematika: number;
  cp_ipa: number;
  cp_ips: number;
  cp_bind: number;
  cp_bing: number;
  cp_pjok: number;
};

export type Mapel = {
  kode: string;
  nama: string;
  icon: string;
  color: string;
};

export type CP = {
  kode: string;
  nama: string;
  tp_count: number;
  mastered: number;
};

export type Jadwal = {
  id: number;
  waktu: string;
  mapel: string;
  kelas: string;
  topic: string;
  status: 'selesai' | 'aktif' | 'mendatang';
  ruang: string;
};

export type Kehadiran = { hari: string; hadir: number; izin: number; sakit: number; alpa: number };
export type AIInsight = { id: number; type: string; title: string; body: string; action: string };
export type Activity = { id: number; time_label: string; type: string; title: string; description: string };

export type CatatanSiswa = {
  id: number;
  student_id: string;
  tgl: string;
  kategori: 'positif' | 'perhatian' | 'akademik' | 'sosial';
  text: string;
  tags: string[];
  visible_to_parent: boolean;
};

export type HeatmapRow = {
  student: Student;
  cells: { cp: string; value: number }[];
};
