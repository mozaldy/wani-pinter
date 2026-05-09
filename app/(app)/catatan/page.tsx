import Link from 'next/link';
import { Icon, type IconName } from '@/components/Icon';
import { Pill, StatCard, StudentAvatar } from '@/components/ui';
import { getStudents } from '@/lib/queries';

const NOTES = [
  { id: 1, sId: 'S002', tgl: '27 Apr', kategori: 'positif' as const, icon: 'star' as IconName, text: 'Kontribusi luar biasa dalam diskusi kelompok hari ini. Membantu Bagas memahami konsep eliminasi dengan analogi yang kreatif.', tags: ['kepemimpinan', 'kolaborasi'] },
  { id: 2, sId: 'S007', tgl: '27 Apr', kategori: 'perhatian' as const, icon: 'alert' as IconName, text: 'Tidak hadir 3 hari berturut-turut tanpa keterangan. Sudah dihubungi wali — orang tua menyatakan akan datang ke sekolah Rabu.', tags: ['kehadiran', 'perlu-tindak-lanjut'] },
  { id: 3, sId: 'S003', tgl: '26 Apr', kategori: 'akademik' as const, icon: 'book' as IconName, text: 'Kesulitan konsisten pada konsep abstrak. Lebih responsif dengan manipulatif fisik. Disarankan diferensiasi dengan media konkret.', tags: ['gaya-belajar', 'matematika'] },
  { id: 4, sId: 'S005', tgl: '25 Apr', kategori: 'sosial' as const, icon: 'users' as IconName, text: 'Mulai membuka diri di kelompok. Tadi siang membantu siswa baru beradaptasi.', tags: ['perkembangan-sosial'] },
  { id: 5, sId: 'S008', tgl: '24 Apr', kategori: 'positif' as const, icon: 'star' as IconName, text: 'Inisiatif membuat ringkasan visual untuk kelompoknya. Karya yang sangat rapi dan informatif.', tags: ['kreativitas'] },
  { id: 6, sId: 'S011', tgl: '23 Apr', kategori: 'akademik' as const, icon: 'book' as IconName, text: 'Tertinggal pada materi Lingkaran. Direkomendasikan ikut sesi remedial Sabtu.', tags: ['remedial'] },
];

const KATEGORI_COLOR = {
  positif: { bg: 'var(--color-good-soft)', border: '#86EFAC', text: 'var(--color-good)' },
  perhatian: { bg: 'var(--color-bad-soft)', border: '#FCA5A5', text: 'var(--color-bad)' },
  akademik: { bg: 'var(--color-primary-soft)', border: 'var(--color-primary)', text: 'var(--color-primary)' },
  sosial: { bg: 'var(--color-accent-soft)', border: '#67E8F9', text: '#0E7490' },
};

export default async function CatatanPage() {
  const students = await getStudents();
  const find = (id: string) => students.find(s => s.id === id);

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>Catatan Siswa</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            Observasi anekdotal · 47 catatan bulan ini · 6 perlu tindak lanjut
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline"><Icon name="mic" size={14} /> Voice note</button>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> Catatan baru</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3"><StatCard label="Catatan positif" value="28" foot="60% dari total" icon="star" accent="#10B981" /></div>
        <div className="col-span-3"><StatCard label="Perlu perhatian" value="6" foot="3 menunggu tindak lanjut" icon="alert" accent="#EF4444" /></div>
        <div className="col-span-3"><StatCard label="Catatan akademik" value="9" foot="terhubung ke CP" icon="book" accent="#4F46E5" /></div>
        <div className="col-span-3"><StatCard label="Voice notes" value="14" foot="auto-transkripsi" icon="mic" accent="#F59E0B" /></div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <div className="card">
            <div className="card-title">
              <h3>Linimasa catatan</h3>
              <div className="seg">
                <button className="seg-btn active">Semua</button>
                <button className="seg-btn">Positif</button>
                <button className="seg-btn">Perhatian</button>
                <button className="seg-btn">Akademik</button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {NOTES.map(n => {
                const s = find(n.sId);
                if (!s) return null;
                const c = KATEGORI_COLOR[n.kategori];
                return (
                  <div key={n.id} style={{
                    padding: 14, border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.text}`,
                    borderRadius: 12, background: c.bg,
                  }}>
                    <div className="flex justify-between mb-2">
                      <Link href={`/siswa/${s.id}`} className="flex gap-3 items-center">
                        <StudentAvatar student={s} size={32} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.nama}</div>
                          <div className="tiny muted">{s.kelas} · {n.tgl} 2026</div>
                        </div>
                      </Link>
                      <span style={{ fontSize: 11, fontWeight: 700, color: c.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Icon name={n.icon} size={12} style={{ verticalAlign: 'middle' }} /> {n.kategori}
                      </span>
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-ink-2)' }}>{n.text}</div>
                    <div className="flex gap-1" style={{ marginTop: 10 }}>
                      {n.tags.map(t => (
                        <span key={t} className="tiny" style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.7)', borderRadius: 999, color: 'var(--color-ink-3)' }}>#{t}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-4">
          <div className="ai-card">
            <div className="ai-badge">
              <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
              Sintesis AI
            </div>
            <div className="ai-text">
              Dari 47 catatan bulan ini, pola yang muncul: <strong>Siti Nurhaliza</strong> tampil sebagai pemimpin kelompok alami, dan <strong>3 siswa</strong> butuh bantuan diferensiasi dengan media konkret untuk konsep abstrak.
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <h3>Tindak lanjut tertunda</h3>
              <Pill kind="bad" dot>3</Pill>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { sId: 'S007', action: 'Pertemuan wali Rabu 13:00', urgent: true },
                { sId: 'S003', action: 'Rencana diferensiasi Lingkaran', urgent: false },
                { sId: 'S011', action: 'Daftar remedial Sabtu', urgent: false },
              ].map((t, i) => {
                const s = find(t.sId);
                if (!s) return null;
                return (
                  <div key={i} className="flex gap-3 items-center" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-line)' }}>
                    <StudentAvatar student={s} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="small" style={{ fontWeight: 600 }}>{s.nama.split(' ')[0]}</div>
                      <div className="tiny muted">{t.action}</div>
                    </div>
                    {t.urgent && <Pill kind="bad" dot>Hari ini</Pill>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
