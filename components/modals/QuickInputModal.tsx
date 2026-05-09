'use client';
import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Icon } from '@/components/Icon';
import { Pill, StudentAvatar } from '@/components/ui';
import type { Student } from '@/lib/types';

export function QuickInputModal({ open, onClose, onSubmit, students }: {
  open: boolean; onClose: () => void; onSubmit: () => void; students: Student[];
}) {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState('Sistem Persamaan Linear Dua Variabel');
  const [hadir, setHadir] = useState<Record<string, string>>({});
  const [recording, setRecording] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setStep(0); setRecording(false); setNotes('');
      const h: Record<string, string> = {};
      students.forEach(s => (h[s.id] = 'hadir'));
      setHadir(h);
    }
  }, [open, students]);

  const toggleVoice = () => {
    if (recording) {
      setRecording(false);
      setNotes('Diskusi kelompok berjalan baik. Bagas mulai aktif bertanya. Perlu lebih banyak contoh kontekstual untuk konsep eliminasi. Rendra masih tertinggal — coba pasangkan dengan Siti minggu depan.');
    } else setRecording(true);
  };

  const totalHadir = Object.values(hadir).filter(v => v === 'hadir').length;

  return (
    <Modal open={open} onClose={onClose} wide
      title="Jurnal Mengajar — VIII-B · Matematika"
      sub="Pertemuan ke-3 · Senin, 27 April 2026 · 08.20–09.40"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          {step > 0 && <button className="btn btn-outline" onClick={() => setStep(step - 1)}>Kembali</button>}
          {step < 2 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Lanjut <Icon name="arrowR" size={13} /></button>
          ) : (
            <button className="btn btn-primary" onClick={onSubmit}><Icon name="check" size={13} /> Simpan jurnal</button>
          )}
        </>
      }>
      <div className="steps mb-5">
        <div className={`step ${step >= 0 ? (step > 0 ? 'done' : 'active') : ''}`} />
        <div className={`step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`} />
        <div className={`step ${step >= 2 ? 'active' : ''}`} />
        <span className="tiny muted" style={{ marginLeft: 8 }}>Langkah {step + 1} dari 3</span>
      </div>

      {step === 0 && (
        <>
          <div className="field">
            <label className="field-label">Topik / Tujuan Pembelajaran</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} />
            <div className="tiny muted">Terhubung ke <strong>CP-MTK-8.2</strong> — tap untuk ubah</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label className="field-label">Metode</label>
              <select><option>Diskusi kelompok</option><option>Ekspositori</option><option>Inquiry</option></select>
            </div>
            <div className="field">
              <label className="field-label">Media</label>
              <select><option>Slide + papan tulis</option><option>Quizizz</option><option>Video</option></select>
            </div>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div className="flex justify-between items-center mb-3">
            <div className="small" style={{ fontWeight: 600 }}>Presensi · {totalHadir}/{students.length} hadir</div>
            <button className="btn btn-ghost small" onClick={() => {
              const h: Record<string, string> = {}; students.forEach(s => h[s.id] = 'hadir'); setHadir(h);
            }}>Tandai semua hadir</button>
          </div>
          <div style={{ maxHeight: 280, overflow: 'auto', border: '1px solid var(--color-line)', borderRadius: 10 }}>
            {students.map(s => (
              <div key={s.id} className="flex items-center gap-3" style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-line)' }}>
                <StudentAvatar student={s} size={26} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{s.nama}</div>
                <div className="seg">
                  {([
                    { v: 'hadir', l: 'H', c: 'var(--color-good)' },
                    { v: 'izin', l: 'I', c: '#FCD34D' },
                    { v: 'sakit', l: 'S', c: 'var(--color-warn)' },
                    { v: 'alpa', l: 'A', c: 'var(--color-bad)' },
                  ] as const).map(opt => (
                    <button key={opt.v}
                      className={`seg-btn ${hadir[s.id] === opt.v ? 'active' : ''}`}
                      style={hadir[s.id] === opt.v ? { background: opt.c, color: 'white' } : undefined}
                      onClick={() => setHadir({ ...hadir, [s.id]: opt.v })}>{opt.l}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="field">
            <label className="field-label">Catatan & refleksi pembelajaran</label>
            <div style={{ position: 'relative' }}>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Tulis atau gunakan voice-to-text..."
                rows={5}
                style={{ width: '100%', resize: 'vertical', paddingRight: 50 }} />
              <button onClick={toggleVoice} style={{
                position: 'absolute', right: 8, bottom: 8, width: 36, height: 36, borderRadius: 50,
                background: recording ? 'var(--color-bad)' : 'var(--color-primary)',
                color: 'white', display: 'grid', placeItems: 'center',
                animation: recording ? 'pulseRing 1.5s infinite' : 'none',
              }}>
                <Icon name="mic" size={16} />
              </button>
            </div>
            {recording && <div className="tiny" style={{ color: 'var(--color-bad)', fontWeight: 600, marginTop: 4 }}>● Merekam... ketuk lagi untuk berhenti</div>}
          </div>
          <div className="ai-card">
            <div className="ai-badge">
              <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
              AI menyarankan
            </div>
            <div className="ai-text small flex gap-2 flex-wrap items-center">
              Tag otomatis: <Pill kind="primary">diskusi-kelompok</Pill> <Pill kind="primary">CP-MTK-8.2</Pill> <Pill kind="warn">tindak-lanjut: Rendra</Pill>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
