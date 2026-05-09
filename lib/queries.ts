import { sql } from './db';
import type { Student, Mapel, CP, Jadwal, Kehadiran, AIInsight, Activity, HeatmapRow, CatatanSiswa } from './types';

export async function getStudents(): Promise<Student[]> {
  return (await sql`SELECT * FROM students ORDER BY id`) as Student[];
}

export async function getStudent(id: string): Promise<Student | null> {
  const rows = (await sql`SELECT * FROM students WHERE id = ${id}`) as Student[];
  return rows[0] || null;
}

export async function getMapel(): Promise<Mapel[]> {
  return (await sql`SELECT kode, nama, icon, color FROM mapel ORDER BY ord`) as Mapel[];
}

export async function getCPList(): Promise<CP[]> {
  return (await sql`SELECT kode, nama, tp_count, mastered FROM cp_list ORDER BY ord`) as CP[];
}

export async function getJadwal(): Promise<Jadwal[]> {
  return (await sql`SELECT id, waktu, mapel, kelas, topic, status, ruang FROM jadwal_hari_ini ORDER BY ord`) as Jadwal[];
}

export async function getKehadiran(): Promise<Kehadiran[]> {
  return (await sql`SELECT hari, hadir, izin, sakit, alpa FROM kehadiran_minggu ORDER BY ord`) as Kehadiran[];
}

export async function getInsights(): Promise<AIInsight[]> {
  return (await sql`SELECT id, type, title, body, action FROM ai_insights ORDER BY ord`) as AIInsight[];
}

export async function getActivity(): Promise<Activity[]> {
  return (await sql`SELECT id, time_label, type, title, description FROM recent_activity ORDER BY ord`) as Activity[];
}

export async function getParentStudentIds(parentId: string): Promise<string[]> {
  const rows = await sql`SELECT student_id FROM parent_students WHERE parent_id = ${parentId}`;
  return rows.map(r => r.student_id as string);
}

export async function getStudentForParent(studentId: string): Promise<Student | null> {
  const rows = (await sql`SELECT * FROM students WHERE id = ${studentId}`) as Student[];
  return rows[0] || null;
}

export async function assertParentOwnsStudent(parentId: string, studentId: string): Promise<boolean> {
  const rows = await sql`SELECT 1 FROM parent_students WHERE parent_id = ${parentId} AND student_id = ${studentId}`;
  return rows.length > 0;
}

export async function getCatatanForParent(studentId: string): Promise<CatatanSiswa[]> {
  return (await sql`
    SELECT id, student_id, tgl::text, kategori, text, tags, visible_to_parent
    FROM catatan_siswa
    WHERE student_id = ${studentId} AND visible_to_parent = TRUE
    ORDER BY tgl DESC
    LIMIT 10
  `) as CatatanSiswa[];
}

export type TeacherActivity = {
  id: string;
  nama: string;
  initials: string;
  jabatan: string;
  total_bulan: number;
  total_minggu: number;
  terakhir_aktif: string | null;
};

export async function getTeacherProfile(userId: string): Promise<TeacherActivity | null> {
  const rows = await sql`
    SELECT
      u.id, u.nama, u.initials, u.jabatan,
      COUNT(j.id)::int                                                     AS total_bulan,
      COUNT(j.id) FILTER (WHERE j.tgl >= CURRENT_DATE - 7)::int            AS total_minggu,
      MAX(j.tgl)::text                                                     AS terakhir_aktif
    FROM users u
    LEFT JOIN jurnal_entries j
      ON j.user_id = u.id AND j.tgl >= CURRENT_DATE - 30
    WHERE u.id = ${userId} AND u.role = 'guru'
    GROUP BY u.id, u.nama, u.initials, u.jabatan
  `;
  return (rows[0] as TeacherActivity) || null;
}

export type TeacherClass = { kelas: string; mapel: string; entry_count: number };

export async function getTeacherClasses(userId: string): Promise<TeacherClass[]> {
  return (await sql`
    SELECT kelas, mapel, COUNT(*)::int AS entry_count
    FROM jurnal_entries
    WHERE user_id = ${userId}
    GROUP BY kelas, mapel
    ORDER BY kelas, mapel
  `) as TeacherClass[];
}

export async function getTeacherActivity(): Promise<TeacherActivity[]> {
  return (await sql`
    SELECT
      u.id, u.nama, u.initials, u.jabatan,
      COUNT(j.id)::int                                                     AS total_bulan,
      COUNT(j.id) FILTER (WHERE j.tgl >= CURRENT_DATE - 7)::int            AS total_minggu,
      MAX(j.tgl)::text                                                     AS terakhir_aktif
    FROM users u
    LEFT JOIN jurnal_entries j
      ON j.user_id = u.id AND j.tgl >= CURRENT_DATE - 30
    WHERE u.role = 'guru'
    GROUP BY u.id, u.nama, u.initials, u.jabatan
    ORDER BY u.nama
  `) as TeacherActivity[];
}

export async function getHeatmap(): Promise<HeatmapRow[]> {
  const [students, cps] = await Promise.all([getStudents(), getCPList()]);
  const cps8 = cps.slice(0, 8);
  return students.map(s => ({
    student: s,
    cells: cps8.map((cp, i) => {
      const base = (s.rerata - 50) / 10;
      const noise = ((s.id.charCodeAt(3) + i * 7) % 5) - 2;
      let v = Math.max(0, Math.min(5, Math.round(base + noise * 0.7)));
      if (i === 7) v = 0;
      if (i === 6 && s.rerata < 75) v = Math.min(2, v);
      return { cp: cp.kode, value: v };
    }),
  }));
}
