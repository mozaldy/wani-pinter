import { config } from 'dotenv';
config({ path: '.env.local' });
config();
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!);

const STUDENTS = [
  { id: 'S001', nama: 'Ahmad Fauzi Rizky', nis: '0078451123', kelas: 'VIII-A', jk: 'L', avatar: '#4F46E5', rerata: 88, kehadiran: 96, risiko: 'rendah', ortu: 'Bp. Budi Santoso', alamat: 'Jl. Diponegoro 12, Yogyakarta', cp: { matematika: 85, ipa: 90, ips: 86, bind: 92, bing: 88, pjok: 95 } },
  { id: 'S002', nama: 'Siti Nurhaliza', nis: '0078451124', kelas: 'VIII-A', jk: 'P', avatar: '#EC4899', rerata: 92, kehadiran: 98, risiko: 'rendah', ortu: 'Ibu Rina Wulandari', alamat: 'Jl. Malioboro 45', cp: { matematika: 95, ipa: 92, ips: 90, bind: 94, bing: 91, pjok: 89 } },
  { id: 'S003', nama: 'Bagas Pratama', nis: '0078451125', kelas: 'VIII-A', jk: 'L', avatar: '#06B6D4', rerata: 65, kehadiran: 78, risiko: 'tinggi', ortu: 'Bp. Hadi Pratama', alamat: 'Jl. Solo Km 8', cp: { matematika: 55, ipa: 62, ips: 70, bind: 68, bing: 60, pjok: 75 } },
  { id: 'S004', nama: 'Dewi Anggraini', nis: '0078451126', kelas: 'VIII-A', jk: 'P', avatar: '#10B981', rerata: 78, kehadiran: 92, risiko: 'rendah', ortu: 'Ibu Yuni Lestari', alamat: 'Perum Griya Asri B-12', cp: { matematika: 75, ipa: 80, ips: 78, bind: 82, bing: 76, pjok: 80 } },
  { id: 'S005', nama: 'Muhammad Ilham', nis: '0078451127', kelas: 'VIII-A', jk: 'L', avatar: '#F59E0B', rerata: 71, kehadiran: 85, risiko: 'sedang', ortu: 'Bp. Dedi Kurniawan', alamat: 'Jl. Kaliurang Km 12', cp: { matematika: 68, ipa: 70, ips: 72, bind: 75, bing: 68, pjok: 78 } },
  { id: 'S006', nama: 'Putri Maharani', nis: '0078451128', kelas: 'VIII-A', jk: 'P', avatar: '#8B5CF6', rerata: 84, kehadiran: 94, risiko: 'rendah', ortu: 'Ibu Siti Aminah', alamat: 'Jl. Gejayan 78', cp: { matematika: 80, ipa: 86, ips: 84, bind: 88, bing: 82, pjok: 85 } },
  { id: 'S007', nama: 'Rendra Wijaya', nis: '0078451129', kelas: 'VIII-A', jk: 'L', avatar: '#EF4444', rerata: 58, kehadiran: 72, risiko: 'tinggi', ortu: 'Bp. Joko Wijaya', alamat: 'Jl. Kapas 23', cp: { matematika: 50, ipa: 55, ips: 60, bind: 62, bing: 58, pjok: 70 } },
  { id: 'S008', nama: 'Anisa Rahmadhani', nis: '0078451130', kelas: 'VIII-A', jk: 'P', avatar: '#14B8A6', rerata: 90, kehadiran: 100, risiko: 'rendah', ortu: 'Ibu Ratna Sari', alamat: 'Jl. Magelang Km 5', cp: { matematika: 92, ipa: 88, ips: 90, bind: 94, bing: 89, pjok: 87 } },
  { id: 'S009', nama: 'Yoga Adi Pratama', nis: '0078451131', kelas: 'VIII-A', jk: 'L', avatar: '#F97316', rerata: 76, kehadiran: 90, risiko: 'rendah', ortu: 'Bp. Sutrisno', alamat: 'Jl. Wonosari 14', cp: { matematika: 72, ipa: 78, ips: 76, bind: 80, bing: 74, pjok: 78 } },
  { id: 'S010', nama: 'Najwa Salsabila', nis: '0078451132', kelas: 'VIII-A', jk: 'P', avatar: '#A855F7', rerata: 81, kehadiran: 93, risiko: 'rendah', ortu: 'Ibu Maya Indah', alamat: 'Jl. Tamansiswa 56', cp: { matematika: 78, ipa: 84, ips: 82, bind: 85, bing: 80, pjok: 78 } },
  { id: 'S011', nama: 'Galih Setiawan', nis: '0078451133', kelas: 'VIII-A', jk: 'L', avatar: '#0EA5E9', rerata: 68, kehadiran: 82, risiko: 'sedang', ortu: 'Bp. Agus Setiawan', alamat: 'Jl. Imogiri 99', cp: { matematika: 62, ipa: 65, ips: 70, bind: 72, bing: 65, pjok: 76 } },
  { id: 'S012', nama: 'Lulu Aulia Sari', nis: '0078451134', kelas: 'VIII-A', jk: 'P', avatar: '#84CC16', rerata: 87, kehadiran: 95, risiko: 'rendah', ortu: 'Ibu Endang', alamat: 'Jl. Bantul Km 7', cp: { matematika: 84, ipa: 88, ips: 86, bind: 90, bing: 86, pjok: 88 } },
];

const MAPEL = [
  { kode: 'MTK', nama: 'Matematika', icon: 'sigma', color: '#4F46E5' },
  { kode: 'IPA', nama: 'IPA Terpadu', icon: 'leaf', color: '#10B981' },
  { kode: 'IPS', nama: 'IPS Terpadu', icon: 'globe', color: '#F59E0B' },
  { kode: 'BIND', nama: 'Bahasa Indonesia', icon: 'book', color: '#EF4444' },
  { kode: 'BING', nama: 'Bahasa Inggris', icon: 'message', color: '#06B6D4' },
  { kode: 'PJOK', nama: 'PJOK', icon: 'activity', color: '#EC4899' },
];

const CP_LIST = [
  { kode: 'CP-MTK-8.1', nama: 'Bilangan Berpangkat & Akar', tp: 4, mastered: 87 },
  { kode: 'CP-MTK-8.2', nama: 'Sistem Persamaan Linear Dua Variabel', tp: 5, mastered: 72 },
  { kode: 'CP-MTK-8.3', nama: 'Persamaan Garis Lurus', tp: 3, mastered: 64 },
  { kode: 'CP-MTK-8.4', nama: 'Teorema Pythagoras', tp: 4, mastered: 81 },
  { kode: 'CP-MTK-8.5', nama: 'Lingkaran', tp: 6, mastered: 45 },
  { kode: 'CP-MTK-8.6', nama: 'Bangun Ruang Sisi Datar', tp: 5, mastered: 38 },
  { kode: 'CP-MTK-8.7', nama: 'Statistika', tp: 4, mastered: 22 },
  { kode: 'CP-MTK-8.8', nama: 'Peluang', tp: 3, mastered: 0 },
];

const JADWAL = [
  { waktu: '07.00 - 08.20', mapel: 'Matematika', kelas: 'VIII-A', topic: 'Sistem Persamaan Linear', status: 'selesai', ruang: 'R-201' },
  { waktu: '08.20 - 09.40', mapel: 'Matematika', kelas: 'VIII-B', topic: 'Sistem Persamaan Linear', status: 'aktif', ruang: 'R-203' },
  { waktu: '10.00 - 11.20', mapel: 'Matematika', kelas: 'IX-A', topic: 'Bangun Ruang Sisi Lengkung', status: 'mendatang', ruang: 'R-301' },
  { waktu: '12.30 - 13.50', mapel: 'Matematika', kelas: 'VII-A', topic: 'Bilangan Bulat', status: 'mendatang', ruang: 'R-101' },
];

const KEHADIRAN = [
  { hari: 'Sen', hadir: 28, izin: 1, sakit: 1, alpa: 2 },
  { hari: 'Sel', hadir: 30, izin: 0, sakit: 1, alpa: 1 },
  { hari: 'Rab', hadir: 29, izin: 1, sakit: 2, alpa: 0 },
  { hari: 'Kam', hadir: 31, izin: 0, sakit: 0, alpa: 1 },
  { hari: 'Jum', hadir: 27, izin: 2, sakit: 1, alpa: 2 },
];

const INSIGHTS = [
  { type: 'risk', title: '3 siswa berisiko tidak tuntas pada CP-MTK-8.5 (Lingkaran)', body: 'Bagas, Rendra, dan Galih menunjukkan kesulitan konsisten pada konsep busur dan juring. Skor formatif mereka turun 18% dalam 2 minggu terakhir, dan kehadiran Rendra hanya 72%.', action: 'Lihat rencana intervensi' },
  { type: 'gap', title: 'Gap belajar terbesar: Statistika (TP-3 — Penyajian Data)', body: 'Hanya 22% kelas VIII-A telah menuntaskan TP-3. Disarankan memberi 1 sesi remedial dengan studi kasus data sekolah agar lebih kontekstual.', action: 'Buat sesi remedial' },
  { type: 'win', title: 'Pencapaian: 87% siswa tuntas Bilangan Berpangkat (target 80%)', body: 'Kelas VIII-A melampaui target untuk CP-MTK-8.1. Strategi diferensiasi yang Anda terapkan minggu lalu efektif — pertimbangkan dokumentasi sebagai praktik terbaik.', action: 'Bagikan ke rekan guru' },
];

const PARENTS = [
  { email: 'budi.santoso@email.com', password: 'password123', nama: 'Bp. Budi Santoso', studentIds: ['S001'] },
  { email: 'hadi.pratama@email.com', password: 'password123', nama: 'Bp. Hadi Pratama', studentIds: ['S003', 'S004'] },
];

const CATATAN = [
  { studentId: 'S001', tgl: '2026-05-01', kategori: 'positif', text: 'Ahmad aktif berdiskusi dan membantu teman dalam kelompok. Sangat kooperatif.', tags: ['diskusi', 'kerjasama'], visible: true },
  { studentId: 'S001', tgl: '2026-04-20', kategori: 'akademik', text: 'Nilai formatif Matematika meningkat dari 82 ke 88. Konsep SPLDV sudah dikuasai dengan baik.', tags: ['matematika', 'formatif'], visible: true },
  { studentId: 'S001', tgl: '2026-04-10', kategori: 'perhatian', text: 'Ahmad tampak kurang fokus pada 2 pertemuan terakhir. Perlu dikomunikasikan ke orang tua.', tags: ['fokus'], visible: false },
  { studentId: 'S003', tgl: '2026-05-05', kategori: 'perhatian', text: 'Bagas absen 3 kali dalam 2 minggu terakhir. Mohon orang tua memantau kehadiran.', tags: ['kehadiran'], visible: true },
  { studentId: 'S003', tgl: '2026-04-28', kategori: 'akademik', text: 'Nilai sumatif IPA di bawah KKM (58). Butuh program remediasi.', tags: ['ipa', 'sumatif', 'remedial'], visible: true },
  { studentId: 'S003', tgl: '2026-04-15', kategori: 'sosial', text: 'Bagas tampak menarik diri dari teman-teman. Perlu perhatian khusus dari wali kelas.', tags: ['sosial', 'observasi'], visible: false },
  { studentId: 'S004', tgl: '2026-05-08', kategori: 'positif', text: 'Dewi mendapat nilai tertinggi di kelas pada ulangan Bahasa Indonesia. Prestasi luar biasa!', tags: ['bahasa-indonesia', 'prestasi'], visible: true },
  { studentId: 'S004', tgl: '2026-04-22', kategori: 'akademik', text: 'Progres CP Matematika Dewi konsisten. Sudah menguasai 4 dari 6 CP yang ditargetkan semester ini.', tags: ['matematika', 'cp'], visible: true },
];

const ACTIVITY = [
  { time: '5 menit lalu', type: 'good', title: 'Penilaian Harian VIII-B tersimpan', desc: '24 dari 30 siswa mendapat nilai ≥ KKM (75)' },
  { time: '32 menit lalu', type: 'default', title: 'Jurnal mengajar VIII-A diperbarui', desc: 'Sistem Persamaan Linear — pertemuan ke-3' },
  { time: '1 jam lalu', type: 'warn', title: 'AI mendeteksi pola penurunan', desc: 'Rendra Wijaya: skor turun 18% di 2 minggu terakhir' },
  { time: '2 jam lalu', type: 'default', title: 'Impor data Quizizz selesai', desc: '4 file → 96 record nilai formatif' },
  { time: 'Kemarin', type: 'muted', title: 'Catatan perilaku ditambahkan', desc: 'Siti Nurhaliza — kontribusi luar biasa dalam diskusi kelompok' },
];

async function main() {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  console.log('Applying schema...');
  for (const stmt of schema.split(/;\s*$/m).map(s => s.trim()).filter(Boolean)) {
    await sql.query(stmt);
  }

  console.log('Seeding students...');
  for (const s of STUDENTS) {
    await sql`INSERT INTO students (id, nama, nis, kelas, jk, avatar_color, rerata, kehadiran, risiko, ortu, alamat, cp_matematika, cp_ipa, cp_ips, cp_bind, cp_bing, cp_pjok)
      VALUES (${s.id}, ${s.nama}, ${s.nis}, ${s.kelas}, ${s.jk}, ${s.avatar}, ${s.rerata}, ${s.kehadiran}, ${s.risiko}, ${s.ortu}, ${s.alamat}, ${s.cp.matematika}, ${s.cp.ipa}, ${s.cp.ips}, ${s.cp.bind}, ${s.cp.bing}, ${s.cp.pjok})`;
  }

  console.log('Seeding mapel...');
  for (let i = 0; i < MAPEL.length; i++) {
    const m = MAPEL[i];
    await sql`INSERT INTO mapel (kode, nama, icon, color, ord) VALUES (${m.kode}, ${m.nama}, ${m.icon}, ${m.color}, ${i})`;
  }

  console.log('Seeding cp_list...');
  for (let i = 0; i < CP_LIST.length; i++) {
    const c = CP_LIST[i];
    await sql`INSERT INTO cp_list (kode, nama, tp_count, mastered, ord) VALUES (${c.kode}, ${c.nama}, ${c.tp}, ${c.mastered}, ${i})`;
  }

  console.log('Seeding jadwal...');
  for (let i = 0; i < JADWAL.length; i++) {
    const j = JADWAL[i];
    await sql`INSERT INTO jadwal_hari_ini (waktu, mapel, kelas, topic, status, ruang, ord) VALUES (${j.waktu}, ${j.mapel}, ${j.kelas}, ${j.topic}, ${j.status}, ${j.ruang}, ${i})`;
  }

  console.log('Seeding kehadiran...');
  for (let i = 0; i < KEHADIRAN.length; i++) {
    const k = KEHADIRAN[i];
    await sql`INSERT INTO kehadiran_minggu (hari, hadir, izin, sakit, alpa, ord) VALUES (${k.hari}, ${k.hadir}, ${k.izin}, ${k.sakit}, ${k.alpa}, ${i})`;
  }

  console.log('Seeding insights...');
  for (let i = 0; i < INSIGHTS.length; i++) {
    const ins = INSIGHTS[i];
    await sql`INSERT INTO ai_insights (type, title, body, action, ord) VALUES (${ins.type}, ${ins.title}, ${ins.body}, ${ins.action}, ${i})`;
  }

  console.log('Seeding activity...');
  for (let i = 0; i < ACTIVITY.length; i++) {
    const a = ACTIVITY[i];
    await sql`INSERT INTO recent_activity (time_label, type, title, description, ord) VALUES (${a.time}, ${a.type}, ${a.title}, ${a.desc}, ${i})`;
  }

  console.log('Seeding parents...');
  for (const p of PARENTS) {
    const pw_hash = await bcrypt.hash(p.password, 10);
    const rows = await sql`INSERT INTO parents (email, pw_hash, nama) VALUES (${p.email}, ${pw_hash}, ${p.nama}) RETURNING id`;
    const parentId = rows[0].id as string;
    for (const studentId of p.studentIds) {
      await sql`INSERT INTO parent_students (parent_id, student_id) VALUES (${parentId}, ${studentId})`;
    }
  }

  console.log('Seeding catatan siswa...');
  for (const c of CATATAN) {
    await sql`INSERT INTO catatan_siswa (student_id, tgl, kategori, text, tags, visible_to_parent) VALUES (${c.studentId}, ${c.tgl}, ${c.kategori}, ${c.text}, ${c.tags}, ${c.visible})`;
  }

  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
