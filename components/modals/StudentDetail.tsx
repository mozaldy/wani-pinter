'use client';
import { Modal } from './Modal';
import { Pill, StudentAvatar, Sparkline, Donut } from '@/components/ui';
import { Icon } from '@/components/Icon';
import type { Student } from '@/lib/types';

const SUBJECTS: { key: keyof Student; label: string }[] = [
  { key: 'cp_matematika', label: 'Matematika' },
  { key: 'cp_ipa', label: 'IPA' },
  { key: 'cp_ips', label: 'IPS' },
  { key: 'cp_bind', label: 'B. Indonesia' },
  { key: 'cp_bing', label: 'B. Inggris' },
  { key: 'cp_pjok', label: 'PJOK' },
];

export function StudentDetail({ student, onClose }: { student: Student | null; onClose: () => void }) {
  if (!student) return null;
  const first = student.nama.split(' ')[0];
  return (
    <Modal open={!!student} onClose={onClose} wide
      title={student.nama}
      sub={`${student.nis} · ${student.kelas} · ${student.jk === 'L' ? 'Laki-laki' : 'Perempuan'}`}>
      <div className="flex gap-4 items-start mb-5">
        <StudentAvatar student={student} size={64} />
        <div style={{ flex: 1 }}>
          <div className="flex gap-2 mb-2">
            <Pill kind={student.risiko === 'rendah' ? 'good' : student.risiko === 'sedang' ? 'warn' : 'bad'} dot>
              Risiko {student.risiko}
            </Pill>
            <Pill kind="primary">Rerata {student.rerata}</Pill>
            <Pill kind="ink">Hadir {student.kehadiran}%</Pill>
          </div>
          <div className="tiny muted">Wali: {student.ortu}</div>
          <div className="tiny muted">{student.alamat}</div>
        </div>
        <Donut value={student.rerata} size={80} />
      </div>

      <div className="ai-card mb-4">
        <div className="ai-badge">
          <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
          Wani AI · Ringkasan 360°
        </div>
        <div className="ai-text">
          {student.risiko === 'tinggi' ? (
            <>{first} menunjukkan <strong>penurunan konsisten</strong> di Matematika dan IPA selama 2 minggu terakhir. Kehadiran turun ke {student.kehadiran}%. Direkomendasikan: <strong>sesi konseling wali</strong> + materi remedial Sistem Persamaan Linear.</>
          ) : student.risiko === 'sedang' ? (
            <>{first} stabil tapi <strong>belum tuntas KKM</strong> di 2 mata pelajaran. Pola: kuat di praktik, lemah di soal abstrak. Cocok untuk <strong>peer learning</strong> dengan siswa berprestasi.</>
          ) : (
            <>{first} <strong>konsisten di atas KKM</strong> dengan kehadiran sangat baik. Pertimbangkan beri tantangan <strong>pengayaan</strong> di Matematika dan IPA agar tidak jenuh.</>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {SUBJECTS.map(s => {
          const v = student[s.key] as number;
          return (
            <div key={s.key} style={{ padding: 12, border: '1px solid var(--color-line)', borderRadius: 10 }}>
              <div className="tiny muted" style={{ fontWeight: 600 }}>{s.label}</div>
              <div className="flex justify-between items-center" style={{ marginTop: 4 }}>
                <span className="h-display" style={{ fontSize: 22, fontWeight: 600, color: v >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>{v}</span>
                <div style={{ width: 60 }}>
                  <Sparkline data={[v - 12, v - 8, v - 4, v - 2, v + 1, v]} color={v >= 75 ? '#10B981' : '#EF4444'} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
