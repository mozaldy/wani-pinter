import type { Dictionary } from './id';

export const en: Dictionary = {
  meta: {
    title: 'WANI-PINTER · School Data Platform',
    description: 'School data platform for Indonesian teachers',
  },
  locale: {
    label: 'Language',
    id: 'Bahasa Indonesia',
    en: 'English',
    short: { id: 'ID', en: 'EN' },
  },
  enums: {
    risiko: { rendah: 'Low', sedang: 'Medium', tinggi: 'High' },
    status: { selesai: 'Done', aktif: 'Active', mendatang: 'Upcoming' },
    kategori: { positif: 'Positive', perhatian: 'Needs attention', akademik: 'Academic', sosial: 'Social' },
    jk: { L: 'Male', P: 'Female' },
  },
};
