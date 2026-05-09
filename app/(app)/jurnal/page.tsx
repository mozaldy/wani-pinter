import { Icon } from '@/components/Icon';
import { Pill, StatCard } from '@/components/ui';
import { QuickInputButton } from '@/components/QuickInputButton';

const JOURNALS = [
  { id: 1, tgl: '27 Apr 2026', hari: 'Senin', jam: '07.00–08.20', mapel: 'Matematika', kelas: 'VIII-A', topic: 'Sistem Persamaan Linear Dua Variabel · Pertemuan 3', metode: 'Diskusi kelompok', cp: 'CP-MTK-8.2', hadir: 30, total: 32, mood: 'good' as const, notes: 'Diskusi kelompok berjalan baik. Bagas mulai aktif bertanya. Perlu lebih banyak contoh kontekstual untuk konsep eliminasi.' },
  { id: 2, tgl: '26 Apr 2026', hari: 'Jumat', jam: '08.20–09.40', mapel: 'Matematika', kelas: 'VIII-B', topic: 'Sistem Persamaan Linear · Pertemuan 2', metode: 'Ekspositori + latihan', cp: 'CP-MTK-8.2', hadir: 28, total: 30, mood: 'ok' as const, notes: 'Beberapa siswa kesulitan dengan metode substitusi. Direkomendasikan remedial mini.' },
  { id: 3, tgl: '25 Apr 2026', hari: 'Kamis', jam: '10.00–11.20', mapel: 'Matematika', kelas: 'IX-A', topic: 'Bangun Ruang Sisi Lengkung · Pengantar', metode: 'Demonstrasi + manipulatif', cp: 'CP-MTK-9.4', hadir: 31, total: 32, mood: 'good' as const, notes: 'Manipulatif tabung dari kardus efektif. Siswa antusias.' },
  { id: 4, tgl: '24 Apr 2026', hari: 'Rabu', jam: '12.30–13.50', mapel: 'Matematika', kelas: 'VII-A', topic: 'Bilangan Bulat · Operasi Campuran', metode: 'Game-based', cp: 'CP-MTK-7.1', hadir: 29, total: 30, mood: 'good' as const, notes: 'Game kartu operasi efektif untuk remedial.' },
  { id: 5, tgl: '23 Apr 2026', hari: 'Selasa', jam: '07.00–08.20', mapel: 'Matematika', kelas: 'VIII-A', topic: 'Sistem Persamaan Linear · Pertemuan 2', metode: 'Inquiry', cp: 'CP-MTK-8.2', hadir: 32, total: 32, mood: 'good' as const, notes: 'Kehadiran penuh. Strategi inquiry memunculkan banyak pertanyaan kritis.' },
];

const MOOD_COLOR = { good: 'var(--color-good)', ok: 'var(--color-warn)', bad: 'var(--color-bad)' };
const MOOD_LABEL = { good: 'Lancar', ok: 'Cukup', bad: 'Perlu evaluasi' };

export default function JurnalPage() {
  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>Jurnal Harian</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            Catatan KBM · 47 entri semester ini · 4 menunggu refleksi
          </div>
        </div>
        <div className="flex gap-2">
          <div className="seg">
            <button className="seg-btn active">Timeline</button>
            <button className="seg-btn">Kalender</button>
          </div>
          <QuickInputButton primary><Icon name="plus" size={14} /> Jurnal baru</QuickInputButton>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3"><StatCard label="Entri minggu ini" value="12" foot="dari 14 jadwal" trend="up" icon="clipboard" accent="#4F46E5" /></div>
        <div className="col-span-3"><StatCard label="Konsistensi" value="89%" foot="naik 12% bulan ini" trend="up" icon="target" accent="#10B981" /></div>
        <div className="col-span-3"><StatCard label="Refleksi tertulis" value="34" foot="dari 47 entri" icon="fileText" accent="#06B6D4" /></div>
        <div className="col-span-3"><StatCard label="Catatan AI" value="8" foot="pola tindak lanjut" icon="sparkle" accent="#F59E0B" /></div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <div className="card">
            <div className="card-title">
              <h3>Entri terbaru</h3>
              <div className="seg">
                <button className="seg-btn active">Semua</button>
                <button className="seg-btn">VIII-A</button>
                <button className="seg-btn">VIII-B</button>
                <button className="seg-btn">IX-A</button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {JOURNALS.map(j => (
                <div key={j.id} style={{
                  display: 'grid', gridTemplateColumns: '70px 1fr', gap: 16,
                  padding: '14px 0', borderBottom: '1px solid var(--color-line)',
                }}>
                  <div style={{ textAlign: 'center', borderRight: '1px solid var(--color-line)', paddingRight: 12 }}>
                    <div className="h-display" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1 }}>{j.tgl.split(' ')[0]}</div>
                    <div className="tiny muted" style={{ marginTop: 2 }}>{j.tgl.split(' ')[1]}</div>
                    <div className="tiny" style={{ color: MOOD_COLOR[j.mood], fontWeight: 600, marginTop: 6 }}>● {j.hari}</div>
                  </div>
                  <div>
                    <div className="flex gap-2 mb-2 flex-wrap items-center">
                      <Pill kind="primary">{j.mapel}</Pill>
                      <Pill kind="ink">{j.kelas}</Pill>
                      <Pill kind="accent">{j.cp}</Pill>
                      <span className="tiny muted" style={{ fontFamily: 'var(--font-mono)' }}>{j.jam}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{j.topic}</div>
                    <div className="small muted" style={{ marginBottom: 8 }}>{j.notes}</div>
                    <div className="flex gap-3 tiny muted">
                      <span><Icon name="users" size={12} style={{ verticalAlign: 'middle' }} /> {j.hadir}/{j.total} hadir</span>
                      <span><Icon name="layers" size={12} style={{ verticalAlign: 'middle' }} /> {j.metode}</span>
                      <span style={{ color: MOOD_COLOR[j.mood], fontWeight: 600 }}>● {MOOD_LABEL[j.mood]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-4">
          <div className="ai-card">
            <div className="ai-badge">
              <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
              Pola dari jurnal Anda
            </div>
            <div className="ai-text">
              <strong>Diskusi kelompok</strong> menghasilkan tingkat kehadiran 4% lebih tinggi dan refleksi siswa yang lebih dalam dibandingkan ekspositori. Pertimbangkan untuk meningkatkan frekuensi metode ini di kelas VIII-B.
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <h3>Distribusi metode</h3>
              <span className="sub">30 hari</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { l: 'Diskusi kelompok', v: 38, c: '#4F46E5' },
                { l: 'Ekspositori', v: 28, c: '#06B6D4' },
                { l: 'Inquiry', v: 18, c: '#10B981' },
                { l: 'Demonstrasi', v: 10, c: '#F59E0B' },
                { l: 'Game-based', v: 6, c: '#EC4899' },
              ].map(m => (
                <div key={m.l} className="bar-row" style={{ gridTemplateColumns: '110px 1fr 36px' }}>
                  <span className="small">{m.l}</span>
                  <div className="bar-track">
                    <div style={{ width: `${m.v}%`, height: '100%', background: m.c, borderRadius: 999 }} />
                  </div>
                  <span className="tiny" style={{ textAlign: 'right', fontWeight: 600 }}>{m.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
