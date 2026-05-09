import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { Pill, StatCard, Sparkline, StudentAvatar } from '@/components/ui';
import { QuickInputButton, OpenAIButton } from '@/components/QuickInputButton';
import { getStudents, getJadwal, getActivity, getKehadiran } from '@/lib/queries';

export default async function DashboardPage() {
  const [students, jadwal, activity, kehadiran] = await Promise.all([
    getStudents(), getJadwal(), getActivity(), getKehadiran(),
  ]);

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26, lineHeight: 1.1 }}>
            Selamat pagi, Bu Sari ☀️
          </h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            Senin, 27 April 2026 · 4 kelas hari ini · 2 deadline minggu ini
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline"><Icon name="calendar" size={15} /> Rabu, 28 Apr</button>
          <QuickInputButton primary><Icon name="plus" size={15} /> Input cepat</QuickInputButton>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3"><StatCard label="Total Siswa" value="156" foot="6 kelas · semester genap" icon="users" accent="#4F46E5" /></div>
        <div className="col-span-3"><StatCard label="Tuntas KKM" value="84%" foot="naik 6% bulan ini" trend="up" icon="target" accent="#10B981" /></div>
        <div className="col-span-3"><StatCard label="Berisiko" value="12" foot="perlu intervensi" icon="alert" accent="#EF4444" /></div>
        <div className="col-span-3"><StatCard label="Kehadiran Rerata" value="92%" foot="minggu berjalan" icon="pulse" accent="#06B6D4" /></div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-8 flex flex-col gap-4">
          <div className="card">
            <div className="card-title">
              <h3>Jadwal hari ini</h3>
              <div className="flex gap-2">
                <Pill kind="good" dot>1 selesai</Pill>
                <Pill kind="primary" dot>1 sedang berjalan</Pill>
                <Pill kind="ink">2 mendatang</Pill>
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
                    {j.status === 'selesai' && <Pill kind="good" dot>Selesai</Pill>}
                    {j.status === 'aktif' && (<>
                      <Pill kind="primary" dot>Aktif</Pill>
                      <QuickInputButton primary>Input jurnal</QuickInputButton>
                    </>)}
                    {j.status === 'mendatang' && <button className="btn btn-ghost"><Icon name="chevR" size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <h3>Aksi cepat</h3>
              <span className="sub">Selesai dalam &lt; 2 menit</span>
            </div>
            <div className="quick-input">
              <QuickInputButton className="">
                <span className="qi-icon"><Icon name="clipboard" size={16} /></span>
                <span className="qi-title">Jurnal Mengajar</span>
                <span className="qi-desc">Catat KBM + presensi sekaligus</span>
              </QuickInputButton>
              <button>
                <span className="qi-icon"><Icon name="edit" size={16} /></span>
                <span className="qi-title">Penilaian Harian</span>
                <span className="qi-desc">Input nilai, skala 0–100 / kualitatif</span>
              </button>
              <button>
                <span className="qi-icon"><Icon name="mic" size={16} /></span>
                <span className="qi-title">Catatan Suara</span>
                <span className="qi-desc">Voice-to-text observasi siswa</span>
              </button>
              <button>
                <span className="qi-icon"><Icon name="upload" size={16} /></span>
                <span className="qi-title">Impor Quizizz</span>
                <span className="qi-desc">Sinkron skor formatif eksternal</span>
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-4">
          <div className="ai-card">
            <div className="ai-badge">
              <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
              Wani AI · Ringkasan harian
            </div>
            <div className="ai-text">
              <strong>3 siswa</strong> butuh perhatian di kelas berikutnya (VIII-B). Nilai formatif <strong>Bagas</strong> turun 18% — pertimbangkan pasangkan dengan <strong>Siti</strong> untuk peer learning saat sesi Sistem Persamaan Linear.
            </div>
            <div className="flex gap-2" style={{ marginTop: 14 }}>
              <OpenAIButton><Icon name="sparkle" size={13} /> Lihat detail</OpenAIButton>
              <button className="btn btn-ghost">Lewati</button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <h3>Aktivitas terbaru</h3>
              <button className="btn btn-ghost small">Semua</button>
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
              <h3>Kelas VIII-A · Ringkasan siswa</h3>
              <div className="seg">
                <button className="seg-btn active">Semua</button>
                <button className="seg-btn">Berisiko</button>
                <button className="seg-btn">Berprestasi</button>
              </div>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Siswa</th><th>Rerata</th><th>Kehadiran</th>
                  <th>Tren 6 minggu</th><th>Risiko</th><th></th>
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
                          <div className="tiny muted">{s.nis} · {s.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                        </div>
                      </Link>
                    </td>
                    <td><strong style={{ color: s.rerata >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>{s.rerata}</strong></td>
                    <td>{s.kehadiran}%</td>
                    <td style={{ width: 110 }}>
                      <Sparkline data={[60, 65, 72, 68, 75, s.rerata]} color={s.rerata >= 75 ? '#10B981' : '#EF4444'} />
                    </td>
                    <td><Pill kind={s.risiko === 'rendah' ? 'good' : s.risiko === 'sedang' ? 'warn' : 'bad'} dot>{s.risiko}</Pill></td>
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
              <h3>Presensi minggu ini</h3>
              <span className="sub">Kelas VIII-A</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, padding: '12px 0 8px' }}>
              {kehadiran.map(d => {
                const total = d.hadir + d.izin + d.sakit + d.alpa;
                return (
                  <div key={d.hari} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: 1, gap: 1 }}>
                      <div title="Alpa" style={{ height: `${(d.alpa / total) * 100}%`, background: 'var(--color-bad)', minHeight: d.alpa ? 4 : 0 }} />
                      <div title="Sakit" style={{ height: `${(d.sakit / total) * 100}%`, background: 'var(--color-warn)', minHeight: d.sakit ? 4 : 0 }} />
                      <div title="Izin" style={{ height: `${(d.izin / total) * 100}%`, background: '#FCD34D', minHeight: d.izin ? 4 : 0 }} />
                      <div title="Hadir" style={{ height: `${(d.hadir / total) * 100}%`, background: 'var(--color-good)', borderRadius: '4px 4px 0 0' }} />
                    </div>
                    <div className="tiny muted" style={{ fontWeight: 600 }}>{d.hari}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 tiny muted flex-wrap" style={{ marginTop: 12 }}>
              <span className="flex gap-1 items-center"><span style={{ width: 8, height: 8, background: 'var(--color-good)', borderRadius: 2 }} /> Hadir</span>
              <span className="flex gap-1 items-center"><span style={{ width: 8, height: 8, background: '#FCD34D', borderRadius: 2 }} /> Izin</span>
              <span className="flex gap-1 items-center"><span style={{ width: 8, height: 8, background: 'var(--color-warn)', borderRadius: 2 }} /> Sakit</span>
              <span className="flex gap-1 items-center"><span style={{ width: 8, height: 8, background: 'var(--color-bad)', borderRadius: 2 }} /> Alpa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
