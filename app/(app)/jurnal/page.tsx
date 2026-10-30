import { Icon } from '@/components/Icon';
import { Pill, StatCard } from '@/components/ui';
import { QuickInputButton } from '@/components/QuickInputButton';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';

const JOURNALS = [
  { id: 1, tgl: '27 Apr 2026', hari: 'Senin', jam: '07.00–08.10', mapel: 'Matematika', kelas: 'IV-A', topic: 'Penjumlahan dan Pengurangan Bilangan Cacah · Pertemuan 3', metode: 'Diskusi kelompok', cp: 'CP-MTK-4.2', hadir: 30, total: 32, mood: 'good' as const, notes: 'Diskusi kelompok berjalan baik. Bagas mulai aktif bertanya. Perlu lebih banyak contoh kontekstual untuk konsep meminjam pada pengurangan.' },
  { id: 2, tgl: '26 Apr 2026', hari: 'Jumat', jam: '08.10–09.20', mapel: 'Matematika', kelas: 'IV-B', topic: 'Penjumlahan dan Pengurangan Bilangan Cacah · Pertemuan 2', metode: 'Ekspositori + latihan', cp: 'CP-MTK-4.2', hadir: 28, total: 30, mood: 'ok' as const, notes: 'Beberapa siswa kesulitan pada pengurangan bersusun dengan meminjam. Direkomendasikan remedial mini.' },
  { id: 3, tgl: '25 Apr 2026', hari: 'Kamis', jam: '09.40–10.50', mapel: 'Matematika', kelas: 'V-A', topic: 'Volume Kubus dan Balok · Pengantar', metode: 'Demonstrasi + manipulatif', cp: 'CP-MTK-5.4', hadir: 31, total: 32, mood: 'good' as const, notes: 'Susunan kubus satuan dari balok mainan efektif. Siswa antusias.' },
  { id: 4, tgl: '24 Apr 2026', hari: 'Rabu', jam: '10.50–12.00', mapel: 'Matematika', kelas: 'III-A', topic: 'Bilangan Cacah sampai 1.000 · Nilai Tempat', metode: 'Game-based', cp: 'CP-MTK-3.1', hadir: 29, total: 30, mood: 'good' as const, notes: 'Game kartu nilai tempat efektif untuk remedial.' },
  { id: 5, tgl: '23 Apr 2026', hari: 'Selasa', jam: '07.00–08.10', mapel: 'Matematika', kelas: 'IV-A', topic: 'Penjumlahan dan Pengurangan Bilangan Cacah · Pertemuan 2', metode: 'Inquiry', cp: 'CP-MTK-4.2', hadir: 32, total: 32, mood: 'good' as const, notes: 'Kehadiran penuh. Strategi inquiry memunculkan banyak pertanyaan kritis.' },
];

const MOOD_COLOR = { good: 'var(--color-good)', ok: 'var(--color-warn)', bad: 'var(--color-bad)' };

export default async function JurnalPage() {
  const dict = await getDictionary();
  const MOOD_LABEL = dict.jurnal.moodLabel;
  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>{dict.jurnal.title}</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            {dict.jurnal.subtitle}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="seg">
            <button className="seg-btn active">{dict.jurnal.timeline}</button>
            <button className="seg-btn">{dict.jurnal.kalender}</button>
          </div>
          <QuickInputButton primary><Icon name="plus" size={14} /> {dict.jurnal.jurnalBaru}</QuickInputButton>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3"><StatCard label={dict.jurnal.statEntriMinggu} value="12" foot={dict.jurnal.statEntriMingguFoot} trend="up" icon="clipboard" accent="#4F46E5" /></div>
        <div className="col-span-3"><StatCard label={dict.jurnal.statKonsistensi} value="89%" foot={dict.jurnal.statKonsistensiFoot} trend="up" icon="target" accent="#10B981" /></div>
        <div className="col-span-3"><StatCard label={dict.jurnal.statRefleksi} value="34" foot={dict.jurnal.statRefleksiFoot} icon="fileText" accent="#06B6D4" /></div>
        <div className="col-span-3"><StatCard label={dict.jurnal.statCatatanAi} value="8" foot={dict.jurnal.statCatatanAiFoot} icon="sparkle" accent="#F59E0B" /></div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <div className="card">
            <div className="card-title">
              <h3>{dict.jurnal.entriTerbaru}</h3>
              <div className="seg">
                <button className="seg-btn active">{dict.common.semua}</button>
                <button className="seg-btn">IV-A</button>
                <button className="seg-btn">IV-B</button>
                <button className="seg-btn">V-A</button>
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
                      <span><Icon name="users" size={12} style={{ verticalAlign: 'middle' }} /> {interpolate(dict.jurnal.hadirCount, { hadir: j.hadir, total: j.total })}</span>
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
              {dict.jurnal.polaTitle}
            </div>
            <div className="ai-text">
              <strong>Diskusi kelompok</strong> menghasilkan tingkat kehadiran 4% lebih tinggi dan refleksi siswa yang lebih dalam dibandingkan ekspositori. Pertimbangkan untuk meningkatkan frekuensi metode ini di kelas IV-B.
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <h3>{dict.jurnal.distribusiMetodeTitle}</h3>
              <span className="sub">{dict.jurnal.distribusiMetode30Hari}</span>
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
