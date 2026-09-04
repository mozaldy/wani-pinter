// Shape of a Modul Ajar (RPP) following the Kemendikdasmen "Pembelajaran Mendalam"
// format — see docs/Inspirasi Modul Ajar.pdf. The TypeScript type, the Gemini
// response schemas and the prompts live together so they cannot drift apart.

export type Identitas = {
  judul: string; satuan: string; mapel: string;
  fase: string; kelas: string; semester: string; alokasi: string;
};

export type RuteRow = { no: number; tujuan: string; aktivitas: string; alokasi: string };

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
  rencanaTindakLanjut: string[];
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
    properties: { no: { type: 'INTEGER' }, tujuan: STR, aktivitas: STR, alokasi: STR },
    required: ['no', 'tujuan', 'aktivitas', 'alokasi'],
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
    rencanaTindakLanjut: STR_LIST,
    daftarPustaka: STR_LIST,
  },
  required: [
    'identitas', 'identifikasiMurid', 'identifikasiMateri', 'dimensiProfilLulusan',
    'tujuanPembelajaran', 'indikator', 'praktikPedagogis', 'lingkunganPembelajaran',
    'kemitraanPembelajaran', 'pemanfaatanDigital', 'rutePertemuan', 'asesmenSumatif',
    'rencanaTindakLanjut', 'daftarPustaka',
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
  { key: 'indikator', label: 'Kriteria Ketercapaian Tujuan Pembelajaran (Kriteria Sukses)', kind: 'list' },
  { key: 'praktikPedagogis', label: 'Kerangka Pembelajaran — Praktik Pedagogis', kind: 'text' },
  { key: 'lingkunganPembelajaran', label: 'Kerangka Pembelajaran — Lingkungan Pembelajaran', kind: 'text' },
  { key: 'kemitraanPembelajaran', label: 'Kerangka Pembelajaran — Kemitraan Pembelajaran', kind: 'text' },
  { key: 'pemanfaatanDigital', label: 'Kerangka Pembelajaran — Pemanfaatan Digital', kind: 'text' },
  { key: 'rutePertemuan', label: 'Alur Belajar', kind: 'table', hint: 'Tujuan, aktivitas & alokasi tiap pertemuan' },
  { key: 'asesmenSumatif', label: 'Asesmen Sumatif', kind: 'text' },
  { key: 'rencanaTindakLanjut', label: 'Rencana Tindak Lanjut', kind: 'list' },
  { key: 'daftarPustaka', label: 'Daftar Pustaka', kind: 'list' },
] as const satisfies readonly SectionDef[];

export type SectionKey =
  | 'identifikasiMurid' | 'identifikasiMateri' | 'dimensiProfilLulusan'
  | 'tujuanPembelajaran' | 'indikator' | 'praktikPedagogis'
  | 'lingkunganPembelajaran' | 'kemitraanPembelajaran' | 'pemanfaatanDigital'
  | 'rutePertemuan' | 'asesmenSumatif' | 'rencanaTindakLanjut' | 'daftarPustaka';

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
- Jangan memakai markdown, tanda bintang, atau tanda pagar di dalam nilai teks.

Modul ini akan dinilai dengan Instrumen Penelaahan Perencanaan Pembelajaran Berbasis Pendekatan Pembelajaran Mendalam, sehingga setiap butir instrumen harus terpenuhi secara eksplisit, bukan tersirat.`;

/** Context every pertemuan needs so its langkah stay coherent with the skeleton. */
function kerangka(rpp: Rpp) {
  return `Praktik Pedagogis (sintaksnya wajib tampak di langkah): ${rpp.praktikPedagogis}
Pemanfaatan Digital (wajib benar-benar dipakai di langkah): ${rpp.pemanfaatanDigital}
Lingkungan Pembelajaran: ${rpp.lingkunganPembelajaran}
Kemitraan Pembelajaran: ${rpp.kemitraanPembelajaran}
Dimensi Profil Lulusan: ${rpp.dimensiProfilLulusan.join(', ')}`;
}

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
- identitas.alokasi: alokasi waktu total yang logis dengan kedalaman tujuan pembelajaran, dan sama dengan jumlah alokasi seluruh pertemuan pada rute.
- identifikasiMurid: satu paragraf berbasis data yang menyebut perkiraan jumlah murid pada tiap tingkat kemampuan akademis, kondisi non-akademis (minat, kebiasaan, latar belakang), serta sebaran tipe belajar (visual, auditori, kinestetik) di kelas ini, berdasarkan kondisi kelas di atas.
- identifikasiMateri: satu paragraf berisi rangkuman singkat materi, kedalaman konseptual, prosedural, dan aplikatifnya, kemampuan dan pengetahuan prasyarat, serta miskonsepsi umum yang perlu diantisipasi.
- dimensiProfilLulusan: 2 sampai 4 dimensi saja, sejumlah yang benar-benar dapat digarap dalam ${i.jumlahPertemuan} pertemuan dan tampak pada langkah pembelajaran nanti.
- tujuanPembelajaran: tepat satu tujuan pembelajaran yang selaras dengan ATP fase ${i.fase}, terukur, dalam satu kalimat.
- indikator: 3 sampai 5 kriteria ketercapaian yang merupakan uraian (breakdown) dari tujuan tersebut, teramati dan dapat diukur.
- praktikPedagogis: satu paragraf yang menyebut nama model, metode, atau teknik pembelajaran yang dipilih, lalu merinci sintaks atau tahapannya secara berurutan, karena tahapan itu wajib tampak pada langkah-langkah pembelajaran.
- lingkunganPembelajaran: satu paragraf deskriptif yang mencakup budaya belajar yang dibangun, penataan lingkungan fisik kelas, dan lingkungan virtual bila dipakai.
- kemitraanPembelajaran: satu paragraf yang menyebut mitra konkret di luar guru dan murid kelas ini (misalnya orang tua, pustakawan, komite, puskesmas, UMKM sekitar) beserta peran nyatanya pada pembelajaran ini.
- pemanfaatanDigital: satu paragraf yang menyebut media, LKM, atau alat evaluasi berbentuk digital yang konkret dan akan benar-benar muncul pada langkah pembelajaran.
- rutePertemuan: tepat ${i.jumlahPertemuan} baris, nomor 1 sampai ${i.jumlahPertemuan} berurutan. Tiap baris berisi tujuan pertemuan, nama aktivitas yang menarik bagi murid, dan alokasi waktu pertemuan tersebut (contoh: "2 x 35 menit").
- asesmenSumatif: satu paragraf berisi bentuk, teknik, dan instrumen asesmen sumatif di akhir rangkaian, yang benar-benar mengukur tujuan pembelajaran dan indikator di atas.
- rencanaTindakLanjut: 2 sampai 4 butir rencana tindak lanjut atas hasil asesmen, mencakup murid yang sudah mencapai kriteria (pengayaan) dan yang belum (remedial atau pendampingan).
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
${kerangka(rpp)}
Seluruh rute pertemuan: ${rpp.rutePertemuan.map(r => `(${r.no}) ${r.tujuan} — ${r.aktivitas} [${r.alokasi}]`).join(' | ')}

Susun rincian Pertemuan ${no}${rute ? ` "${rute.aktivitas}"` : ''} dengan tujuan: ${rute?.tujuan ?? '(lihat rute)'}.

Panduan isi:
- no harus ${no}.
- judul: nama aktivitas pertemuan ini.
- pengalamanBelajar: pilih hanya pengalaman belajar yang wajar untuk pertemuan ini. Tidak perlu memaksakan Memahami, Mengaplikasi, dan Merefleksi hadir semua dalam satu pertemuan.
- prinsip: 1 sampai 3 prinsip yang benar-benar terlihat pada langkah pembelajaran pertemuan ini.
- langkah: 8 sampai 15 langkah pembelajaran berurutan dan sangat konkret yang mengikuti sintaks atau tahapan praktik pedagogis di atas secara berurutan, dan muat dalam alokasi ${rute?.alokasi ?? rpp.identitas.alokasi}. Tulis sebagai kalimat utuh yang menyebut apa yang dilakukan murid dan pendidik, termasuk pertanyaan pemantik yang diucapkan, media yang dipegang, pemakaian media digital yang telah disebut, dan kegiatan refleksi di langkah terakhir. Sebut nama tahapan praktik pedagogis di awal langkah yang bersangkutan. Jangan menomori sendiri, cukup satu langkah per elemen.
- media: alat dan bahan konkret yang mudah didapat di sekolah Indonesia, termasuk media digital yang dipakai di langkah.
- asesmen: asesmen formatif untuk pertemuan ini. tujuan menyebut indikator mana yang diukur. rubrik berisi 3 sampai 4 aspek yang diamati dan sejalan dengan indikator tersebut. tindakLanjut berisi tindak lanjut untuk kategori mampu dan belum.`;
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
