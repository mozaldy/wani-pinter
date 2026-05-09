import { Icon } from '@/components/Icon';
import { Pill } from '@/components/ui';
import { AdminTabs } from '@/components/AdminTabs';
import { getStudents, getCPList, getMapel } from '@/lib/queries';

export default async function AdminPage() {
  const [students, cps, mapel] = await Promise.all([getStudents(), getCPList(), getMapel()]);
  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>Master Data</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            Kelola data siswa, kurikulum, dan integrasi sumber eksternal
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline"><Icon name="download" size={14} /> Ekspor CSV</button>
          <button className="btn btn-primary"><Icon name="upload" size={14} /> Impor data</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        {[
          { l: 'Dapodik', s: 'Tersinkron', d: '156 siswa · 6 kelas', last: 'Terakhir: 2 jam lalu', color: 'var(--color-good)', kind: 'good' as const },
          { l: 'Quizizz', s: 'Aktif', d: '96 record nilai formatif', last: 'Auto-impor harian', color: 'var(--color-good)', kind: 'good' as const },
          { l: 'Google Forms', s: 'Perlu otorisasi', d: '12 form terdeteksi', last: 'Klik untuk hubungkan', color: 'var(--color-warn)', kind: 'warn' as const },
          { l: 'Excel Internal', s: 'Manual', d: 'Drag & drop file', last: 'Format: .xlsx, .csv', color: 'var(--color-ink-4)', kind: 'ink' as const },
        ].map((c, i) => (
          <div key={i} className="col-span-3">
            <div className="card" style={{ borderLeft: `3px solid ${c.color}` }}>
              <div className="flex justify-between mb-2">
                <span className="small" style={{ fontWeight: 600 }}>{c.l}</span>
                <Pill kind={c.kind} dot={c.kind !== 'ink'}>{c.s}</Pill>
              </div>
              <div className="tiny muted">{c.d}</div>
              <div className="tiny muted" style={{ marginTop: 4 }}>{c.last}</div>
            </div>
          </div>
        ))}
      </div>

      <AdminTabs students={students} cps={cps} mapel={mapel} />
    </div>
  );
}
