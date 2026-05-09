import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/ui';
import { ProfilTabs } from '@/components/ProfilTabs';
import { ProfilHeaderActions, BackLink } from '@/components/ProfilHeader';
import { getStudent, getCPList } from '@/lib/queries';

export default async function ProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [student, cps] = await Promise.all([getStudent(id), getCPList()]);
  if (!student) notFound();
  const initials = student.nama.split(' ').slice(0, 2).map(x => x[0]).join('');

  return (
    <div className="screen-enter">
      <BackLink />

      <div className="card" style={{
        background: `linear-gradient(135deg, ${student.avatar_color}15, ${student.avatar_color}05)`,
        borderColor: `${student.avatar_color}30`, marginBottom: 16, padding: 28,
      }}>
        <div className="flex gap-5 items-start">
          <div className="student-avatar" style={{ background: student.avatar_color, width: 96, height: 96, fontSize: 32, fontWeight: 800 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex gap-2 mb-2">
              <Pill kind={student.risiko === 'rendah' ? 'good' : student.risiko === 'sedang' ? 'warn' : 'bad'} dot>Risiko {student.risiko}</Pill>
              <Pill kind="primary">{student.kelas}</Pill>
              <Pill kind="ink">NIS {student.nis}</Pill>
            </div>
            <h1 className="h-display" style={{ margin: '4px 0', fontSize: 30 }}>{student.nama}</h1>
            <div className="muted small">
              {student.jk === 'L' ? 'Laki-laki' : 'Perempuan'} · 14 tahun · {student.alamat}
            </div>
            <div className="flex gap-4 small" style={{ marginTop: 12 }}>
              <span><strong>Wali:</strong> {student.ortu}</span>
              <span className="muted">·</span>
              <span><Icon name="message" size={12} /> +62 813-2456-7891</span>
            </div>
          </div>
          <ProfilHeaderActions student={student} />
        </div>

        <div className="grid grid-cols-12" style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--color-line)' }}>
          <div className="col-span-3">
            <div className="tiny muted" style={{ fontWeight: 600 }}>RERATA NILAI</div>
            <div className="flex gap-2 items-baseline" style={{ marginTop: 4 }}>
              <span className="h-display" style={{ fontSize: 36, fontWeight: 600, color: student.rerata >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>{student.rerata}</span>
              <span className="muted small">/100</span>
            </div>
            <div className="tiny" style={{ color: 'var(--color-bad)', marginTop: 2 }}>▼ 7 dari semester lalu</div>
          </div>
          <div className="col-span-3">
            <div className="tiny muted" style={{ fontWeight: 600 }}>KEHADIRAN</div>
            <div className="h-display" style={{ fontSize: 36, fontWeight: 600, marginTop: 4 }}>{student.kehadiran}%</div>
            <div className="tiny muted" style={{ marginTop: 2 }}>76 hadir · 4 sakit · 4 alpa</div>
          </div>
          <div className="col-span-3">
            <div className="tiny muted" style={{ fontWeight: 600 }}>CP TUNTAS</div>
            <div className="h-display" style={{ fontSize: 36, fontWeight: 600, marginTop: 4 }}>3<span className="muted" style={{ fontSize: 18 }}>/8</span></div>
            <div className="tiny muted" style={{ marginTop: 2 }}>5 belum tuntas · target Juni</div>
          </div>
          <div className="col-span-3">
            <div className="tiny muted" style={{ fontWeight: 600 }}>PROFIL PELAJAR PANCASILA</div>
            <div className="flex gap-1" style={{ marginTop: 6 }}>
              {['BB', 'MB', 'BSH', 'SB'].map((l, i) => (
                <div key={l} style={{
                  flex: 1, padding: '6px 4px', textAlign: 'center', fontSize: 10, fontWeight: 700,
                  borderRadius: 6, background: i === 1 ? 'var(--color-warn)' : 'var(--color-surface-2)',
                  color: i === 1 ? 'white' : 'var(--color-ink-3)',
                }}>{l}</div>
              ))}
            </div>
            <div className="tiny muted" style={{ marginTop: 4 }}>Mulai Berkembang (rata-rata 6 dimensi)</div>
          </div>
        </div>
      </div>

      <div className="ai-card mb-4">
        <div className="ai-badge">
          <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
          Wani AI · Sintesis 360°
        </div>
        <div className="ai-text">
          <strong>{student.nama.split(' ')[0]}</strong> menunjukkan pola <strong>penurunan akademik</strong> bersamaan dengan masalah keluarga. Kekuatan: <strong>empati sosial tinggi</strong>. Kelemahan: <strong>konsep abstrak Matematika</strong>. Rekomendasi: (1) sesi konseling wali, (2) peer-learning dengan Siti, (3) tutor sebaya bagi Rendra.
        </div>
      </div>

      <ProfilTabs student={student} cps={cps} />
    </div>
  );
}
