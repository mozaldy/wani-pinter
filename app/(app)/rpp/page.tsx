import Link from 'next/link';
import { requireTeacher } from '@/lib/auth';
import { getRppList, getMapel } from '@/lib/queries';
import { CreateRppForm } from '@/components/rpp/CreateRppForm';
import { Pill } from '@/components/ui';
import { Icon } from '@/components/Icon';

export default async function RppPage() {
  const user = await requireTeacher();
  const [list, mapel] = await Promise.all([getRppList(user.userId), getMapel()]);

  return (
    <div className="screen-enter">
      <div className="mb-6">
        <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>RPP / Modul Ajar</h1>
        <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
          Kerangka Pembelajaran Mendalam · Kemendikdasmen
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <CreateRppForm mapel={mapel.map(m => m.nama)} jabatan={user.jabatan} />
        </div>

        <div className="col-span-5">
          <div className="card">
            <div className="card-title">
              <h3>Tersimpan</h3>
              <span className="sub">{list.length} modul</span>
            </div>

            {list.length === 0 ? (
              <div className="muted small" style={{ padding: '24px 0', textAlign: 'center' }}>
                Belum ada modul ajar. Isi formulir di samping untuk membuat yang pertama.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {list.map(r => (
                  <Link key={r.id} href={`/rpp/${r.id}`}
                    style={{ padding: 12, border: '1px solid var(--color-line)', borderRadius: 10, display: 'block' }}>
                    <div className="flex justify-between items-start gap-2">
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.judul}</div>
                        <div className="tiny muted" style={{ marginTop: 3 }}>
                          {r.mapel} · Kelas {r.kelas} · diubah {new Date(r.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <Pill kind={r.pertemuan_terisi === r.pertemuan_total ? 'good' : 'warn'}>
                        {r.pertemuan_terisi}/{r.pertemuan_total}
                      </Pill>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="ai-card" style={{ marginTop: 16 }}>
            <div className="ai-badge"><span className="ai-glyph"><Icon name="sparkle" size={11} /></span> Cara kerja</div>
            <div className="ai-text small">
              AI menyusun kerangka lebih dulu — identifikasi murid, tujuan, indikator, dan rute pertemuan.
              Langkah tiap pertemuan disusun belakangan, satu per satu, agar Anda bisa mengoreksi arah
              sebelum isinya diperinci. Semua bagian dapat Anda ubah sendiri atau lewat perintah ke AI.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
