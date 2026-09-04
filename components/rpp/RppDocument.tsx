import type { Rpp, Pertemuan } from '@/lib/rpp';

// Read-only rendering of a full Modul Ajar. Feeds three consumers: the on-screen
// print preview, the browser print/PDF path, and the .docx export. html-to-docx
// only understands plain block elements plus inline styles — no classes, no
// flexbox, no grid — and that happens to be exactly what prints well too.

const BOX: React.CSSProperties = {
  border: '1px dashed #333', padding: '10px 14px', marginBottom: 14,
};
const H: React.CSSProperties = { fontSize: 13, fontWeight: 700, margin: '0 0 6px' };
const P: React.CSSProperties = { fontSize: 12, lineHeight: 1.6, margin: '0 0 6px', textAlign: 'justify' };
const TABLE: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 12 };
const TD: React.CSSProperties = { border: '1px solid #333', padding: '6px 8px', verticalAlign: 'top' };
const TH: React.CSSProperties = { ...TD, background: '#D6E4E5', fontWeight: 700, textAlign: 'center' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={BOX}>
      <p style={H}>{title}</p>
      {children}
    </div>
  );
}

function Bullets({ items, ordered }: { items: string[]; ordered?: boolean }) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <List style={{ margin: '0 0 0 18px', padding: 0, fontSize: 12, lineHeight: 1.6 }}>
      {items.map((t, i) => <li key={i} style={{ marginBottom: 3 }}>{t}</li>)}
    </List>
  );
}

function PertemuanBlock({ p }: { p: Pertemuan }) {
  if (!p.langkah.length) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ background: '#C7D7F5', border: '1px solid #333', padding: '6px 10px', fontWeight: 700, fontSize: 12.5, margin: '0 0 8px' }}>
        Pertemuan {p.no} &ldquo;{p.judul}&rdquo;
      </p>
      <p style={{ ...P, margin: '0 0 2px' }}><strong>Pengalaman belajar:</strong> {p.pengalamanBelajar}</p>
      <p style={{ ...P, margin: '0 0 2px' }}><strong>Prinsip Pembelajaran:</strong> {p.prinsip.join(', ')}</p>
      <p style={{ ...P, margin: '0 0 8px' }}><strong>Media:</strong> {p.media}</p>
      <Bullets items={p.langkah} ordered />
    </div>
  );
}

function LampiranBlock({ p, index }: { p: Pertemuan; index: number }) {
  if (!p.asesmen) return null;
  const a = p.asesmen;
  return (
    <div style={{ marginBottom: 22 }}>
      <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>Lampiran {index}</p>
      <p style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', margin: '0 0 10px' }}>
        Asesmen Formatif Pertemuan {p.no} &ndash; {p.judul}
      </p>
      <p style={P}><strong>Tujuan:</strong> {a.tujuan}</p>
      <p style={P}><strong>Teknik:</strong> {a.teknik}</p>
      <p style={{ ...P, fontWeight: 700 }}>Rubrik Penilaian:</p>
      <table style={TABLE}>
        <tbody>
          <tr>
            <th style={{ ...TH, width: '60%' }}>Aspek yang Diamati</th>
            <th style={TH}>Mampu</th>
            <th style={TH}>Belum</th>
          </tr>
          {a.rubrik.map((r, i) => (
            <tr key={i}>
              <td style={TD}>{r}</td>
              <td style={{ ...TD, textAlign: 'center' }}>&#9744;</td>
              <td style={{ ...TD, textAlign: 'center' }}>&#9744;</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={P}><strong>Kriteria Keberhasilan:</strong> {a.kriteria}</p>
      <p style={{ ...P, fontWeight: 700, marginBottom: 2 }}>Tindak Lanjut:</p>
      <Bullets items={a.tindakLanjut} />
    </div>
  );
}

export function RppDocument({ rpp }: { rpp: Rpp }) {
  const id = rpp.identitas;
  const terisi = rpp.pertemuan.filter(p => p.langkah.length > 0);
  const lampiran = rpp.pertemuan.filter(p => p.asesmen);

  return (
    <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#111', maxWidth: 780, margin: '0 auto' }}>
      <h1 style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', margin: '0 0 20px', textTransform: 'uppercase' }}>
        {id.judul}
      </h1>

      <table style={{ ...TABLE, marginBottom: 20 }}>
        <tbody>
          {[
            ['Satuan Pendidikan', id.satuan],
            ['Mata Pelajaran', id.mapel],
            ['Fase/ Kelas/ Semester', `${id.fase}/ ${id.kelas}/ ${id.semester}`],
            ['Alokasi Waktu', id.alokasi],
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ border: 'none', padding: '2px 0', width: 190, fontSize: 12 }}>{k}</td>
              <td style={{ border: 'none', padding: '2px 0', fontSize: 12 }}>: {v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Section title="Identifikasi Murid"><p style={P}>{rpp.identifikasiMurid}</p></Section>
      <Section title="Identifikasi Materi"><p style={P}>{rpp.identifikasiMateri}</p></Section>
      <Section title="Dimensi Profil Lulusan"><p style={P}>{rpp.dimensiProfilLulusan.join(', ')}</p></Section>
      <Section title="Tujuan Pembelajaran"><p style={P}>{rpp.tujuanPembelajaran}</p></Section>
      <Section title="Kriteria Ketercapaian Tujuan Pembelajaran (Kriteria Sukses)"><Bullets items={rpp.indikator} ordered /></Section>
      <Section title="Praktik Pedagogis"><p style={P}>{rpp.praktikPedagogis}</p></Section>
      <Section title="Lingkungan Pembelajaran"><p style={P}>{rpp.lingkunganPembelajaran}</p></Section>
      <Section title="Kemitraan Pembelajaran"><p style={P}>{rpp.kemitraanPembelajaran}</p></Section>
      <Section title="Pemanfaatan Digital"><p style={P}>{rpp.pemanfaatanDigital}</p></Section>

      <p style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', margin: '18px 0 8px' }}>
        Alur Belajar ({rpp.rutePertemuan.length} Pertemuan)
      </p>
      <table style={TABLE}>
        <tbody>
          <tr>
            <th style={{ ...TH, width: 90 }}>Pertemuan</th>
            <th style={TH}>Tujuan per Pertemuan</th>
            <th style={TH}>Aktivitas</th>
            <th style={{ ...TH, width: 120 }}>Alokasi Waktu</th>
          </tr>
          {rpp.rutePertemuan.map(r => (
            <tr key={r.no}>
              <td style={{ ...TD, textAlign: 'center' }}>{r.no}</td>
              <td style={TD}>{r.tujuan}</td>
              <td style={TD}>{r.aktivitas}</td>
              <td style={TD}>{r.alokasi}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {terisi.length > 0 && (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '18px 0 10px' }}>Langkah-Langkah Pembelajaran</p>
          {terisi.map(p => <PertemuanBlock key={p.no} p={p} />)}
        </>
      )}

      <p style={{ fontSize: 13, fontWeight: 700, margin: '18px 0 6px' }}>Asesmen Sumatif</p>
      <p style={P}>{rpp.asesmenSumatif}</p>

      <p style={{ fontSize: 13, fontWeight: 700, margin: '18px 0 6px' }}>Rencana Tindak Lanjut</p>
      <Bullets items={rpp.rencanaTindakLanjut ?? []} />

      <p style={{ fontSize: 13, fontWeight: 700, margin: '18px 0 6px' }}>Daftar Pustaka</p>
      <Bullets items={rpp.daftarPustaka} />

      {lampiran.length > 0 && (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '22px 0 8px' }}>Daftar Lampiran</p>
          <Bullets items={lampiran.map(p => `Asesmen Formatif Pertemuan ${p.no}`)} ordered />
          <div style={{ marginTop: 20 }}>
            {lampiran.map((p, i) => <LampiranBlock key={p.no} p={p} index={i + 1} />)}
          </div>
        </>
      )}
    </div>
  );
}
