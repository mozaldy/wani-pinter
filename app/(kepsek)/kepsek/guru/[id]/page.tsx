import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { StatCard, StudentAvatar, Pill } from '@/components/ui';
import { getTeacherProfile, getTeacherClasses, getStudents } from '@/lib/queries';
import type { Student } from '@/lib/types';

const MAPEL_TO_CP: Record<string, keyof Student> = {
  'Matematika': 'cp_matematika',
  'IPA Terpadu': 'cp_ipa',
  'IPS Terpadu': 'cp_ips',
  'Bahasa Indonesia': 'cp_bind',
  'Bahasa Inggris': 'cp_bing',
  'PJOK': 'cp_pjok',
};

const MAPEL_COLOR: Record<string, string> = {
  'Matematika': '#4F46E5',
  'IPA Terpadu': '#10B981',
  'IPS Terpadu': '#F59E0B',
  'Bahasa Indonesia': '#EF4444',
  'Bahasa Inggris': '#06B6D4',
  'PJOK': '#EC4899',
};

function formatTgl(tgl: string | null) {
  if (!tgl) return '—';
  return new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function GuruDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [teacher, classes, allStudents] = await Promise.all([
    getTeacherProfile(id),
    getTeacherClasses(id),
    getStudents(),
  ]);

  if (!teacher) notFound();

  const totalEntri = teacher.total_bulan;
  const lastActive = teacher.terakhir_aktif;
  const statusAktif = teacher.total_minggu > 0;

  // Group classes by kelas so we can show all mapel for a kelas together
  const byKelas = new Map<string, typeof classes>();
  for (const c of classes) {
    if (!byKelas.has(c.kelas)) byKelas.set(c.kelas, []);
    byKelas.get(c.kelas)!.push(c);
  }
  const kelasEntries = Array.from(byKelas.entries()).sort(([a], [b]) => a.localeCompare(b));

  const uniqueKelas = Array.from(byKelas.keys());
  const taughtStudents = allStudents.filter(s => uniqueKelas.includes(s.kelas));

  const avgRerata = taughtStudents.length
    ? Math.round(taughtStudents.reduce((a, s) => a + s.rerata, 0) / taughtStudents.length)
    : 0;
  const berisiko = taughtStudents.filter(s => s.risiko !== 'rendah').length;

  return (
    <div className="screen-enter">
      {/* Header */}
      <div className="card flex gap-4 items-center mb-6">
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: 18,
        }}>{teacher.initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, letterSpacing: '-0.01em' }}>
            {teacher.nama}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            <Pill kind="ink">{teacher.jabatan}</Pill>
            <Pill kind="ink">{uniqueKelas.length} kelas</Pill>
            {statusAktif
              ? <Pill kind="good" dot>Aktif minggu ini</Pill>
              : <Pill kind="bad" dot>Tidak aktif</Pill>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="muted small">Terakhir aktif</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{formatTgl(lastActive)}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-3">
          <StatCard label="Entri jurnal (30 hari)" value={totalEntri} foot={`${teacher.total_minggu} entri minggu ini`} icon="clipboard" accent="#4F46E5" />
        </div>
        <div className="col-span-3">
          <StatCard label="Total siswa diajar" value={taughtStudents.length} foot={`${uniqueKelas.length} kelas aktif`} icon="users" accent="#06B6D4" />
        </div>
        <div className="col-span-3">
          <StatCard label="Rerata siswa" value={avgRerata} foot={avgRerata >= 75 ? 'Di atas KKM' : 'Di bawah KKM'} trend={avgRerata >= 75 ? 'up' : 'down'} icon="target" accent="#10B981" />
        </div>
        <div className="col-span-3">
          <StatCard label="Siswa berisiko" value={berisiko} foot="Perlu perhatian" icon="alert" accent="#EF4444" />
        </div>
      </div>

      {/* Per-class breakdown */}
      {kelasEntries.map(([kelas, mapelList]) => {
        const classStudents = allStudents.filter(s => s.kelas === kelas);
        return (
          <div key={kelas} style={{ marginBottom: 24 }}>
            {mapelList.map(({ mapel, entry_count }) => {
              const cpKey = MAPEL_TO_CP[mapel];
              const color = MAPEL_COLOR[mapel] || '#4F46E5';
              const classAvg = cpKey && classStudents.length
                ? Math.round(classStudents.reduce((a, s) => a + (s[cpKey] as number), 0) / classStudents.length)
                : null;
              const tuntas = cpKey
                ? classStudents.filter(s => (s[cpKey] as number) >= 75).length
                : 0;

              return (
                <div key={mapel} className="card" style={{ marginBottom: 16 }}>
                  <div className="card-title" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 4, height: 36, borderRadius: 2, background: color, flexShrink: 0 }} />
                      <div>
                        <h3 style={{ margin: 0 }}>{kelas} · {mapel}</h3>
                        <div className="tiny muted">{entry_count} entri jurnal</div>
                      </div>
                    </div>
                    {classAvg !== null && (
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className="tiny muted">Rerata kelas</div>
                          <div style={{ fontWeight: 700, fontSize: 20, color: classAvg >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>{classAvg}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="tiny muted">Tuntas KKM</div>
                          <div style={{ fontWeight: 700, fontSize: 20 }}>{tuntas}/{classStudents.length}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Siswa</th>
                        <th>Nilai {mapel}</th>
                        <th>Rerata keseluruhan</th>
                        <th>Kehadiran</th>
                        <th>Risiko</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents
                        .sort((a, b) => cpKey ? (b[cpKey] as number) - (a[cpKey] as number) : 0)
                        .map(s => {
                          const subjectScore = cpKey ? s[cpKey] as number : null;
                          return (
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
                              <td>
                                {subjectScore !== null ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <strong style={{ color: subjectScore >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>
                                      {subjectScore}
                                    </strong>
                                    <div style={{ flex: 1, height: 6, background: 'var(--color-surface-2)', borderRadius: 3, maxWidth: 80 }}>
                                      <div style={{ height: '100%', width: `${subjectScore}%`, background: subjectScore >= 75 ? color : 'var(--color-bad)', borderRadius: 3 }} />
                                    </div>
                                  </div>
                                ) : '—'}
                              </td>
                              <td>
                                <strong style={{ color: s.rerata >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>
                                  {s.rerata}
                                </strong>
                              </td>
                              <td>{s.kehadiran}%</td>
                              <td>
                                <Pill kind={s.risiko === 'rendah' ? 'good' : s.risiko === 'sedang' ? 'warn' : 'bad'} dot>
                                  {s.risiko}
                                </Pill>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
