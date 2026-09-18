'use client';
import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Icon } from '@/components/Icon';
import { Pill, StudentAvatar } from '@/components/ui';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { interpolate } from '@/lib/i18n/format';
import type { Student } from '@/lib/types';

export function QuickInputModal({ open, onClose, onSubmit, students }: {
  open: boolean; onClose: () => void; onSubmit: () => void; students: Student[];
}) {
  const { dict } = useI18n();
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
      title={dict.modals.quickInput.title}
      sub={dict.modals.quickInput.sub}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>{dict.common.batal}</button>
          {step > 0 && <button className="btn btn-outline" onClick={() => setStep(step - 1)}>{dict.modals.quickInput.kembali}</button>}
          {step < 2 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>{dict.modals.quickInput.lanjut} <Icon name="arrowR" size={13} /></button>
          ) : (
            <button className="btn btn-primary" onClick={onSubmit}><Icon name="check" size={13} /> {dict.modals.quickInput.simpanJurnal}</button>
          )}
        </>
      }>
      <div className="steps mb-5">
        <div className={`step ${step >= 0 ? (step > 0 ? 'done' : 'active') : ''}`} />
        <div className={`step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`} />
        <div className={`step ${step >= 2 ? 'active' : ''}`} />
        <span className="tiny muted" style={{ marginLeft: 8 }}>{interpolate(dict.modals.quickInput.langkahOf, { step: step + 1 })}</span>
      </div>

      {step === 0 && (
        <>
          <div className="field">
            <label className="field-label">{dict.modals.quickInput.topikLabel}</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} />
            <div className="tiny muted">{dict.modals.quickInput.terhubungBefore}<strong>CP-MTK-8.2</strong>{dict.modals.quickInput.terhubungAfter}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label className="field-label">{dict.modals.quickInput.metodeLabel}</label>
              <select><option>{dict.modals.quickInput.metodeDiskusi}</option><option>{dict.modals.quickInput.metodeEkspositori}</option><option>{dict.modals.quickInput.metodeInquiry}</option></select>
            </div>
            <div className="field">
              <label className="field-label">{dict.modals.quickInput.mediaLabel}</label>
              <select><option>{dict.modals.quickInput.mediaSlide}</option><option>{dict.modals.quickInput.mediaQuizizz}</option><option>{dict.modals.quickInput.mediaVideo}</option></select>
            </div>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div className="flex justify-between items-center mb-3">
            <div className="small" style={{ fontWeight: 600 }}>{interpolate(dict.modals.quickInput.presensiCount, { hadir: totalHadir, total: students.length })}</div>
            <button className="btn btn-ghost small" onClick={() => {
              const h: Record<string, string> = {}; students.forEach(s => h[s.id] = 'hadir'); setHadir(h);
            }}>{dict.modals.quickInput.tandaiSemuaHadir}</button>
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
            <label className="field-label">{dict.modals.quickInput.catatanReflektifLabel}</label>
            <div style={{ position: 'relative' }}>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={dict.modals.quickInput.notesPlaceholder}
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
            {recording && <div className="tiny" style={{ color: 'var(--color-bad)', fontWeight: 600, marginTop: 4 }}>{dict.modals.quickInput.merekamHint}</div>}
          </div>
          <div className="ai-card">
            <div className="ai-badge">
              <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
              {dict.modals.quickInput.aiMenyarankan}
            </div>
            <div className="ai-text small flex gap-2 flex-wrap items-center">
              {dict.modals.quickInput.tagOtomatis} <Pill kind="primary">diskusi-kelompok</Pill> <Pill kind="primary">CP-MTK-8.2</Pill> <Pill kind="warn">tindak-lanjut: Rendra</Pill>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
