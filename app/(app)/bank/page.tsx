import { Icon, type IconName } from '@/components/Icon';
import { Pill, StatCard } from '@/components/ui';
import { getMapel } from '@/lib/queries';

const SOAL = [
  { id: 'Q-001', kode: 'CP-MTK-8.2', tingkat: 'mudah', tipe: 'PG', text: 'Tentukan nilai x dan y dari sistem persamaan: 2x + y = 10 dan x − y = 2', tags: ['eliminasi', 'dasar'], dipakai: 12, sukses: 88, pembuat: 'Sari R.' },
  { id: 'Q-002', kode: 'CP-MTK-8.2', tingkat: 'sedang', tipe: 'Esai', text: 'Sebuah toko menjual 3 buku dan 2 pensil seharga Rp 17.000, dan 2 buku dan 5 pensil seharga Rp 19.000. Tentukan harga 1 buku dan 1 pensil.', tags: ['cerita', 'kontekstual'], dipakai: 8, sukses: 72, pembuat: 'AI Generated' },
  { id: 'Q-003', kode: 'CP-MTK-8.5', tingkat: 'sulit', tipe: 'Esai', text: 'Diketahui lingkaran dengan jari-jari 14 cm. Hitung luas juring jika sudut pusat 60°.', tags: ['lingkaran', 'juring'], dipakai: 4, sukses: 45, pembuat: 'Bp. Hadi' },
  { id: 'Q-004', kode: 'CP-MTK-8.4', tingkat: 'sedang', tipe: 'PG', text: 'Sebuah segitiga siku-siku memiliki sisi tegak 6 cm dan 8 cm. Berapa panjang sisi miring?', tags: ['pythagoras'], dipakai: 24, sukses: 91, pembuat: 'Sari R.' },
  { id: 'Q-005', kode: 'CP-MTK-8.1', tingkat: 'mudah', tipe: 'Isian', text: '2³ × 2⁴ = 2^?', tags: ['eksponen'], dipakai: 18, sukses: 95, pembuat: 'Bank Nasional' },
  { id: 'Q-006', kode: 'CP-MTK-8.5', tingkat: 'sedang', tipe: 'PG', text: 'Keliling lingkaran dengan diameter 21 cm adalah... (π = 22/7)', tags: ['lingkaran', 'keliling'], dipakai: 11, sukses: 78, pembuat: 'AI Generated' },
];

const TINGKAT_KIND: Record<string, 'good' | 'warn' | 'bad'> = { mudah: 'good', sedang: 'warn', sulit: 'bad' };

export default async function BankSoalPage() {
  const mapel = await getMapel();
  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>Bank Soal</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            342 soal · 8 CP · terhubung ke Quizizz, Google Forms
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline"><Icon name="sparkle" size={14} /> Generate dengan AI</button>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> Soal baru</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3"><StatCard label="Total soal" value="342" foot="178 PG · 98 esai · 66 isian" icon="folder" accent="#4F46E5" /></div>
        <div className="col-span-3"><StatCard label="Cakupan CP" value="8/8" foot="100% kurikulum" icon="target" accent="#10B981" /></div>
        <div className="col-span-3"><StatCard label="Tingkat sukses rerata" value="79%" foot="dari 1.2k pengerjaan" icon="check" accent="#06B6D4" /></div>
        <div className="col-span-3"><StatCard label="Soal AI-generated" value="84" foot="ditinjau guru: 72" icon="sparkle" accent="#F59E0B" /></div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <div className="card">
            <div className="card-title"><h3 style={{ fontSize: 13 }}>Filter</h3></div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="tiny muted mb-2" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Mata Pelajaran</div>
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
                <div className="tiny muted mb-2" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Tingkat Kesulitan</div>
                <div className="seg" style={{ width: '100%' }}>
                  <button className="seg-btn active" style={{ flex: 1 }}>Semua</button>
                  <button className="seg-btn" style={{ flex: 1 }}>M</button>
                  <button className="seg-btn" style={{ flex: 1 }}>S</button>
                  <button className="seg-btn" style={{ flex: 1 }}>K</button>
                </div>
              </div>
              <div>
                <div className="tiny muted mb-2" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Tipe</div>
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
                <div className="tiny muted mb-2" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sumber</div>
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
              <h3>{SOAL.length} soal · CP-MTK-8.2</h3>
              <div className="flex gap-2">
                <div className="search" style={{ width: 200 }}>
                  <Icon name="search" size={13} />
                  <input placeholder="Cari soal..." />
                </div>
                <div className="seg">
                  <button className="seg-btn active">Kartu</button>
                  <button className="seg-btn">Tabel</button>
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
                      <span><Icon name="users" size={11} /> Dipakai {q.dipakai}×</span>
                      <span><Icon name="check" size={11} /> Sukses {q.sukses}%</span>
                      <span>Oleh: {q.pembuat}</span>
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
