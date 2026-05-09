import Link from 'next/link';
import { StatCard, Pill } from '@/components/ui';
import { getTeacherActivity, type TeacherActivity } from '@/lib/queries';

function getStatus(t: TeacherActivity): 'aktif' | 'perhatian' | 'tidak-aktif' {
  if (t.total_minggu > 0) return 'aktif';
  if (t.terakhir_aktif) {
    const days = Math.floor((Date.now() - new Date(t.terakhir_aktif).getTime()) / 86400000);
    if (days <= 14) return 'perhatian';
  }
  return 'tidak-aktif';
}

function formatTgl(tgl: string | null) {
  if (!tgl) return '—';
  return new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function KepsekGuruPage() {
  const teachers = await getTeacherActivity();

  const aktif = teachers.filter(t => getStatus(t) === 'aktif').length;
  const perhatian = teachers.filter(t => getStatus(t) === 'perhatian').length;
  const tidakAktif = teachers.filter(t => getStatus(t) === 'tidak-aktif').length;

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>Monitoring Guru</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            Aktivitas jurnal mengajar {teachers.length} guru · 30 hari terakhir
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-4">
          <StatCard label="Aktif minggu ini" value={aktif} foot="Jurnal dikumpulkan 7 hari terakhir" icon="check" accent="#10B981" />
        </div>
        <div className="col-span-4">
          <StatCard label="Perlu perhatian" value={perhatian} foot="Tidak aktif 8–14 hari" icon="alert" accent="#F59E0B" />
        </div>
        <div className="col-span-4">
          <StatCard label="Tidak aktif" value={tidakAktif} foot="Tidak aktif lebih dari 14 hari" icon="x" accent="#EF4444" />
        </div>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Guru</th>
              <th>Jabatan</th>
              <th>Entri bulan ini</th>
              <th>Entri minggu ini</th>
              <th>Terakhir aktif</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => {
              const status = getStatus(t);
              return (
                <tr key={t.id} style={{ cursor: 'pointer' }}>
                  <td>
                    <Link href={`/kepsek/guru/${t.id}`} className="flex items-center gap-3">
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        display: 'grid', placeItems: 'center',
                        color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0,
                      }}>{t.initials}</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{t.nama}</div>
                    </Link>
                  </td>
                  <td className="muted">{t.jabatan}</td>
                  <td><strong>{t.total_bulan}</strong> entri</td>
                  <td>
                    <strong style={{ color: t.total_minggu > 0 ? 'var(--color-good)' : 'var(--color-bad)' }}>
                      {t.total_minggu}
                    </strong> entri
                  </td>
                  <td className="muted">{formatTgl(t.terakhir_aktif)}</td>
                  <td>
                    {status === 'aktif' && <Pill kind="good" dot>Aktif</Pill>}
                    {status === 'perhatian' && <Pill kind="warn" dot>Perlu perhatian</Pill>}
                    {status === 'tidak-aktif' && <Pill kind="bad" dot>Tidak aktif</Pill>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
