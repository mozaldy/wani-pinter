import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { Pill, StatCard, Sparkline, StudentAvatar } from '@/components/ui';
import { QuickInputButton, OpenAIButton } from '@/components/QuickInputButton';
import { getStudents, getJadwal, getActivity, getKehadiran } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';

export default async function DashboardPage() {
  const [students, jadwal, activity, kehadiran] = await Promise.all([
    getStudents(), getJadwal(), getActivity(), getKehadiran(),
  ]);
  const dict = await getDictionary();

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26, lineHeight: 1.1 }}>
            {dict.dashboard.greeting}
          </h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            {dict.dashboard.dateLine}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline"><Icon name="calendar" size={15} /> {dict.dashboard.dateChip}</button>
          <QuickInputButton primary><Icon name="plus" size={15} /> {dict.dashboard.quickInput}</QuickInputButton>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3"><StatCard label={dict.dashboard.statTotalSiswa} value="156" foot={dict.dashboard.statTotalSiswaFoot} icon="users" accent="#4F46E5" /></div>
        <div className="col-span-3"><StatCard label={dict.dashboard.statTuntasKkm} value="84%" foot={dict.dashboard.statTuntasKkmFoot} trend="up" icon="target" accent="#10B981" /></div>
        <div className="col-span-3"><StatCard label={dict.dashboard.statBerisiko} value="12" foot={dict.dashboard.statBerisikoFoot} icon="alert" accent="#EF4444" /></div>
        <div className="col-span-3"><StatCard label={dict.dashboard.statKehadiran} value="92%" foot={dict.dashboard.statKehadiranFoot} icon="pulse" accent="#06B6D4" /></div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-8 flex flex-col gap-4">
          <div className="card">
            <div className="card-title">
              <h3>{dict.dashboard.jadwalTitle}</h3>
              <div className="flex gap-2">
                <Pill kind="good" dot>{dict.dashboard.pillSelesai}</Pill>
                <Pill kind="primary" dot>{dict.dashboard.pillAktif}</Pill>
                <Pill kind="ink">{dict.dashboard.pillMendatang}</Pill>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {jadwal.map(j => (
                <div key={j.id} style={{
                  display: 'grid', gridTemplateColumns: '120px 1fr auto',
                  gap: 16, padding: '14px 16px', borderRadius: 12,
                  border: `1px solid ${j.status === 'aktif' ? 'var(--color-primary)' : 'var(--color-line)'}`,
                  background: j.status === 'aktif' ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: j.status === 'aktif' ? 'var(--color-primary)' : 'var(--color-ink-2)' }}>{j.waktu}</div>
                    <div className="tiny muted">{j.ruang}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{j.mapel} · {j.kelas}</div>
                    <div className="muted small">{j.topic}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {j.status === 'selesai' && <Pill kind="good" dot>{dict.enums.status.selesai}</Pill>}
                    {j.status === 'aktif' && (<>
                      <Pill kind="primary" dot>{dict.enums.status.aktif}</Pill>
                      <QuickInputButton primary>{dict.dashboard.inputJurnal}</QuickInputButton>
                    </>)}
                    {j.status === 'mendatang' && <button className="btn btn-ghost"><Icon name="chevR" size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <h3>{dict.dashboard.aksiCepatTitle}</h3>
              <span className="sub">{dict.dashboard.aksiCepatSub}</span>
            </div>
            <div className="quick-input">
              <QuickInputButton className="">
                <span className="qi-icon"><Icon name="clipboard" size={16} /></span>
                <span className="qi-title">{dict.dashboard.qiJurnalTitle}</span>
                <span className="qi-desc">{dict.dashboard.qiJurnalDesc}</span>
              </QuickInputButton>
              <button>
                <span className="qi-icon"><Icon name="edit" size={16} /></span>
                <span className="qi-title">{dict.dashboard.qiPenilaianTitle}</span>
                <span className="qi-desc">{dict.dashboard.qiPenilaianDesc}</span>
              </button>
              <button>
                <span className="qi-icon"><Icon name="mic" size={16} /></span>
                <span className="qi-title">{dict.dashboard.qiCatatanTitle}</span>
                <span className="qi-desc">{dict.dashboard.qiCatatanDesc}</span>
              </button>
              <button>
                <span className="qi-icon"><Icon name="upload" size={16} /></span>
                <span className="qi-title">{dict.dashboard.qiImporTitle}</span>
                <span className="qi-desc">{dict.dashboard.qiImporDesc}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-4">
          <div className="ai-card">
            <div className="ai-badge">
              <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
              {dict.dashboard.aiSummaryBadge}
            </div>
            <div className="ai-text">
              <strong>3 siswa</strong> butuh perhatian di kelas berikutnya (VIII-B). Nilai formatif <strong>Bagas</strong> turun 18% — pertimbangkan pasangkan dengan <strong>Siti</strong> untuk peer learning saat sesi Sistem Persamaan Linear.
            </div>
            <div className="flex gap-2" style={{ marginTop: 14 }}>
              <OpenAIButton><Icon name="sparkle" size={13} /> {dict.dashboard.lihatDetail}</OpenAIButton>
              <button className="btn btn-ghost">{dict.dashboard.lewati}</button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <h3>{dict.dashboard.aktivitasTerbaru}</h3>
              <button className="btn btn-ghost small">{dict.dashboard.semua}</button>
            </div>
            <div className="timeline">
              {activity.map(a => (
                <div key={a.id} className={`timeline-item ${a.type === 'default' ? '' : a.type}`}>
                  <div className="timeline-time">{a.time_label}</div>
                  <div className="timeline-title">{a.title}</div>
                  <div className="timeline-desc">{a.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <div className="card">
            <div className="card-title">
              <h3>{interpolate(dict.dashboard.classSummaryTitle, { kelas: 'VIII-A' })}</h3>
              <div className="seg">
                <button className="seg-btn active">{dict.dashboard.semua}</button>
                <button className="seg-btn">{dict.dashboard.segBerisiko}</button>
                <button className="seg-btn">{dict.dashboard.segBerprestasi}</button>
              </div>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>{dict.dashboard.colSiswa}</th><th>{dict.dashboard.colRerata}</th><th>{dict.dashboard.colKehadiran}</th>
                  <th>{dict.dashboard.colTren}</th><th>{dict.dashboard.colRisiko}</th><th></th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 6).map(s => (
                  <tr key={s.id} style={{ cursor: 'pointer' }}>
                    <td>
                      <Link href={`/siswa/${s.id}`} className="flex items-center gap-3">
                        <StudentAvatar student={s} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{s.nama}</div>
                          <div className="tiny muted">{s.nis} · {dict.enums.jk[s.jk]}</div>
                        </div>
                      </Link>
                    </td>
                    <td><strong style={{ color: s.rerata >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>{s.rerata}</strong></td>
                    <td>{s.kehadiran}%</td>
                    <td style={{ width: 110 }}>
                      <Sparkline data={[60, 65, 72, 68, 75, s.rerata]} color={s.rerata >= 75 ? '#10B981' : '#EF4444'} />
                    </td>
                    <td><Pill kind={s.risiko === 'rendah' ? 'good' : s.risiko === 'sedang' ? 'warn' : 'bad'} dot>{dict.enums.risiko[s.risiko]}</Pill></td>
                    <td><Icon name="chevR" size={14} style={{ color: 'var(--color-ink-4)' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card">
            <div className="card-title">
              <h3>{dict.dashboard.presensiTitle}</h3>
              <span className="sub">{dict.dashboard.presensiSub}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, padding: '12px 0 8px' }}>
              {kehadiran.map(d => {
                const total = d.hadir + d.izin + d.sakit + d.alpa;
                return (
                  <div key={d.hari} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: 1, gap: 1 }}>
                      <div title={dict.dashboard.legendAlpa} style={{ height: `${(d.alpa / total) * 100}%`, background: 'var(--color-bad)', minHeight: d.alpa ? 4 : 0 }} />
                      <div title={dict.dashboard.legendSakit} style={{ height: `${(d.sakit / total) * 100}%`, background: 'var(--color-warn)', minHeight: d.sakit ? 4 : 0 }} />
                      <div title={dict.dashboard.legendIzin} style={{ height: `${(d.izin / total) * 100}%`, background: '#FCD34D', minHeight: d.izin ? 4 : 0 }} />
                      <div title={dict.dashboard.legendHadir} style={{ height: `${(d.hadir / total) * 100}%`, background: 'var(--color-good)', borderRadius: '4px 4px 0 0' }} />
                    </div>
                    <div className="tiny muted" style={{ fontWeight: 600 }}>{d.hari}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 tiny muted flex-wrap" style={{ marginTop: 12 }}>
              <span className="flex gap-1 items-center"><span style={{ width: 8, height: 8, background: 'var(--color-good)', borderRadius: 2 }} /> {dict.dashboard.legendHadir}</span>
              <span className="flex gap-1 items-center"><span style={{ width: 8, height: 8, background: '#FCD34D', borderRadius: 2 }} /> {dict.dashboard.legendIzin}</span>
              <span className="flex gap-1 items-center"><span style={{ width: 8, height: 8, background: 'var(--color-warn)', borderRadius: 2 }} /> {dict.dashboard.legendSakit}</span>
              <span className="flex gap-1 items-center"><span style={{ width: 8, height: 8, background: 'var(--color-bad)', borderRadius: 2 }} /> {dict.dashboard.legendAlpa}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
