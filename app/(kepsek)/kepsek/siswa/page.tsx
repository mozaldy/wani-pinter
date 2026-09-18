import { StudentAvatar, Pill } from '@/components/ui';
import { getStudents } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';

export default async function KepsekSiswaPage() {
  const [students, dict] = await Promise.all([getStudents(), getDictionary()]);

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>{dict.kepsek.siswa.title}</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            {interpolate(dict.kepsek.siswa.subtitle, { count: students.length })}
          </div>
        </div>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>{dict.kepsek.siswa.colSiswa}</th><th>{dict.kepsek.siswa.colKelas}</th><th>{dict.kepsek.siswa.colRerata}</th><th>{dict.kepsek.siswa.colKehadiran}</th><th>{dict.kepsek.siswa.colRisiko}</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <StudentAvatar student={s} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{s.nama}</div>
                      <div className="tiny muted">{interpolate(dict.kepsek.siswa.nisJkLine, { nis: s.nis, jk: dict.enums.jk[s.jk] })}</div>
                    </div>
                  </div>
                </td>
                <td>{s.kelas}</td>
                <td><strong style={{ color: s.rerata >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>{s.rerata}</strong></td>
                <td>{s.kehadiran}%</td>
                <td><Pill kind={s.risiko === 'rendah' ? 'good' : s.risiko === 'sedang' ? 'warn' : 'bad'} dot>{dict.enums.risiko[s.risiko]}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
