import { StudentAvatar, Pill } from '@/components/ui';
import { getStudents } from '@/lib/queries';

export default async function KepsekSiswaPage() {
  const students = await getStudents();

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>Data Siswa</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            {students.length} siswa terdaftar · seluruh kelas
          </div>
        </div>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Siswa</th><th>Kelas</th><th>Rerata</th><th>Kehadiran</th><th>Risiko</th>
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
                      <div className="tiny muted">{s.nis} · {s.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                    </div>
                  </div>
                </td>
                <td>{s.kelas}</td>
                <td><strong style={{ color: s.rerata >= 75 ? 'var(--color-good)' : 'var(--color-bad)' }}>{s.rerata}</strong></td>
                <td>{s.kehadiran}%</td>
                <td><Pill kind={s.risiko === 'rendah' ? 'good' : s.risiko === 'sedang' ? 'warn' : 'bad'} dot>{s.risiko}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
