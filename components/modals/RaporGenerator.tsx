'use client';
import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Icon } from '@/components/Icon';
import { Pill, StudentAvatar } from '@/components/ui';
import type { Student } from '@/lib/types';

const TONES: Record<string, string> = {
  hangat: 'hangat & memotivasi',
  formal: 'formal & faktual',
  konstruktif: 'kritis konstruktif',
};

export function RaporGenerator({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const open = !!student;
  const [step, setStep] = useState(0);
  const [tone, setTone] = useState<keyof typeof TONES>('hangat');
  const [length, setLength] = useState('sedang');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) { setStep(0); setProgress(0); }
  }, [open]);

  if (!student) return null;
  const first = student.nama.split(' ')[0];

  const handleGenerate = () => {
    setStep(1); setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 8; setProgress(Math.min(p, 100));
      if (p >= 100) { clearInterval(interval); setTimeout(() => setStep(2), 400); }
    }, 120);
  };

  const naratifPerMapel = [
    { mapel: 'Matematika', cp: ['Bilangan Berpangkat', 'SPLDV', 'Pythagoras'],
      naratif: `${first} menunjukkan pemahaman yang baik pada konsep Bilangan Berpangkat dan Akar (CP-MTK-8.1), terlihat dari kemampuannya menyelesaikan soal-soal kontekstual dengan strategi yang tepat. Pada materi Sistem Persamaan Linear Dua Variabel, ${first} masih perlu penguatan terutama pada metode eliminasi — konsep menyamakan koefisien sering menjadi tantangan. Untuk Teorema Pythagoras, kemampuan visualisasi geometrisnya sudah berkembang dengan baik. Semester depan, ${first} dianjurkan lebih banyak berlatih soal aljabar abstrak.` },
    { mapel: 'IPA Terpadu', cp: ['Gerak & Gaya', 'Optika', 'Sistem Pencernaan'],
      naratif: `Pada mata pelajaran IPA, ${first} sangat antusias terutama saat praktikum laboratorium. Eksperimen pembiasan cahaya pada cermin cekung dilaporkan dengan rapi dan analitis. Pemahaman konseptual tentang Hukum Newton sudah baik, namun penerapan pada soal hitungan masih perlu ditingkatkan. ${first} memiliki potensi besar di sains terapan.` },
  ];

  const dimensi = [
    { d: 'Beriman & Bertakwa', skor: 'BSH', narasi: 'Konsisten menjalankan ibadah dan menunjukkan sikap toleransi.' },
    { d: 'Berkebinekaan Global', skor: 'BSH', narasi: 'Menghargai keberagaman dalam diskusi kelompok.' },
    { d: 'Bergotong-Royong', skor: 'SB', narasi: 'Sangat aktif membantu teman, terutama pada peer-learning.' },
    { d: 'Mandiri', skor: 'MB', narasi: 'Masih perlu dorongan untuk menyelesaikan tugas tepat waktu.' },
    { d: 'Bernalar Kritis', skor: 'MB', narasi: 'Mulai berani bertanya dan menganalisis informasi.' },
    { d: 'Kreatif', skor: 'BSH', narasi: 'Menunjukkan kreativitas baik pada portofolio cerpen dan vlog.' },
  ];

  return (
    <Modal open={open} onClose={onClose} wide
      title={step === 2 ? `Rapor Naratif · ${student.nama}` : 'Buat Rapor Naratif dengan AI'}
      sub={step === 2 ? `Semester Genap 2025/2026 · ${student.kelas}` : 'Wani AI akan menyusun deskriptor sesuai Kurikulum Merdeka'}
      footer={
        step === 0 ? <><button className="btn btn-ghost" onClick={onClose}>Batal</button><button className="btn btn-primary" onClick={handleGenerate}><Icon name="sparkle" size={13} /> Mulai generate</button></>
        : step === 1 ? null
        : <><button className="btn btn-ghost" onClick={() => setStep(0)}>Generate ulang</button><button className="btn btn-outline"><Icon name="download" size={13} /> Unduh PDF</button><button className="btn btn-primary"><Icon name="check" size={13} /> Simpan rapor</button></>
      }>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div style={{ padding: 14, background: 'var(--color-primary-soft)', borderRadius: 10 }}>
            <div className="flex gap-3 items-center">
              <StudentAvatar student={student} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{student.nama}</div>
                <div className="tiny muted">{student.kelas} · NIS {student.nis} · Rerata {student.rerata}</div>
              </div>
              <Pill kind="primary">6 mapel · 12 minggu data</Pill>
            </div>
          </div>

          <div>
            <label className="field-label">Gaya bahasa</label>
            <div className="seg" style={{ width: '100%', marginTop: 6 }}>
              {Object.entries(TONES).map(([k, v]) => (
                <button key={k} className={`seg-btn ${tone === k ? 'active' : ''}`} onClick={() => setTone(k as keyof typeof TONES)} style={{ flex: 1 }}>{v}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Panjang per mapel</label>
            <div className="seg" style={{ width: '100%', marginTop: 6 }}>
              {[
                { k: 'singkat', l: 'Singkat (50–80 kata)' },
                { k: 'sedang', l: 'Sedang (100–150 kata)' },
                { k: 'panjang', l: 'Panjang (180–250 kata)' },
              ].map(o => (
                <button key={o.k} className={`seg-btn ${length === o.k ? 'active' : ''}`} onClick={() => setLength(o.k)} style={{ flex: 1 }}>{o.l}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Sumber data</label>
            <div className="flex flex-col gap-2" style={{ marginTop: 6 }}>
              {[
                { l: 'Nilai formatif & sumatif (148 record)', on: true },
                { l: 'Catatan anekdotal (4 catatan)', on: true },
                { l: 'Portofolio karya (12 dokumen)', on: true },
                { l: 'Profil Pelajar Pancasila (6 dimensi)', on: true },
                { l: 'Komunikasi wali (7 percakapan)', on: false },
              ].map((o, i) => (
                <label key={i} className="flex gap-2 small items-center" style={{ padding: 8, background: 'var(--color-surface-2)', borderRadius: 8 }}>
                  <input type="checkbox" defaultChecked={o.on} />
                  <span>{o.l}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="ai-card">
            <div className="ai-badge"><span className="ai-glyph"><Icon name="sparkle" size={11} /></span> Catatan</div>
            <div className="ai-text small">AI akan membuat draf yang dapat Anda edit sebelum dicetak. Hasil tidak dibagikan ke pihak ketiga dan diproses secara aman.</div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 50,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            margin: '0 auto 16px', display: 'grid', placeItems: 'center',
            color: 'white', animation: 'pulseScale 1.5s infinite',
          }}>
            <Icon name="sparkle" size={28} />
          </div>
          <h3 className="h-display" style={{ fontWeight: 500, marginBottom: 6 }}>Wani AI sedang menyusun rapor</h3>
          <div className="muted small mb-5">{
            progress < 25 ? 'Menganalisis 148 nilai formatif & sumatif...'
              : progress < 50 ? 'Membaca catatan anekdotal & portofolio...'
              : progress < 75 ? 'Menyusun deskripsi naratif per CP...'
              : 'Memformat & memvalidasi narasi...'
          }</div>
          <div style={{ maxWidth: 320, margin: '0 auto', height: 8, background: 'var(--color-surface-2)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', transition: 'width 0.3s' }} />
          </div>
          <div className="tiny muted" style={{ marginTop: 8 }}>{progress}%</div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div style={{ padding: 14, background: 'var(--color-good-soft)', borderRadius: 10, border: '1px solid #86EFAC' }}>
            <div className="flex gap-2 items-start">
              <Icon name="check" size={16} style={{ color: 'var(--color-good)', flexShrink: 0, marginTop: 2 }} />
              <div className="small">
                <strong>Draf rapor selesai</strong> · gaya {TONES[tone]} · panjang {length}.
                Setiap paragraf dapat Anda edit langsung.
              </div>
            </div>
          </div>

          <div>
            <h4 className="h-display" style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Deskripsi per Mata Pelajaran</h4>
            <div className="flex flex-col gap-3">
              {naratifPerMapel.map((m, i) => (
                <div key={i} style={{ padding: 16, border: '1px solid var(--color-line)', borderRadius: 12, background: 'var(--color-surface)' }}>
                  <div className="flex justify-between mb-2">
                    <div className="flex gap-2 items-baseline">
                      <strong>{m.mapel}</strong>
                      <span className="tiny muted">CP: {m.cp.join(' · ')}</span>
                    </div>
                    <button className="btn btn-ghost small"><Icon name="sparkle" size={12} /> Regen</button>
                  </div>
                  <div className="small" contentEditable suppressContentEditableWarning style={{ lineHeight: 1.6, color: 'var(--color-ink-2)', outline: 'none', padding: 6, borderRadius: 6 }}>
                    {m.naratif}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="h-display" style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Profil Pelajar Pancasila</h4>
            <div className="grid grid-cols-2 gap-2">
              {dimensi.map((d, i) => (
                <div key={i} style={{ padding: 12, border: '1px solid var(--color-line)', borderRadius: 10 }}>
                  <div className="flex justify-between mb-2">
                    <span className="small" style={{ fontWeight: 600 }}>{d.d}</span>
                    <Pill kind={d.skor === 'SB' ? 'good' : d.skor === 'BSH' ? 'primary' : d.skor === 'MB' ? 'warn' : 'bad'}>{d.skor}</Pill>
                  </div>
                  <div className="tiny muted">{d.narasi}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 14, background: 'var(--color-primary-soft)', borderRadius: 10 }}>
            <div className="small" style={{ fontWeight: 700, marginBottom: 6 }}>Catatan & Saran Wali Kelas (auto-draft)</div>
            <div className="small" contentEditable suppressContentEditableWarning style={{ lineHeight: 1.6, outline: 'none' }}>
              {first} adalah siswa yang memiliki potensi sosial dan akademik yang seimbang. Pertahankan sikap empati dan gotong-royong yang sudah baik. Untuk semester depan, fokuskan pada penguatan konsep abstrak Matematika dan kemandirian dalam menyelesaikan tugas. Kami sangat berharap dukungan keluarga untuk menjaga konsistensi kehadiran.
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
