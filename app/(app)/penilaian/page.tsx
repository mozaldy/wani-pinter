import { Icon } from '@/components/Icon';
import { Pill, StatCard, StudentAvatar } from '@/components/ui';
import { getStudents } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';

const TPS = [
  'TP-1: Konsep dasar',
  'TP-2: Eliminasi',
  'TP-3: Substitusi',
  'TP-4: Aplikasi',
  'TP-5: Pemecahan masalah',
];

function colorFor(v: number) {
  return v >= 85 ? 'var(--color-good)' : v >= 75 ? '#84CC16' : v >= 65 ? 'var(--color-warn)' : 'var(--color-bad)';
}

export default async function PenilaianPage() {
  const students = await getStudents();
  const dict = await getDictionary();
  const grades = students.slice(0, 10).map(s => ({
    student: s,
    nilai: TPS.map((_, i) => {
      const base = s.cp_matematika + (i % 3) * 4 - 6;
      return Math.max(0, Math.min(100, Math.round(base)));
    }),
  }));

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>{dict.penilaian.title}</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            {dict.penilaian.subtitle}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline"><Icon name="upload" size={14} /> {dict.penilaian.imporQuizizz}</button>
          <button className="btn btn-outline"><Icon name="download" size={14} /> {dict.penilaian.ekspor}</button>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> {dict.penilaian.penilaianBaru}</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3"><StatCard label={dict.penilaian.statRerataKelas} value="78.4" foot={dict.penilaian.statRerataKelasFoot} trend="up" icon="target" accent="#4F46E5" /></div>
        <div className="col-span-3"><StatCard label={dict.penilaian.statTuntasKkm} value="84%" foot={dict.penilaian.statTuntasKkmFoot} icon="check" accent="#10B981" /></div>
        <div className="col-span-3"><StatCard label={dict.penilaian.statBelumTuntas} value="5" foot={dict.penilaian.statBelumTuntasFoot} icon="alert" accent="#F59E0B" /></div>
        <div className="col-span-3"><StatCard label={dict.penilaian.statTugasTertunda} value="2" foot={dict.penilaian.statTugasTertundaFoot} icon="clipboard" accent="#EF4444" /></div>
      </div>

      <div className="card mb-4">
        <div className="card-title">
          <div className="seg">
            <button className="seg-btn active">{dict.penilaian.tabFormatif}</button>
            <button className="seg-btn">{dict.penilaian.tabSumatif}</button>
            <button className="seg-btn">{dict.penilaian.tabSikap}</button>
          </div>
          <div className="flex gap-2 items-center">
            <span className="tiny muted">{dict.penilaian.skalaHint}</span>
            <button className="btn btn-ghost"><Icon name="filter" size={14} /></button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="tbl" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ width: 240 }}>{dict.penilaian.colSiswa}</th>
                {TPS.map((tp, i) => (
                  <th key={i} style={{ minWidth: 110, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>TP-{i + 1}</div>
                    <div className="tiny" style={{ fontSize: 9, fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--color-ink-4)', marginTop: 2 }}>{tp.split(': ')[1]}</div>
                  </th>
                ))}
                <th style={{ minWidth: 80, textAlign: 'center' }}>{dict.penilaian.colRerata}</th>
                <th style={{ minWidth: 80, textAlign: 'center' }}>{dict.penilaian.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(g => {
                const avg = Math.round(g.nilai.reduce((a, b) => a + b, 0) / g.nilai.length);
                return (
                  <tr key={g.student.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <StudentAvatar student={g.student} size={28} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-ink)' }}>{g.student.nama}</div>
                          <div className="tiny muted">{g.student.nis}</div>
                        </div>
                      </div>
                    </td>
                    {g.nilai.map((v, i) => (
                      <td key={i} style={{ textAlign: 'center', padding: 6 }}>
                        <button style={{
                          width: 64, height: 32, borderRadius: 8,
                          background: 'transparent', border: '1px solid var(--color-line)',
                          color: colorFor(v), fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-mono)',
                        }}>{v}</button>
                      </td>
                    ))}
                    <td style={{ textAlign: 'center' }}>
                      <span className="h-display" style={{ fontSize: 18, fontWeight: 600, color: colorFor(avg) }}>{avg}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Pill kind={avg >= 75 ? 'good' : 'bad'} dot>{avg >= 75 ? dict.penilaian.tuntas : dict.penilaian.remedial}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <div className="card">
            <div className="card-title">
              <h3>{dict.penilaian.distribusiNilaiTitle}</h3>
              <span className="sub">{dict.penilaian.distribusiNilaiSub}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, padding: '8px 0' }}>
              {[
                { range: '0–40', count: 1, c: 'var(--color-bad)' },
                { range: '41–55', count: 2, c: 'var(--color-bad)' },
                { range: '56–65', count: 3, c: 'var(--color-warn)' },
                { range: '66–74', count: 4, c: 'var(--color-warn)' },
                { range: '75–84', count: 18, c: '#84CC16' },
                { range: '85–94', count: 16, c: 'var(--color-good)' },
                { range: '95–100', count: 6, c: 'var(--color-good)' },
              ].map((b, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div className="tiny" style={{ fontWeight: 700 }}>{b.count}</div>
                  <div style={{ width: '100%', height: `${(b.count / 18) * 100}%`, background: b.c, borderRadius: '6px 6px 0 0', minHeight: 4 }} />
                  <div className="tiny muted" style={{ fontSize: 10 }}>{b.range}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-6">
          <div className="ai-card">
            <div className="ai-badge">
              <span className="ai-glyph"><Icon name="sparkle" size={11} /></span>
              {dict.penilaian.saranRubrikBadge}
            </div>
            <div className="ai-text">
              <strong>TP-3 (Substitusi)</strong> {interpolate(dict.penilaian.saranRubrikBody, { rerata: 67 })}
            </div>
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {[
                { l: 'MAHIR (85–100)', d: 'Substitusi tepat, memilih variabel paling efisien, hasil benar', c: 'var(--color-good)' },
                { l: 'BERKEMBANG (65–84)', d: 'Substitusi benar tapi pilih variabel kurang efisien', c: 'var(--color-warn)' },
                { l: 'PERLU BIMBINGAN (<65)', d: 'Kesulitan mengisolasi variabel atau salah operasi', c: 'var(--color-bad)' },
              ].map(r => (
                <div key={r.l} style={{ padding: 10, background: 'var(--color-surface)', borderRadius: 8, border: '1px solid var(--color-line)' }}>
                  <div className="tiny" style={{ fontWeight: 700, color: r.c }}>{r.l}</div>
                  <div className="small">{r.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
