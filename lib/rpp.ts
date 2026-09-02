// Shape of a Modul Ajar (RPP) following the Kemendikdasmen "Pembelajaran Mendalam"
// format — see docs/Inspirasi Modul Ajar.pdf. The TypeScript type, the Gemini
// response schemas and the prompts live together so they cannot drift apart.

export type Identitas = {
  judul: string; satuan: string; mapel: string;
  fase: string; kelas: string; semester: string; alokasi: string;
};

export type RuteRow = { no: number; tujuan: string; aktivitas: string };

export type Asesmen = {
  tujuan: string;
  teknik: string;
  rubrik: string[];        // "Aspek yang Diamati" rows; Mampu/Belum are printed checkboxes
  kriteria: string;
  tindakLanjut: string[];
};

export type Pertemuan = {
  no: number;
  judul: string;
  pengalamanBelajar: string;  // Memahami | Mengaplikasi | Merefleksi
  prinsip: string[];          // Berkesadaran | Bermakna | Menggembirakan
  media: string;
  langkah: string[];
  asesmen: Asesmen | null;
};

export type Rpp = {
  identitas: Identitas;
  identifikasiMurid: string;
  identifikasiMateri: string;
  dimensiProfilLulusan: string[];
  tujuanPembelajaran: string;
  indikator: string[];
  praktikPedagogis: string;
  lingkunganPembelajaran: string;
  kemitraanPembelajaran: string;
  pemanfaatanDigital: string;
  rutePertemuan: RuteRow[];
  pertemuan: Pertemuan[];     // one slot per rutePertemuan row; langkah [] until generated
  asesmenSumatif: string;
  daftarPustaka: string[];
};

export type RppInput = {
  mapel: string; fase: string; kelas: string; semester: string;
  satuan: string; topik: string; jumlahPertemuan: number;
  alokasi: string; kondisiKelas: string;
};

// ─── Gemini response schemas ───────────────────────────────────────────────

const STR = { type: 'STRING' } as const;
const STR_LIST = { type: 'ARRAY', items: STR } as const;

const IDENTITAS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    judul: STR, satuan: STR, mapel: STR,
    fase: STR, kelas: STR, semester: STR, alokasi: STR,
  },
  required: ['judul', 'satuan', 'mapel', 'fase', 'kelas', 'semester', 'alokasi'],
} as const;

const RUTE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: { no: { type: 'INTEGER' }, tujuan: STR, aktivitas: STR },
    required: ['no', 'tujuan', 'aktivitas'],
  },
} as const;

const ASESMEN_SCHEMA = {
  type: 'OBJECT',
  properties: {
    tujuan: STR, teknik: STR, rubrik: STR_LIST, kriteria: STR, tindakLanjut: STR_LIST,
  },
  required: ['tujuan', 'teknik', 'rubrik', 'kriteria', 'tindakLanjut'],
} as const;

export const SKELETON_SCHEMA = {
  type: 'OBJECT',
  properties: {
    identitas: IDENTITAS_SCHEMA,
    identifikasiMurid: STR,
    identifikasiMateri: STR,
    dimensiProfilLulusan: STR_LIST,
    tujuanPembelajaran: STR,
    indikator: STR_LIST,
    praktikPedagogis: STR,
    lingkunganPembelajaran: STR,
    kemitraanPembelajaran: STR,
    pemanfaatanDigital: STR,
    rutePertemuan: RUTE_SCHEMA,
    asesmenSumatif: STR,
    daftarPustaka: STR_LIST,
  },
  required: [
    'identitas', 'identifikasiMurid', 'identifikasiMateri', 'dimensiProfilLulusan',
    'tujuanPembelajaran', 'indikator', 'praktikPedagogis', 'lingkunganPembelajaran',
    'kemitraanPembelajaran', 'pemanfaatanDigital', 'rutePertemuan', 'asesmenSumatif',
    'daftarPustaka',
  ],
} as const;

export const PERTEMUAN_SCHEMA = {
  type: 'OBJECT',
  properties: {
    no: { type: 'INTEGER' },
    judul: STR,
    pengalamanBelajar: STR,
    prinsip: STR_LIST,
    media: STR,
    langkah: STR_LIST,
    asesmen: ASESMEN_SCHEMA,
  },
  required: ['no', 'judul', 'pengalamanBelajar', 'prinsip', 'media', 'langkah', 'asesmen'],
} as const;

// ─── Editable sections ─────────────────────────────────────────────────────
// Drives the editor UI, the manual-save action and the refine action alike.

export type SectionKind = 'text' | 'list' | 'table';

export type SectionDef = { key: SectionKey; label: string; kind: SectionKind; hint?: string };

export const SECTIONS = [
  { key: 'identifikasiMurid', label: 'Identifikasi Murid', kind: 'text' },
  { key: 'identifikasiMateri', label: 'Identifikasi Materi', kind: 'text' },
  { key: 'dimensiProfilLulusan', label: 'Dimensi Profil Lulusan', kind: 'list' },
  { key: 'tujuanPembelajaran', label: 'Tujuan Pembelajaran', kind: 'text' },
  { key: 'indikator', label: 'Indikator Ketercapaian Tujuan Pembelajaran', kind: 'list' },
  { key: 'praktikPedagogis', label: 'Praktik Pedagogis', kind: 'text' },
  { key: 'lingkunganPembelajaran', label: 'Lingkungan Pembelajaran', kind: 'text' },
  { key: 'kemitraanPembelajaran', label: 'Kemitraan Pembelajaran', kind: 'text' },
  { key: 'pemanfaatanDigital', label: 'Pemanfaatan Digital', kind: 'text' },
  { key: 'rutePertemuan', label: 'Rute Pertemuan', kind: 'table', hint: 'Tujuan & aktivitas tiap pertemuan' },
  { key: 'asesmenSumatif', label: 'Asesmen Sumatif', kind: 'text' },
  { key: 'daftarPustaka', label: 'Daftar Pustaka', kind: 'list' },
] as const satisfies readonly SectionDef[];

export type SectionKey =
  | 'identifikasiMurid' | 'identifikasiMateri' | 'dimensiProfilLulusan'
  | 'tujuanPembelajaran' | 'indikator' | 'praktikPedagogis'
  | 'lingkunganPembelajaran' | 'kemitraanPembelajaran' | 'pemanfaatanDigital'
  | 'rutePertemuan' | 'asesmenSumatif' | 'daftarPustaka';

export function isSectionKey(k: string): k is SectionKey {
  return SECTIONS.some(s => s.key === k);
}

export function sectionKind(key: SectionKey): SectionKind {
  return SECTIONS.find(s => s.key === key)!.kind;
}

/** Refine always returns { value: … } so the root is an object for every section kind. */
export function sectionSchema(key: SectionKey) {
  const value =
    key === 'rutePertemuan' ? RUTE_SCHEMA
      : sectionKind(key) === 'list' ? STR_LIST
        : STR;
  return { type: 'OBJECT', properties: { value }, required: ['value'] };
}

// ─── Prompts ───────────────────────────────────────────────────────────────

const FRAMING = `Anda adalah ahli kurikulum Kementerian Pendidikan Dasar dan Menengah (Kemendikdasmen) Republik Indonesia yang menyusun Modul Ajar (RPP) sesuai kerangka Pembelajaran Mendalam.

Ketentuan wajib:
- Seluruh keluaran dalam Bahasa Indonesia yang baku, ringkas, dan langsung dapat dipakai guru.
- Dimensi Profil Lulusan dipilih dari: Keimanan dan Ketakwaan terhadap Tuhan YME, Kewargaan, Penalaran Kritis, Kreativitas, Kolaborasi, Kemandirian, Kesehatan, Komunikasi.
- Pengalaman belajar memakai istilah: Memahami, Mengaplikasi, atau Merefleksi.
- Prinsip pembelajaran memakai istilah: Berkesadaran, Bermakna, atau Menggembirakan.
- Jangan memakai markdown, tanda bintang, atau tanda pagar di dalam nilai teks.`;

function konteks(i: RppInput) {
  return `Satuan Pendidikan: ${i.satuan}
Mata Pelajaran: ${i.mapel}
Fase: ${i.fase}
Kelas: ${i.kelas}
Semester: ${i.semester}
Topik/Materi: ${i.topik}
Jumlah pertemuan: ${i.jumlahPertemuan}
Alokasi waktu: ${i.alokasi}
Kondisi kelas: ${i.kondisiKelas || 'tidak disebutkan, asumsikan kelas reguler'}`;
}

export function skeletonPrompt(i: RppInput): string {
  return `${FRAMING}

Susun kerangka Modul Ajar untuk:
${konteks(i)}

Panduan isi:
- identifikasiMurid: satu paragraf yang memetakan keberagaman kesiapan belajar murid di kelas ini secara konkret (sebutkan perkiraan jumlah murid pada tiap tingkat kemampuan) berdasarkan kondisi kelas di atas.
- identifikasiMateri: satu paragraf yang menjelaskan kedalaman konseptual, prosedural, dan aplikatif materi, kemampuan prasyarat, serta miskonsepsi umum yang perlu diantisipasi.
- tujuanPembelajaran: satu kalimat tujuan yang terukur.
- indikator: 3 sampai 5 indikator ketercapaian yang dapat diamati.
- praktikPedagogis, lingkunganPembelajaran, kemitraanPembelajaran, pemanfaatanDigital: masing-masing satu paragraf yang spesifik untuk materi ini, bukan pernyataan umum.
- rutePertemuan: tepat ${i.jumlahPertemuan} baris, nomor 1 sampai ${i.jumlahPertemuan} berurutan. Tiap baris berisi tujuan pertemuan dan nama aktivitas yang menarik bagi murid.
- asesmenSumatif: satu paragraf bentuk dan teknik asesmen sumatif di akhir rangkaian.
- daftarPustaka: 2 sampai 4 rujukan dengan format penulisan baku.`;
}

export function pertemuanPrompt(rpp: Rpp, no: number): string {
  const rute = rpp.rutePertemuan.find(r => r.no === no);
  return `${FRAMING}

Konteks Modul Ajar:
Mata Pelajaran: ${rpp.identitas.mapel}
Fase/Kelas: ${rpp.identitas.fase}/${rpp.identitas.kelas}
Alokasi: ${rpp.identitas.alokasi}
Tujuan Pembelajaran: ${rpp.tujuanPembelajaran}
Indikator: ${rpp.indikator.join('; ')}
Identifikasi Murid: ${rpp.identifikasiMurid}
Praktik Pedagogis: ${rpp.praktikPedagogis}
Seluruh rute pertemuan: ${rpp.rutePertemuan.map(r => `(${r.no}) ${r.tujuan} — ${r.aktivitas}`).join(' | ')}

Susun rincian Pertemuan ${no}${rute ? ` "${rute.aktivitas}"` : ''} dengan tujuan: ${rute?.tujuan ?? '(lihat rute)'}.

Panduan isi:
- no harus ${no}.
- judul: nama aktivitas pertemuan ini.
- langkah: 8 sampai 15 langkah pembelajaran berurutan dan sangat konkret. Tulis sebagai kalimat utuh yang menyebut apa yang dilakukan murid dan pendidik, termasuk pertanyaan pemantik yang diucapkan, media yang dipegang, dan kegiatan refleksi di langkah terakhir. Jangan menomori sendiri, cukup satu langkah per elemen.
- media: alat dan bahan konkret yang mudah didapat di sekolah Indonesia.
- asesmen: asesmen formatif untuk pertemuan ini. rubrik berisi 3 sampai 4 aspek yang diamati. tindakLanjut berisi tindak lanjut untuk kategori mampu dan belum.`;
}

export function refinePrompt(rpp: Rpp, key: SectionKey, current: unknown, instruction: string): string {
  const def = SECTIONS.find(s => s.key === key)!;
  return `${FRAMING}

Anda sedang menyunting satu bagian dari Modul Ajar berikut.
Mata Pelajaran: ${rpp.identitas.mapel}
Fase/Kelas: ${rpp.identitas.fase}/${rpp.identitas.kelas}
Judul: ${rpp.identitas.judul}
Tujuan Pembelajaran: ${rpp.tujuanPembelajaran}
Indikator: ${rpp.indikator.join('; ')}

Bagian yang disunting: "${def.label}"
Isi saat ini:
${JSON.stringify(current, null, 2)}

Permintaan guru: ${instruction}

Kembalikan HANYA bagian tersebut dalam properti "value", dengan bentuk data yang persis sama seperti isi saat ini. Jangan mengubah bagian lain dan jangan menambah penjelasan.${key === 'rutePertemuan' ? ' Pertahankan penomoran yang berurutan mulai dari 1.' : ''}`;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Empty pertemuan slots, one per rute row, filled in on demand by the teacher. */
export function emptyPertemuan(rute: RuteRow[]): Pertemuan[] {
  return rute.map(r => ({
    no: r.no, judul: r.aktivitas, pengalamanBelajar: '', prinsip: [],
    media: '', langkah: [], asesmen: null,
  }));
}
