'use client';
import { useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import { Pill } from '@/components/ui';
import { useModals } from '@/components/modals/ModalProvider';
import type { Student, CP } from '@/lib/types';

const SUBJECTS = [
  { key: 'cp_matematika', label: 'Matematika', color: '#4F46E5' },
  { key: 'cp_ipa', label: 'IPA Terpadu', color: '#10B981' },
  { key: 'cp_ips', label: 'IPS Terpadu', color: '#F59E0B' },
  { key: 'cp_bind', label: 'B. Indonesia', color: '#EF4444' },
  { key: 'cp_bing', label: 'B. Inggris', color: '#06B6D4' },
  { key: 'cp_pjok', label: 'PJOK', color: '#EC4899' },
] as const;

const ANEK = [
  { date: '24 Apr 2026', kind: 'akademik' as const, title: 'Kesulitan konsep eliminasi SPLDV', body: 'Saat diskusi kelompok, kesulitan menyamakan koefisien. Diberikan contoh konkret jual-beli warung — mulai paham di akhir sesi.' },
  { date: '21 Apr 2026', kind: 'sosial' as const, title: 'Bantu teman sekelompok', body: 'Membantu Rendra memahami operasi bilangan bulat saat tutor sebaya. Sikap yang patut diapresiasi.' },
  { date: '17 Apr 2026', kind: 'perhatian' as const, title: 'Kehadiran tidak konsisten', body: 'Alpa 2 hari berturut tanpa keterangan. Sudah hubungi orang tua via WA — sedang ada masalah keluarga.' },
  { date: '12 Apr 2026', kind: 'positif' as const, title: 'Aktif bertanya', body: 'Mulai berani bertanya saat tidak paham. Pertanyaan tentang pythagoras menarik dan dijawab di depan kelas.' },
];

const KIND_COLOR = { akademik: '#4F46E5', sosial: '#06B6D4', perhatian: '#F59E0B', positif: '#10B981' };
const KIND_LABEL = { akademik: 'Akademik', sosial: 'Sosial', perhatian: 'Perhatian', positif: 'Positif' };

const TABS: { id: string; label: string; icon: IconName; count?: number }[] = [
  { id: 'akademik', label: 'Akademik', icon: 'chart' },
  { id: 'anekdotal', label: 'Catatan Anekdotal', icon: 'fileText', count: 4 },
  { id: 'portofolio', label: 'Portofolio Karya', icon: 'folder', count: 12 },
  { id: 'komunikasi', label: 'Komunikasi Wali', icon: 'message', count: 7 },
  { id: 'rapor', label: 'Rapor Naratif', icon: 'star' },
];

export function ProfilTabs({ student, cps }: { student: Student; cps: CP[] }) {
  const [tab, setTab] = useState('akademik');
  const { openRapor } = useModals();
  const trenSemester = [62, 65, 68, 64, 70, 72, 68, 65, 63, 66, 70, student.rerata];
  const minggu = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'];

  return (
    <>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-line)', marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '10px 14px',
              borderBottom: tab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: tab === t.id ? 'var(--color-primary)' : 'var(--color-ink-3)',
              fontWeight: 600, fontSize: 13, marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            <Icon name={t.icon} size={14} />
            {t.label}
            {t.count && <span style={{ background: tab === t.id ? 'var(--color-primary-soft)' : 'var(--color-surface-2)', color: tab === t.id ? 'var(--color-primary)' : 'var(--color-ink-3)', padding: '1px 7px', borderRadius: 999, fontSize: 11 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'akademik' && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 flex flex-col gap-4">
            <div className="card">
              <div className="card-title">
                <h3>Tren rerata · 12 minggu terakhir</h3>
                <Pill kind="bad" dot>Tren menurun</Pill>
              </div>
              <div style={{ position: 'relative', height: 220, padding: '8px 0' }}>
                <svg viewBox="0 0 600 200" preserveAspectRatio="none" style={{ width: '100%', height: 200 }}>
                  <line x1="0" y1="40" x2="600" y2="40" stroke="var(--color-surface-3)" strokeDasharray="2 4" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="var(--color-surface-3)" strokeDasharray="2 4" />
                  <line x1="0" y1="160" x2="600" y2="160" stroke="var(--color-surface-3)" strokeDasharray="2 4" />
                  <line x1="0" y1="80" x2="600" y2="80" stroke="var(--color-good)" strokeDasharray="4 4" strokeWidth="1.5" />
                  <text x="595" y="76" fontSize="9" fill="var(--color-good)" textAnchor="end" fontWeight="700">KKM 75</text>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points={`0,200 ${trenSemester.map((v, i) => `${(i / (trenSemester.length - 1)) * 600},${200 - ((v - 50) / 50) * 180}`).join(' ')} 600,200`} fill="url(#trendGrad)" />
                  <polyline points={trenSemester.map((v, i) => `${(i / (trenSemester.length - 1)) * 600},${200 - ((v - 50) / 50) * 180}`).join(' ')}
                    fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {trenSemester.map((v, i) => (
                    <circle key={i} cx={(i / (trenSemester.length - 1)) * 600} cy={200 - ((v - 50) / 50) * 180} r="4"
                      fill={v >= 75 ? 'var(--color-good)' : 'var(--color-bad)'} stroke="white" strokeWidth="2" />
                  ))}
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {minggu.map(m => <span key={m} className="tiny muted" style={{ fontSize: 10 }}>{m}</span>)}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title"><h3>Penguasaan Capaian Pembelajaran</h3></div>
              <div className="flex flex-col gap-3">
                {cps.slice(0, 5).map((cp, i) => {
                  const v = [85, 72, 64, 38, 22][i];
                  return (
                    <div key={cp.kode}>
                      <div className="flex justify-between mb-2">
                        <div>
                          <div className="small" style={{ fontWeight: 600 }}>{cp.nama}</div>
                          <div className="tiny muted">{cp.kode} · {cp.tp_count} TP</div>
                        </div>
                        <Pill kind={v >= 75 ? 'good' : v >= 50 ? 'warn' : 'bad'}>{v}%</Pill>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{
                          width: `${v}%`,
                          background: v >= 75 ? 'linear-gradient(90deg, #10B981, #34D399)' : v >= 50 ? 'linear-gradient(90deg, #F59E0B, #FCD34D)' : 'linear-gradient(90deg, #EF4444, #F87171)',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-4">
            <div className="card">
              <div className="card-title"><h3>Per mata pelajaran</h3></div>
              <div className="flex flex-col gap-3">
                {SUBJECTS.map(sub => {
                  const v = student[sub.key];
                  return (
                    <div key={sub.key} className="flex gap-3 items-center">
                      <span style={{ width: 8, height: 32, borderRadius: 4, background: sub.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="small" style={{ fontWeight: 600 }}>{sub.label}</div>
                        <div className="tiny muted">Pak Andi · 4× pertemuan/minggu</div>
                      </div>
                      <div className="h-display" style={{ fontSize: 20, fontWeight: 600, color: v >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>{v}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card">
              <div className="card-title"><h3>Prediksi semester</h3><Pill kind="primary" dot>AI</Pill></div>
              <div style={{ padding: 16, background: 'var(--color-bad-soft)', borderRadius: 10, marginBottom: 12 }}>
                <div className="tiny" style={{ fontWeight: 700, color: 'var(--color-bad)', textTransform: 'uppercase', letterSpacing: 0.06 }}>Risiko tidak tuntas</div>
                <div className="h-display" style={{ fontSize: 26, fontWeight: 600, color: 'var(--color-bad)', margin: '4px 0' }}>72%</div>
                <div className="tiny muted">Berdasarkan tren 6 minggu, kehadiran, dan pola formatif</div>
              </div>
              <div className="tiny muted">Tanpa intervensi, prediksi rerata semester: <strong style={{ color: 'var(--color-bad)' }}>62</strong>. Dengan intervensi yang direkomendasikan AI: <strong style={{ color: 'var(--color-good)' }}>74-78</strong>.</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'anekdotal' && (
        <div className="card">
          <div className="card-title">
            <h3>Catatan anekdotal · {ANEK.length} dari semester ini</h3>
            <button className="btn btn-primary"><Icon name="plus" size={13} /> Tambah catatan</button>
          </div>
          <div className="timeline">
            {ANEK.map((a, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-time" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{a.date}</span>
                  <span className="pill" style={{ background: `${KIND_COLOR[a.kind]}15`, color: KIND_COLOR[a.kind] }}>{KIND_LABEL[a.kind]}</span>
                </div>
                <div className="timeline-title">{a.title}</div>
                <div className="timeline-desc">{a.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'portofolio' && (
        <div className="card">
          <div className="card-title">
            <h3>Portofolio karya · 12 dokumen</h3>
            <div className="seg">
              <button className="seg-btn active">Semua</button>
              <button className="seg-btn">Tugas</button>
              <button className="seg-btn">P5</button>
              <button className="seg-btn">Refleksi</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { t: 'Refleksi P5 Kewirausahaan', d: '24 Apr · 4 hal', c: '#10B981', tag: 'P5' },
              { t: 'Tugas SPLDV Kontekstual', d: '21 Apr · gambar', c: '#4F46E5', tag: 'Matematika' },
              { t: 'Esai Pancasila', d: '18 Apr · 3 hal', c: '#F59E0B', tag: 'PPKn' },
              { t: 'Lab IPA Cermin', d: '15 Apr · video 2:30', c: '#06B6D4', tag: 'IPA' },
              { t: 'Cerpen "Hujan Pertama"', d: '12 Apr · 5 hal', c: '#EF4444', tag: 'B. Indonesia' },
              { t: 'Vlog Bahasa Inggris', d: '10 Apr · video 3:45', c: '#EC4899', tag: 'B. Inggris' },
              { t: 'Poster Kampanye Anti-Bullying', d: '8 Apr · gambar', c: '#8B5CF6', tag: 'P5' },
              { t: 'Quiz Pythagoras', d: '5 Apr · 90/100', c: '#4F46E5', tag: 'Matematika' },
            ].map((p, i) => (
              <div key={i} style={{ aspectRatio: '4/5', borderRadius: 12, border: '1px solid var(--color-line)', overflow: 'hidden', background: 'var(--color-surface)' }}>
                <div style={{ height: '60%', background: `linear-gradient(135deg, ${p.c}40, ${p.c}10)`, display: 'grid', placeItems: 'center' }}>
                  <Icon name="fileText" size={32} style={{ color: p.c }} />
                </div>
                <div style={{ padding: 10 }}>
                  <span className="pill" style={{ background: `${p.c}15`, color: p.c, fontSize: 9 }}>{p.tag}</span>
                  <div className="small" style={{ fontWeight: 600, marginTop: 6, lineHeight: 1.3 }}>{p.t}</div>
                  <div className="tiny muted" style={{ marginTop: 2 }}>{p.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'komunikasi' && (
        <div className="card">
          <div className="card-title"><h3>Riwayat komunikasi dengan {student.ortu}</h3><button className="btn btn-primary"><Icon name="plus" size={13} /> Pesan baru</button></div>
          <div className="flex flex-col gap-3">
            {[
              { from: 'wali', date: '23 Apr 2026 · 19.30', body: 'Bu, terima kasih informasinya. Memang ada masalah keluarga yg sedang kami selesaikan. Akan saya pastikan anak hadir besok.' },
              { from: 'guru', date: '22 Apr 2026 · 14.15', body: 'Halo, saya guru matematika. Anak alpa 2 hari berturut. Apakah ada yg bisa saya bantu?' },
              { from: 'sistem', date: '20 Apr 2026 · 06.00', body: 'Notifikasi otomatis: kehadiran turun di bawah 80%. Direkomendasikan kontak wali.' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: m.from === 'guru' ? 'row-reverse' : 'row', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 50,
                  background: m.from === 'guru' ? 'var(--color-primary)' : m.from === 'sistem' ? 'var(--color-surface-3)' : 'var(--color-surface-2)',
                  color: m.from === 'guru' ? 'white' : 'var(--color-ink-3)',
                  display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700,
                }}>
                  {m.from === 'sistem' ? <Icon name="sparkle" size={14} /> : m.from === 'guru' ? 'SR' : 'BH'}
                </div>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{
                    padding: 12, borderRadius: 12,
                    background: m.from === 'guru' ? 'var(--color-primary)' : m.from === 'sistem' ? 'var(--color-surface-2)' : 'var(--color-surface)',
                    color: m.from === 'guru' ? 'white' : 'var(--color-ink)',
                    border: m.from !== 'guru' ? '1px solid var(--color-line)' : 'none',
                    fontSize: 13, lineHeight: 1.5,
                  }}>{m.body}</div>
                  <div className="tiny muted" style={{ marginTop: 4, textAlign: m.from === 'guru' ? 'right' : 'left' }}>{m.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'rapor' && (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <Icon name="star" size={40} style={{ color: 'var(--color-primary)', marginBottom: 12 }} />
          <h2 className="h-display" style={{ fontWeight: 500, fontSize: 22 }}>Rapor naratif Kurikulum Merdeka</h2>
          <div className="muted mb-4" style={{ maxWidth: 480, margin: '0 auto 20px' }}>
            Wani AI akan menyusun deskripsi naratif per CP berdasarkan data 6 bulan terakhir.
          </div>
          <button className="btn btn-primary" onClick={() => openRapor(student)}><Icon name="sparkle" size={14} /> Buat rapor naratif</button>
        </div>
      )}
    </>
  );
}
