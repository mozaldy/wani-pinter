'use client';
import { Modal } from './Modal';
import { Pill, StudentAvatar, Sparkline, Donut } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { interpolate } from '@/lib/i18n/format';
import type { Student } from '@/lib/types';

const SUBJECTS: { key: 'cp_matematika' | 'cp_ipa' | 'cp_ips' | 'cp_bind' | 'cp_bing' | 'cp_pjok' }[] = [
  { key: 'cp_matematika' },
  { key: 'cp_ipa' },
  { key: 'cp_ips' },
  { key: 'cp_bind' },
  { key: 'cp_bing' },
  { key: 'cp_pjok' },
];

export function StudentDetail({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const { dict } = useI18n();
  if (!student) return null;
  const first = student.nama.split(' ')[0];
  return (
    <Modal open={!!student} onClose={onClose} wide
      title={student.nama}
      sub={`${student.nis} · ${student.kelas} · ${dict.enums.jk[student.jk]}`}>
      <div className="flex gap-4 items-start mb-5">
        <StudentAvatar student={student} size={64} />
        <div style={{ flex: 1 }}>
          <div className="flex gap-2 mb-2">
            <Pill kind={student.risiko === 'rendah' ? 'good' : student.risiko === 'sedang' ? 'warn' : 'bad'} dot>
              {interpolate(dict.siswa.risikoLabel, { risiko: dict.enums.risiko[student.risiko] })}
            </Pill>
            <Pill kind="primary">{interpolate(dict.modals.studentDetail.rerataLabel, { rerata: student.rerata })}</Pill>
            <Pill kind="ink">{interpolate(dict.modals.studentDetail.hadirLabel, { kehadiran: student.kehadiran })}</Pill>
          </div>
          <div className="tiny muted">{dict.siswa.waliLabel} {student.ortu}</div>
          <div className="tiny muted">{student.alamat}</div>
        </div>
        <Donut value={student.rerata} size={80} />
      </div>

      <div className="ai-card mb-4">
        <div className="ai-badge">
          <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
          {dict.modals.studentDetail.aiBadge}
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
              <div className="tiny muted" style={{ fontWeight: 600 }}>{dict.modals.studentDetail.subjects[s.key]}</div>
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
