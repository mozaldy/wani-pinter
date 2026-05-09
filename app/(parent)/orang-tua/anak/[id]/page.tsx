import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { assertParentOwnsStudent, getStudentForParent, getCatatanForParent } from '@/lib/queries';
import { StatCard, StudentAvatar, Pill } from '@/components/ui';
import type { CatatanSiswa } from '@/lib/types';

const SUBJECTS = [
  { key: 'cp_matematika' as const, label: 'Matematika', color: '#4F46E5' },
  { key: 'cp_ipa' as const, label: 'IPA Terpadu', color: '#10B981' },
  { key: 'cp_ips' as const, label: 'IPS Terpadu', color: '#F59E0B' },
  { key: 'cp_bind' as const, label: 'Bahasa Indonesia', color: '#EF4444' },
  { key: 'cp_bing' as const, label: 'Bahasa Inggris', color: '#06B6D4' },
  { key: 'cp_pjok' as const, label: 'PJOK', color: '#EC4899' },
];

const KATEGORI_KIND: Record<CatatanSiswa['kategori'], 'good' | 'warn' | 'primary' | 'accent'> = {
  positif: 'good',
  perhatian: 'warn',
  akademik: 'primary',
  sosial: 'accent',
};

function formatTgl(tgl: string) {
  const d = new Date(tgl);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function AnakPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hdrs = await headers();
  const parentId = hdrs.get('x-parent-id');
  if (!parentId) redirect('/orang-tua/login');

  const owns = await assertParentOwnsStudent(parentId, id);
  if (!owns) notFound();

  const [student, catatan] = await Promise.all([
    getStudentForParent(id),
    getCatatanForParent(id),
  ]);

  if (!student) notFound();

  const cpTuntas = SUBJECTS.filter(s => student[s.key] >= 75).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <StudentAvatar student={student} size={72} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, letterSpacing: '-0.01em' }}>
            {student.nama}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            <Pill kind="ink">{student.kelas}</Pill>
            <Pill kind="ink">NIS {student.nis}</Pill>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <StatCard
          label="Rerata Nilai"
          value={student.rerata}
          foot={student.rerata >= 75 ? 'Di atas KKM' : 'Di bawah KKM'}
          trend={student.rerata >= 75 ? 'up' : 'down'}
          icon="star"
          accent="#4F46E5"
        />
        <StatCard
          label="Kehadiran"
          value={`${student.kehadiran}%`}
          foot="Data agregat semester ini"
          icon="activity"
          accent="#10B981"
        />
        <StatCard
          label="CP Tuntas"
          value={`${cpTuntas} / 6`}
          foot="Mata pelajaran"
          icon="target"
          accent="#F59E0B"
        />
        <StatCard
          label="Kelas"
          value={student.kelas}
          foot={student.jk === 'L' ? 'Laki-laki' : 'Perempuan'}
          icon="users"
          accent="#06B6D4"
        />
      </div>

      {/* CP Progress */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Progres Capaian Pembelajaran</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SUBJECTS.map(s => {
            const val = student[s.key];
            const color = val >= 75 ? s.color : 'var(--color-bad)';
            return (
              <div key={s.key} className="bar-row">
                <span style={{ fontSize: 13, color: 'var(--color-ink-2)', fontWeight: 500 }}>{s.label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{
                    width: `${val}%`,
                    background: val >= 75
                      ? `linear-gradient(90deg, ${s.color}, ${s.color}cc)`
                      : 'var(--color-bad)',
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color, textAlign: 'right' }}>{val}%</span>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--color-ink-4)', marginTop: 12 }}>
          Nilai ≥ 75% dianggap tuntas. Merah = perlu perhatian.
        </p>
      </div>

      {/* Catatan dari Guru */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Catatan dari Guru</div>
        {catatan.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-ink-3)', textAlign: 'center', padding: '24px 0' }}>
            Belum ada catatan yang dibagikan oleh guru.
          </p>
        ) : (
          <div className="timeline">
            {catatan.map(c => (
              <div key={c.id} className={`timeline-item ${c.kategori === 'perhatian' ? 'warn' : c.kategori === 'positif' ? 'good' : ''}`}>
                <div className="timeline-time">{formatTgl(c.tgl)}</div>
                <div className="timeline-title" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Pill kind={KATEGORI_KIND[c.kategori]} style={{ fontSize: 10, padding: '1px 7px' }}>{c.kategori}</Pill>
                </div>
                <div className="timeline-desc" style={{ marginTop: 4, lineHeight: 1.55 }}>{c.text}</div>
                {c.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                    {c.tags.map(t => (
                      <span key={t} style={{
                        fontSize: 10.5, padding: '1px 7px', borderRadius: 999,
                        background: 'var(--color-surface-2)', color: 'var(--color-ink-3)',
                        border: '1px solid var(--color-line)',
                      }}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
