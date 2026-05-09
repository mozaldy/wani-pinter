import { headers } from 'next/headers';
import { Icon } from '@/components/Icon';
import { StatCard, StudentAvatar, Pill } from '@/components/ui';
import { getStudents } from '@/lib/queries';
import type { Student } from '@/lib/types';

function groupByKelas(students: Student[]) {
  const map = new Map<string, Student[]>();
  for (const s of students) {
    if (!map.has(s.kelas)) map.set(s.kelas, []);
    map.get(s.kelas)!.push(s);
  }
  return Array.from(map.entries()).map(([kelas, list]) => ({
    kelas,
    jumlah: list.length,
    rerata: Math.round(list.reduce((a, s) => a + s.rerata, 0) / list.length),
    kehadiran: Math.round(list.reduce((a, s) => a + s.kehadiran, 0) / list.length),
    berisiko: list.filter(s => s.risiko !== 'rendah').length,
  })).sort((a, b) => a.kelas.localeCompare(b.kelas));
}

export default async function KepsekDashboardPage() {
  const [students, hdrs] = await Promise.all([getStudents(), headers()]);

  const nama = hdrs.get('x-user-nama') || 'Kepala Sekolah';
  const firstName = nama.split(' ')[0].replace(',', '');

  const totalSiswa = students.length;
  const rerataSekolah = Math.round(students.reduce((a, s) => a + s.rerata, 0) / students.length);
  const siswaBerisiko = students.filter(s => s.risiko === 'tinggi').length;
  const rerataKehadiran = Math.round(students.reduce((a, s) => a + s.kehadiran, 0) / students.length);

  const kelasList = groupByKelas(students);
  const atRisk = students.filter(s => s.risiko !== 'rendah').sort((a, b) => a.rerata - b.rerata);

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26, lineHeight: 1.1 }}>
            Selamat pagi, {firstName} ☀️
          </h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            Ringkasan mutu pembelajaran SDN 1 Keputran Surabaya
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3"><StatCard label="Total Siswa" value={totalSiswa} foot="Seluruh kelas aktif" icon="users" accent="#4F46E5" /></div>
        <div className="col-span-3"><StatCard label="Rerata Sekolah" value={rerataSekolah} foot="Nilai agregat semua kelas" icon="target" accent="#10B981" /></div>
        <div className="col-span-3"><StatCard label="Siswa Berisiko" value={siswaBerisiko} foot="Perlu intervensi segera" icon="alert" accent="#EF4444" /></div>
        <div className="col-span-3"><StatCard label="Rerata Kehadiran" value={`${rerataKehadiran}%`} foot="Rata-rata semua kelas" icon="pulse" accent="#06B6D4" /></div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-8">
          <div className="card">
            <div className="card-title">
              <h3>Rekap per kelas</h3>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Kelas</th><th>Jumlah Siswa</th><th>Rerata Nilai</th><th>Kehadiran</th><th>Berisiko</th>
                </tr>
              </thead>
              <tbody>
                {kelasList.map(k => (
                  <tr key={k.kelas}>
                    <td><strong>{k.kelas}</strong></td>
                    <td>{k.jumlah} siswa</td>
                    <td>
                      <strong style={{ color: k.rerata >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>
                        {k.rerata}
                      </strong>
                    </td>
                    <td>{k.kehadiran}%</td>
                    <td>
                      {k.berisiko > 0
                        ? <Pill kind="bad" dot>{k.berisiko} siswa</Pill>
                        : <Pill kind="good">—</Pill>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-4">
          <div className="ai-card">
            <div className="ai-badge">
              <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
              Wani AI · Ringkasan sekolah
            </div>
            <div className="ai-text">
              Rerata sekolah <strong>{rerataSekolah}</strong> — {rerataSekolah >= 75 ? 'di atas KKM' : 'di bawah KKM'}. Terdapat <strong>{siswaBerisiko} siswa berisiko tinggi</strong> yang membutuhkan intervensi segera. Tingkat kehadiran <strong>{rerataKehadiran}%</strong>.
            </div>
          </div>
        </div>
      </div>

      {atRisk.length > 0 && (
        <div className="card">
          <div className="card-title">
            <h3>Siswa perlu perhatian</h3>
            <span className="sub">{atRisk.length} siswa dengan risiko sedang atau tinggi</span>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Siswa</th><th>Kelas</th><th>Rerata</th><th>Kehadiran</th><th>Risiko</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <StudentAvatar student={s} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{s.nama}</div>
                        <div className="tiny muted">{s.nis}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.kelas}</td>
                  <td><strong style={{ color: s.rerata >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>{s.rerata}</strong></td>
                  <td>{s.kehadiran}%</td>
                  <td><Pill kind={s.risiko === 'tinggi' ? 'bad' : 'warn'} dot>{s.risiko}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
