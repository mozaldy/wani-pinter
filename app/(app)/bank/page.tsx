import { Icon, type IconName } from '@/components/Icon';
import { Pill, StatCard } from '@/components/ui';
import { getMapel } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';

const SOAL = [
  { id: 'Q-001', kode: 'CP-MTK-4.2', tingkat: 'mudah', tipe: 'PG', text: 'Hasil dari 3.456 + 2.345 adalah ...', tags: ['bersusun', 'dasar'], dipakai: 12, sukses: 88, pembuat: 'Sari R.' },
  { id: 'Q-002', kode: 'CP-MTK-4.2', tingkat: 'sedang', tipe: 'Esai', text: 'Toko Bu Rina memiliki 4.250 butir telur. Hari ini terjual 1.875 butir, lalu sore hari datang kiriman 2.400 butir. Berapa butir telur Bu Rina sekarang?', tags: ['cerita', 'kontekstual'], dipakai: 8, sukses: 72, pembuat: 'AI Generated' },
  { id: 'Q-003', kode: 'CP-MTK-4.5', tingkat: 'sulit', tipe: 'Esai', text: 'Sebuah pita dibagi menjadi 8 bagian sama panjang. Ani mengambil 3/8 bagian dan Budi mengambil 6/16 bagian. Apakah bagian mereka sama? Jelaskan dengan pecahan senilai.', tags: ['pecahan senilai', 'membandingkan'], dipakai: 4, sukses: 45, pembuat: 'Bp. Hadi' },
  { id: 'Q-004', kode: 'CP-MTK-4.4', tingkat: 'sedang', tipe: 'PG', text: 'Manakah yang merupakan semua faktor dari 12?', tags: ['faktor'], dipakai: 24, sukses: 91, pembuat: 'Sari R.' },
  { id: 'Q-005', kode: 'CP-MTK-4.1', tingkat: 'mudah', tipe: 'Isian', text: 'Bilangan "tujuh ribu dua ratus tiga puluh lima" ditulis ...', tags: ['nilai tempat'], dipakai: 18, sukses: 95, pembuat: 'Bank Nasional' },
  { id: 'Q-006', kode: 'CP-MTK-4.5', tingkat: 'sedang', tipe: 'PG', text: 'Pecahan yang senilai dengan 1/2 adalah ...', tags: ['pecahan senilai'], dipakai: 11, sukses: 78, pembuat: 'AI Generated' },
];

const TINGKAT_KIND: Record<string, 'good' | 'warn' | 'bad'> = { mudah: 'good', sedang: 'warn', sulit: 'bad' };

export default async function BankSoalPage() {
  const mapel = await getMapel();
  const dict = await getDictionary();
  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>{dict.bank.title}</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            {dict.bank.subtitle}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline"><Icon name="sparkle" size={14} /> {dict.bank.generateAi}</button>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> {dict.bank.soalBaru}</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3"><StatCard label={dict.bank.statTotalSoal} value="342" foot={dict.bank.statTotalSoalFoot} icon="folder" accent="var(--color-primary)" /></div>
        <div className="col-span-3"><StatCard label={dict.bank.statCakupanCp} value="8/8" foot={dict.bank.statCakupanCpFoot} icon="target" accent="#10B981" /></div>
        <div className="col-span-3"><StatCard label={dict.bank.statTingkatSukses} value="79%" foot={dict.bank.statTingkatSuksesFoot} icon="check" accent="var(--color-olive)" /></div>
        <div className="col-span-3"><StatCard label={dict.bank.statSoalAi} value="84" foot={dict.bank.statSoalAiFoot} icon="sparkle" accent="#F59E0B" /></div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <div className="card">
            <div className="card-title"><h3 style={{ fontSize: 13 }}>{dict.bank.filterTitle}</h3></div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="tiny muted mb-2" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{dict.bank.filterMapel}</div>
                <div className="flex flex-col gap-1">
                  {mapel.map(m => (
                    <label key={m.kode} className="flex gap-2 small items-center" style={{ cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={m.kode === 'MTK'} />
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: m.color }} />
                      <span>{m.nama}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="tiny muted mb-2" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{dict.bank.filterTingkat}</div>
                <div className="seg" style={{ width: '100%' }}>
                  <button className="seg-btn active" style={{ flex: 1 }}>{dict.common.semua}</button>
                  <button className="seg-btn" style={{ flex: 1 }}>M</button>
                  <button className="seg-btn" style={{ flex: 1 }}>S</button>
                  <button className="seg-btn" style={{ flex: 1 }}>K</button>
                </div>
              </div>
              <div>
                <div className="tiny muted mb-2" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{dict.bank.filterTipe}</div>
                <div className="flex flex-col gap-1">
                  {['Pilihan Ganda', 'Esai', 'Isian Singkat', 'Benar/Salah', 'Menjodohkan'].map(t => (
                    <label key={t} className="flex gap-2 small items-center">
                      <input type="checkbox" defaultChecked={['Pilihan Ganda', 'Esai'].includes(t)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="tiny muted mb-2" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{dict.bank.filterSumber}</div>
                <div className="flex flex-col gap-1">
                  {['Pribadi', 'Kolega sekolah', 'Bank Nasional', 'AI Generated'].map(t => (
                    <label key={t} className="flex gap-2 small items-center">
                      <input type="checkbox" defaultChecked />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-9">
          <div className="card">
            <div className="card-title">
              <h3>{interpolate(dict.bank.soalCountTitle, { count: SOAL.length })}</h3>
              <div className="flex gap-2">
                <div className="search" style={{ width: 200 }}>
                  <Icon name="search" size={13} />
                  <input placeholder={dict.bank.searchPlaceholder} />
                </div>
                <div className="seg">
                  <button className="seg-btn active">{dict.bank.kartu}</button>
                  <button className="seg-btn">{dict.bank.tabel}</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {SOAL.map(q => (
                <div key={q.id} style={{ padding: 14, border: '1px solid var(--color-line)', borderRadius: 12, background: 'var(--color-surface)' }}>
                  <div className="flex justify-between mb-2 flex-wrap gap-2">
                    <div className="flex gap-1 flex-wrap items-center">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-3)' }}>{q.id}</span>
                      <Pill kind="primary">{q.kode}</Pill>
                      <Pill kind={TINGKAT_KIND[q.tingkat]}>{q.tingkat}</Pill>
                      <Pill kind="ink">{q.tipe}</Pill>
                      {q.pembuat === 'AI Generated' && <Pill kind="accent" dot>AI</Pill>}
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost"><Icon name={'eye' as IconName} size={14} /></button>
                      <button className="btn btn-ghost"><Icon name="edit" size={14} /></button>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-ink)', marginBottom: 10 }}>{q.text}</div>
                  <div className="flex justify-between">
                    <div className="flex gap-2 tiny muted">
                      <span><Icon name="users" size={11} /> {interpolate(dict.bank.dipakai, { count: q.dipakai })}</span>
                      <span><Icon name="check" size={11} /> {interpolate(dict.bank.sukses, { percent: q.sukses })}</span>
                      <span>{interpolate(dict.bank.oleh, { pembuat: q.pembuat })}</span>
                    </div>
                    <div className="flex gap-1">
                      {q.tags.map(t => <span key={t} className="tiny" style={{ padding: '2px 7px', background: 'var(--color-surface-2)', borderRadius: 999, color: 'var(--color-ink-3)' }}>#{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
