import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireTeacher } from '@/lib/auth';
import { getRpp } from '@/lib/queries';
import { RppDocument } from '@/components/rpp/RppDocument';
import { PrintButton } from '@/components/rpp/PrintButton';
import { Icon } from '@/components/Icon';

export default async function CetakPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTeacher();
  const row = await getRpp(id, user.userId);
  if (!row) notFound();

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6 no-print">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 22 }}>Pratinjau cetak</h1>
          <div className="muted small" style={{ marginTop: 4 }}>
            Pilih &ldquo;Save as PDF&rdquo; pada dialog cetak untuk menyimpan sebagai PDF.
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/rpp/${id}`} className="btn btn-ghost">Kembali</Link>
          <a href={`/rpp/${id}/docx`} className="btn btn-outline"><Icon name="download" size={13} /> Unduh .docx</a>
          <PrintButton />
        </div>
      </div>

      <div className="rpp-sheet" style={{ background: 'white', padding: '48px 56px', borderRadius: 12, border: '1px solid var(--color-line)' }}>
        <RppDocument rpp={row.content} />
      </div>
    </div>
  );
}
