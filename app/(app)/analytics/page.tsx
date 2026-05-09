import Link from 'next/link';
import { Icon, type IconName } from '@/components/Icon';
import { Pill, StatCard, Sparkline, StudentAvatar } from '@/components/ui';
import { HeatmapClient } from '@/components/HeatmapClient';
import { getStudents, getCPList, getMapel, getHeatmap } from '@/lib/queries';

const KELAS_LIST = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A'];

export default async function AnalyticsPage() {
  const [students, cps, mapel, heatmap] = await Promise.all([
    getStudents(), getCPList(), getMapel(), getHeatmap(),
  ]);

  const mapelKeyMap: Record<string, keyof typeof students[0]> = {
    MTK: 'cp_matematika', IPA: 'cp_ipa', IPS: 'cp_ips',
    BIND: 'cp_bind', BING: 'cp_bing', PJOK: 'cp_pjok',
  };

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>Analitik Pembelajaran</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            Profil 360° · Gap analysis baseline → aktual → target · Prediksi risiko
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="seg">
            {KELAS_LIST.map(k => (
              <button key={k} className={`seg-btn ${k === 'VIII-A' ? 'active' : ''}`}>{k}</button>
            ))}
          </div>
          <button className="btn btn-outline"><Icon name="download" size={14} /> Ekspor</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3"><StatCard label="Tuntas Capaian (CP)" value="58%" foot="dari 8 CP semester ini" trend="up" icon="target" accent="#10B981" /></div>
        <div className="col-span-3"><StatCard label="Gap Belajar Terbesar" value="Statistika" foot="hanya 22% tuntas TP-3" icon="alert" accent="#F59E0B" /></div>
        <div className="col-span-3"><StatCard label="Siswa Berisiko Tinggi" value="3" foot="prediksi tidak tuntas semester" icon="flame" accent="#EF4444" /></div>
        <div className="col-span-3"><StatCard label="Skor Diferensiasi" value="A−" foot="strategi Anda efektif" trend="up" icon="star" accent="#4F46E5" /></div>
      </div>

      <div className="card mb-4">
        <div className="card-title">
          <div>
            <h3>Heatmap Penguasaan CP · VIII-A</h3>
            <div className="muted small" style={{ marginTop: 2 }}>Hover sel untuk detail · Skala 0 (belum dinilai) → 5 (mahir)</div>
          </div>
          <div className="flex gap-1 tiny muted items-center">
            <span>Skala:</span>
            {[0, 1, 2, 3, 4, 5].map(v => (
              <div key={v} className={`heat-${v}`} style={{ width: 18, height: 18, borderRadius: 3, fontSize: 9, display: 'grid', placeItems: 'center', fontWeight: 700 }}>{v}</div>
            ))}
          </div>
        </div>
        <HeatmapClient cps={cps} rows={heatmap} />
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-7">
          <div className="card">
            <div className="card-title">
              <h3>Gap Analysis · Penguasaan vs Target</h3>
              <span className="sub">Target tuntas: 80% per CP</span>
            </div>
            <div className="flex flex-col gap-1">
              {cps.map(cp => (
                <div key={cp.kode} className="bar-row">
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-ink)' }}>{cp.nama}</div>
                    <div className="tiny muted">{cp.kode} · {cp.tp_count} TP</div>
                  </div>
                  <div className="bar-track" style={{ position: 'relative' }}>
                    <div className="bar-fill" style={{
                      width: `${cp.mastered}%`,
                      background: cp.mastered >= 80 ? 'linear-gradient(90deg, #10B981, #34D399)'
                        : cp.mastered >= 50 ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                        : 'linear-gradient(90deg, #EF4444, #F87171)',
                    }} />
                    <div title="Target 80%" style={{ position: 'absolute', left: '80%', top: -3, bottom: -3, width: 2, background: 'var(--color-ink-3)', borderRadius: 1 }} />
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 13, color: cp.mastered >= 80 ? 'var(--color-good)' : cp.mastered >= 50 ? 'var(--color-warn)' : 'var(--color-bad)' }}>
                    {cp.mastered}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-5 flex flex-col gap-4">
          {[
            { type: 'risk', title: '3 siswa berisiko tidak tuntas pada CP-MTK-8.5 (Lingkaran)', body: 'Bagas, Rendra, dan Galih menunjukkan kesulitan konsisten pada konsep busur dan juring.', action: 'Lihat rencana intervensi' },
            { type: 'gap', title: 'Gap belajar terbesar: Statistika (TP-3)', body: 'Hanya 22% kelas VIII-A telah menuntaskan TP-3.', action: 'Buat sesi remedial' },
            { type: 'win', title: '87% siswa tuntas Bilangan Berpangkat', body: 'Kelas VIII-A melampaui target untuk CP-MTK-8.1.', action: 'Bagikan ke rekan guru' },
          ].map((ins, i) => (
            <div key={i} className="ai-card" style={{
              background: ins.type === 'risk' ? 'linear-gradient(135deg, #FEF2F2, #FEE2E2)'
                : ins.type === 'win' ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)'
                : 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
              borderColor: ins.type === 'risk' ? '#FCA5A5' : ins.type === 'win' ? '#86EFAC' : '#FDE68A',
            }}>
              <div className="ai-badge" style={{ color: ins.type === 'risk' ? 'var(--color-bad)' : ins.type === 'win' ? 'var(--color-good)' : '#B45309' }}>
                <span className="ai-glyph" style={{ background: ins.type === 'risk' ? 'var(--color-bad)' : ins.type === 'win' ? 'var(--color-good)' : 'var(--color-warn)' }}>
                  <Icon name={ins.type === 'risk' ? 'alert' : ins.type === 'win' ? 'star' : 'sparkle'} size={10} />
                </span>
                {ins.type === 'risk' ? 'Peringatan' : ins.type === 'win' ? 'Pencapaian' : 'Rekomendasi'}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--color-ink)', marginBottom: 6 }}>{ins.title}</div>
              <div className="ai-text" style={{ fontSize: 12.5, color: 'var(--color-ink-2)' }}>{ins.body}</div>
              <button className="btn btn-ghost" style={{ marginTop: 10, paddingLeft: 0 }}>
                {ins.action} <Icon name="arrowR" size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <div className="card">
            <div className="card-title">
              <h3>Profil mata pelajaran · Rerata kelas VIII-A</h3>
              <button className="btn btn-ghost small">Detail</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {mapel.map(m => {
                const key = mapelKeyMap[m.kode];
                const avg = Math.round(students.reduce((sum, s) => sum + ((s[key] as number) ?? 0), 0) / students.length);
                return (
                  <div key={m.kode} style={{ padding: 14, border: '1px solid var(--color-line)', borderRadius: 12, background: 'var(--color-surface)' }}>
                    <div className="flex justify-between mb-2">
                      <div className="flex gap-2 items-center">
                        <span style={{ width: 28, height: 28, borderRadius: 8, background: `${m.color}15`, color: m.color, display: 'grid', placeItems: 'center' }}>
                          <Icon name={m.icon as IconName} size={14} />
                        </span>
                        <div className="small" style={{ fontWeight: 600 }}>{m.nama}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <div className="h-display" style={{ fontSize: 24, fontWeight: 600 }}>{avg}</div>
                      <div className="tiny muted">/100</div>
                    </div>
                    <div style={{ height: 4, background: 'var(--color-surface-2)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${avg}%`, height: '100%', background: m.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-5">
          <div className="card">
            <div className="card-title">
              <h3>Prediksi risiko semester</h3>
              <span className="sub">Berdasarkan tren 6 minggu</span>
            </div>
            <div className="flex flex-col gap-3">
              {students.filter(s => s.risiko !== 'rendah').map(s => (
                <Link key={s.id} href={`/siswa/${s.id}`} style={{
                  display: 'flex', gap: 12, alignItems: 'center', padding: 10, borderRadius: 10,
                  background: s.risiko === 'tinggi' ? 'var(--color-bad-soft)' : 'var(--color-warn-soft)',
                }}>
                  <StudentAvatar student={s} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.nama}</div>
                    <div className="tiny muted">Rerata {s.rerata} · Hadir {s.kehadiran}%</div>
                  </div>
                  <div style={{ width: 80 }}>
                    <Sparkline data={[80, 76, 72, 68, 65, s.rerata]} color={s.risiko === 'tinggi' ? '#EF4444' : '#F59E0B'} />
                  </div>
                  <Pill kind={s.risiko === 'tinggi' ? 'bad' : 'warn'} dot>{s.risiko}</Pill>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
