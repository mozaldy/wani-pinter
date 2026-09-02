import htmlToDocx from '@turbodocx/html-to-docx';
import { requireTeacher } from '@/lib/auth';
import { getRpp } from '@/lib/queries';
import { RppDocument } from '@/components/rpp/RppDocument';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTeacher();
  const row = await getRpp(id, user.userId);
  if (!row) return new Response('Not found', { status: 404 });

  // Imported at call time: Next blocks a static `react-dom/server` import in the app router.
  const { renderToStaticMarkup } = await import('react-dom/server');
  const html = `<!DOCTYPE html><html><body>${renderToStaticMarkup(<RppDocument rpp={row.content} />)}</body></html>`;

  const buffer = (await htmlToDocx(html, null, {
    orientation: 'portrait',
    margins: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // 2cm in twips
    table: { row: { cantSplit: true } },
    font: 'Times New Roman',
    fontSize: 24, // half-points → 12pt
  })) as Buffer;

  // Strip characters Windows/macOS reject in filenames.
  const nama = row.judul.replace(/[\\/:*?"<>|]/g, '-').slice(0, 80);

  return new Response(new Uint8Array(buffer), {
    headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(`Modul Ajar - ${nama}.docx`)}`,
    },
  });
}
