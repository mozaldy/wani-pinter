export const id = {
  meta: {
    title: 'WANI-PINTER · Platform Data Sekolah',
    description: 'Platform data sekolah untuk guru Indonesia',
  },
  locale: {
    label: 'Bahasa',
    id: 'Bahasa Indonesia',
    en: 'English',
    short: { id: 'ID', en: 'EN' },
  },
  enums: {
    risiko: { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi' },
    status: { selesai: 'Selesai', aktif: 'Aktif', mendatang: 'Mendatang' },
    kategori: { positif: 'Positif', perhatian: 'Perhatian', akademik: 'Akademik', sosial: 'Sosial' },
    jk: { L: 'Laki-laki', P: 'Perempuan' },
  },
};

export type Dictionary = typeof id;
