import { Icon } from '@/components/Icon';
import { StatCard } from '@/components/ui';
import { KurikulumExpander } from '@/components/KurikulumExpander';
import { getCPList } from '@/lib/queries';

export default async function KurikulumPage() {
  const cps = await getCPList();
  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>Kurikulum</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            Kurikulum Merdeka · Fase D (Kelas VII–IX) · Matematika · 2025/2026
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline"><Icon name="download" size={14} /> Unduh ATP</button>
          <button className="btn btn-primary"><Icon name="edit" size={14} /> Edit ATP</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3"><StatCard label="Total CP" value="8" foot="Fase D · Matematika" icon="layers" accent="#4F46E5" /></div>
        <div className="col-span-3"><StatCard label="Total TP" value="34" foot="rerata 4.2 per CP" icon="target" accent="#06B6D4" /></div>
        <div className="col-span-3"><StatCard label="Tuntas" value="58%" foot="dari target 80% sem-2" icon="check" accent="#10B981" /></div>
        <div className="col-span-3"><StatCard label="Estimasi selesai" value="14 Jun" foot="berdasarkan tren" icon="calendar" accent="#F59E0B" /></div>
      </div>

      <div className="card mb-4">
        <div className="card-title">
          <h3>Roadmap semester · Alur Tujuan Pembelajaran</h3>
          <span className="sub">Drag untuk mengubah urutan</span>
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
          <div style={{ display: 'flex', gap: 12, minWidth: 'max-content', position: 'relative' }}>
            {cps.map((cp, i) => {
              const c = cp.mastered >= 80 ? 'var(--color-good)' : cp.mastered >= 50 ? 'var(--color-warn)' : cp.mastered === 0 ? 'var(--color-line)' : 'var(--color-bad)';
              const dotC = cp.mastered === 0 ? 'var(--color-ink-4)' : c;
              return (
                <div key={cp.kode} style={{
                  width: 200, padding: 14, border: `2px solid ${c}`,
                  borderRadius: 14, background: 'var(--color-surface)', position: 'relative', flexShrink: 0,
                }}>
                  <div style={{ position: 'absolute', top: -10, left: 12, background: dotC, color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{i + 1}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', marginBottom: 4 }}>{cp.kode}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, lineHeight: 1.3 }}>{cp.nama}</div>
                  <div className="flex justify-between tiny muted mb-2">
                    <span>{cp.tp_count} TP</span>
                    <span style={{ fontWeight: 700, color: cp.mastered >= 80 ? 'var(--color-good)' : cp.mastered >= 50 ? 'var(--color-warn)' : 'var(--color-bad)' }}>
                      {cp.mastered}%
                    </span>
                  </div>
                  <div className="bar-track" style={{ height: 4 }}>
                    <div className="bar-fill" style={{ width: `${cp.mastered}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <div className="card">
            <div className="card-title"><h3>Detail CP & Tujuan Pembelajaran</h3></div>
            <KurikulumExpander cps={cps} />
          </div>
        </div>

        <div className="col-span-5 flex flex-col gap-4">
          <div className="ai-card">
            <div className="ai-badge">
              <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
              Saran penyesuaian ATP
            </div>
            <div className="ai-text">
              Berdasarkan kemajuan kelas, saya menyarankan <strong>memindahkan CP-MTK-8.7 (Statistika)</strong> sebelum CP-MTK-8.6 — siswa lebih siap dengan konsep konkret data nyata sekolah dibanding bangun ruang abstrak. Estimasi penyelesaian membaik 9 hari.
            </div>
            <div className="flex gap-2" style={{ marginTop: 12 }}>
              <button className="btn btn-primary"><Icon name="check" size={13} /> Terapkan saran</button>
              <button className="btn btn-ghost">Lihat dampak</button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <h3>Dimensi P5</h3>
              <span className="sub">Profil Pelajar Pancasila</span>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { d: 'Beriman, bertaqwa, berakhlak mulia', p: 78, c: '#10B981' },
                { d: 'Berkebinekaan global', p: 65, c: '#F59E0B' },
                { d: 'Bergotong-royong', p: 88, c: '#4F46E5' },
                { d: 'Mandiri', p: 72, c: '#06B6D4' },
                { d: 'Bernalar kritis', p: 81, c: '#EC4899' },
                { d: 'Kreatif', p: 76, c: '#8B5CF6' },
              ].map(p => (
                <div key={p.d} className="bar-row" style={{ gridTemplateColumns: '1fr 70px 36px' }}>
                  <span className="small">{p.d}</span>
                  <div className="bar-track">
                    <div style={{ width: `${p.p}%`, height: '100%', background: p.c, borderRadius: 999 }} />
                  </div>
                  <span className="tiny" style={{ textAlign: 'right', fontWeight: 700, color: p.c }}>{p.p}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
