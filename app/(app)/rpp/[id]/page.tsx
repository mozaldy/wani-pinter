import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireTeacher } from '@/lib/auth';
import { getRpp } from '@/lib/queries';
import { RppEditor } from '@/components/rpp/RppEditor';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/ui';
import { deleteRpp } from '../actions';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate, lookup } from '@/lib/i18n/format';

export default async function RppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTeacher();
  const row = await getRpp(id, user.userId);
  if (!row) notFound();
  const dict = await getDictionary();

  const rpp = row.content;
  const terisi = rpp.pertemuan.filter(p => p.langkah.length > 0).length;

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-start mb-6">
        <div style={{ minWidth: 0 }}>
          <Link href="/rpp" className="tiny muted">{dict.rpp.editor.backToList}</Link>
          <h1 className="h-display" style={{ margin: '4px 0 0', fontSize: 24 }}>{rpp.identitas.judul}</h1>
          <div className="muted small flex gap-2 items-center" style={{ marginTop: 6 }}>
            {interpolate(dict.rpp.editor.identitasLine, {
              mapel: lookup(dict.enums.mapel, rpp.identitas.mapel), fase: rpp.identitas.fase,
              kelas: rpp.identitas.kelas, alokasi: rpp.identitas.alokasi,
            })}
            <Pill kind={terisi === rpp.pertemuan.length ? 'good' : 'warn'}>
              {interpolate(dict.rpp.editor.pertemuanTersusun, { terisi, total: rpp.pertemuan.length })}
            </Pill>
          </div>
        </div>
        <div className="flex gap-2" style={{ flexShrink: 0 }}>
          <Link href={`/rpp/${id}/cetak`} className="btn btn-outline">
            <Icon name="fileText" size={13} /> {dict.rpp.editor.cetak}
          </Link>
          <a href={`/rpp/${id}/docx`} className="btn btn-outline">
            <Icon name="download" size={13} /> {dict.rpp.editor.unduhDocx}
          </a>
          <form action={deleteRpp.bind(null, id)}>
            <button type="submit" className="btn btn-ghost">{dict.rpp.editor.hapus}</button>
          </form>
        </div>
      </div>

      <RppEditor id={id} rpp={rpp} />
    </div>
  );
}
