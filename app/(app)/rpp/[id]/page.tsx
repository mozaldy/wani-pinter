import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireTeacher } from '@/lib/auth';
import { getRpp } from '@/lib/queries';
import { RppEditor } from '@/components/rpp/RppEditor';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/ui';
import { deleteRpp } from '../actions';

export default async function RppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTeacher();
  const row = await getRpp(id, user.userId);
  if (!row) notFound();

  const rpp = row.content;
  const terisi = rpp.pertemuan.filter(p => p.langkah.length > 0).length;

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-start mb-6">
        <div style={{ minWidth: 0 }}>
          <Link href="/rpp" className="tiny muted">&larr; Semua modul ajar</Link>
          <h1 className="h-display" style={{ margin: '4px 0 0', fontSize: 24 }}>{rpp.identitas.judul}</h1>
          <div className="muted small flex gap-2 items-center" style={{ marginTop: 6 }}>
            {rpp.identitas.mapel} · Fase {rpp.identitas.fase} · Kelas {rpp.identitas.kelas} · {rpp.identitas.alokasi}
            <Pill kind={terisi === rpp.pertemuan.length ? 'good' : 'warn'}>
              {terisi}/{rpp.pertemuan.length} pertemuan tersusun
            </Pill>
          </div>
        </div>
        <div className="flex gap-2" style={{ flexShrink: 0 }}>
          <Link href={`/rpp/${id}/cetak`} className="btn btn-outline">
            <Icon name="fileText" size={13} /> Cetak / PDF
          </Link>
          <a href={`/rpp/${id}/docx`} className="btn btn-outline">
            <Icon name="download" size={13} /> .docx
          </a>
          <form action={deleteRpp.bind(null, id)}>
            <button type="submit" className="btn btn-ghost">Hapus</button>
          </form>
        </div>
      </div>

      <RppEditor id={id} rpp={rpp} />
    </div>
  );
}
