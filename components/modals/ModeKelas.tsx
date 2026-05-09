'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import type { Student } from '@/lib/types';

type Obs = { id: number; text: string; studentId?: string; time: string };

export function ModeKelas({ open, onClose, students }: { open: boolean; onClose: () => void; students: Student[] }) {
  const [tab, setTab] = useState<'presensi' | 'observasi' | 'pacing'>('presensi');
  const [hadir, setHadir] = useState<Record<string, string>>({});
  const [observasi, setObservasi] = useState<Obs[]>([]);
  const [obsInput, setObsInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initial: Record<string, string> = {};
    students.forEach(s => (initial[s.id] = 'hadir'));
    setHadir(initial); setObservasi([]); setTimer(0);
    const t = setInterval(() => setTimer(x => x + 1), 1000);
    return () => clearInterval(t);
  }, [open, students]);

  if (!open) return null;

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const totalHadir = Object.values(hadir).filter(v => v === 'hadir').length;
  const stats = (['hadir', 'izin', 'sakit', 'alpa'] as const).map(k => ({ k, n: Object.values(hadir).filter(v => v === k).length }));

  const addObs = (text: string, studentId?: string) => {
    if (!text.trim()) return;
    setObservasi(o => [...o, { id: Date.now(), text, studentId, time: fmt(timer) }]);
    setObsInput('');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      background: '#0F172A', color: 'white',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.25s',
    }}>
      <header style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 12, height: 12, borderRadius: 50, background: '#EF4444', animation: 'blink 1.5s infinite' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18 }}>Mode Kelas Aktif · VIII-B Matematika</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>Sistem Persamaan Linear Dua Variabel · R-203</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}>{fmt(timer)} / 80:00</div>
        <button style={{ padding: '8px 14px', background: '#EF4444', color: 'white', borderRadius: 10, fontWeight: 600 }} onClick={onClose}>Akhiri sesi</button>
      </header>

      <div style={{ padding: '0 28px', display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {([
          { id: 'presensi' as const, label: 'Presensi', icon: 'users' as const, count: `${totalHadir}/${students.length}` as string | number | undefined },
          { id: 'observasi' as const, label: 'Observasi', icon: 'eye' as const, count: observasi.length as string | number | undefined },
          { id: 'pacing' as const, label: 'Tempo & TP', icon: 'target' as const, count: undefined as string | number | undefined },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '14px 16px',
              borderBottom: tab === t.id ? '2px solid #06B6D4' : '2px solid transparent',
              color: tab === t.id ? 'white' : 'rgba(255,255,255,0.5)',
              fontWeight: 600, fontSize: 13, marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            <Icon name={t.icon} size={14} />
            {t.label}
            {t.count !== undefined && <span style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 7px', borderRadius: 999, fontSize: 11 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px', overflow: 'auto' }}>
          {tab === 'presensi' && (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {stats.map(st => (
                  <div key={st.k} style={{
                    flex: 1, padding: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 10,
                    borderLeft: `3px solid ${st.k === 'hadir' ? '#10B981' : st.k === 'izin' ? '#FCD34D' : st.k === 'sakit' ? '#F59E0B' : '#EF4444'}`,
                  }}>
                    <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.06, fontWeight: 700 }}>{st.k}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600 }}>{st.n}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                {students.map(s => {
                  const status = hadir[s.id];
                  return (
                    <button key={s.id}
                      onClick={() => {
                        const order = ['hadir', 'izin', 'sakit', 'alpa'];
                        const next = order[(order.indexOf(status) + 1) % 4];
                        setHadir({ ...hadir, [s.id]: next });
                      }}
                      style={{
                        padding: 12,
                        background: status === 'hadir' ? 'rgba(16,185,129,0.15)' : status === 'izin' ? 'rgba(252,211,77,0.15)' : status === 'sakit' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                        border: `1px solid ${status === 'hadir' ? 'rgba(16,185,129,0.3)' : status === 'izin' ? 'rgba(252,211,77,0.3)' : status === 'sakit' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', color: 'white',
                      }}>
                      <div style={{ width: 28, height: 28, borderRadius: 50, background: s.avatar_color, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>
                        {s.nama.split(' ').slice(0, 2).map(x => x[0]).join('')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.nama.split(' ').slice(0, 2).join(' ')}</div>
                        <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.04, fontWeight: 700 }}>{status}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {tab === 'observasi' && (
            <>
              <div style={{ marginBottom: 16, padding: 14, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.06, color: '#67E8F9', marginBottom: 8 }}>Tag siswa cepat</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {students.slice(0, 6).map(s => (
                    <button key={s.id} onClick={() => addObs(`${s.nama.split(' ')[0]} berkontribusi`, s.id)}
                      style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: 12 }}>
                      + {s.nama.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {observasi.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
                    <Icon name="eye" size={32} style={{ marginBottom: 8 }} />
                    <div className="small">Belum ada observasi. Catat momen menarik di kelas — AI akan tag otomatis ke siswa & CP.</div>
                  </div>
                ) : observasi.map(o => {
                  const s = students.find(x => x.id === o.studentId);
                  return (
                    <div key={o.id} style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 10, display: 'flex', gap: 12 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.5, paddingTop: 2 }}>{o.time}</div>
                      {s && <div style={{ width: 24, height: 24, borderRadius: 50, background: s.avatar_color, fontSize: 9, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{s.nama.split(' ').slice(0, 2).map(x => x[0]).join('')}</div>}
                      <div style={{ flex: 1, fontSize: 13 }}>{o.text}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === 'pacing' && (
            <div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                <div className="small" style={{ opacity: 0.7, marginBottom: 8 }}>RPP RENCANA · Sistem Persamaan Linear · Pertemuan 3</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { l: 'Apersepsi', d: 10, done: true, active: false },
                    { l: 'Eksplorasi', d: 20, done: true, active: false },
                    { l: 'Diskusi', d: 25, done: false, active: true },
                    { l: 'Latihan', d: 15, done: false, active: false },
                    { l: 'Refleksi', d: 10, done: false, active: false },
                  ].map((p, i) => (
                    <div key={i} style={{
                      flex: p.d, padding: '10px 8px', borderRadius: 8,
                      background: p.done ? 'rgba(16,185,129,0.2)' : p.active ? '#06B6D4' : 'rgba(255,255,255,0.05)',
                      border: p.active ? '2px solid #67E8F9' : '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: 11, fontWeight: 600, textAlign: 'center',
                    }}>
                      <div>{p.l}</div>
                      <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>{p.d} mnt</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12 }}>
                <div className="small" style={{ opacity: 0.7, marginBottom: 8 }}>TUJUAN PEMBELAJARAN HARI INI</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { l: 'Siswa dapat menyusun model SPLDV dari masalah kontekstual', done: true },
                    { l: 'Siswa dapat menyelesaikan SPLDV dengan metode eliminasi', done: false },
                    { l: 'Siswa dapat memilih metode terbaik untuk konteks tertentu', done: false },
                  ].map((tp, i) => (
                    <label key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <input type="checkbox" defaultChecked={tp.done} />
                      <span style={{ fontSize: 13, color: tp.done ? 'rgba(255,255,255,0.5)' : 'white', textDecoration: tp.done ? 'line-through' : 'none' }}>{tp.l}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Tangkap cepat</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 16 }}>Catat momen kelas dalam &lt; 5 detik</div>

          <textarea
            value={obsInput}
            onChange={e => setObsInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addObs(obsInput); }}
            placeholder="ketik observasi... ⌘+Enter simpan"
            rows={4}
            style={{
              padding: 12, borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'white', fontSize: 13, resize: 'none', outline: 'none',
              marginBottom: 8, fontFamily: 'inherit',
            }} />

          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <button onClick={() => setRecording(!recording)} style={{
              flex: 1, padding: 10, borderRadius: 10,
              background: recording ? '#EF4444' : 'rgba(255,255,255,0.06)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600,
            }}>
              <Icon name="mic" size={14} /> {recording ? 'Merekam...' : 'Voice'}
            </button>
            <button onClick={() => addObs(obsInput)} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#06B6D4', color: 'white', fontSize: 12, fontWeight: 600 }}>Simpan</button>
          </div>

          <div style={{ fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 0.08, fontWeight: 700, marginBottom: 8 }}>Pintasan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              '🎯 Tandai TP-2 selesai',
              '✋ Bagikan link Quizizz',
              '⏰ Mulai timer kelompok 10 mnt',
              '📸 Foto papan tulis',
              '🚪 Catat keluar masuk siswa',
            ].map((l, i) => (
              <button key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: 12, textAlign: 'left' }}>{l}</button>
            ))}
          </div>

          <div style={{ marginTop: 'auto', padding: 12, background: 'rgba(6,182,212,0.1)', borderRadius: 10, border: '1px solid rgba(6,182,212,0.3)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#67E8F9', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.06 }}>Wani AI</div>
            <div style={{ fontSize: 12, lineHeight: 1.5 }}>Bagas dan Rendra terdeteksi pasif 8 menit terakhir. Pertimbangkan tanya langsung atau pindah ke kerja kelompok.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
