import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { StudentAvatar } from '@/components/ui';
import { getParentStudentIds, getStudentForParent } from '@/lib/queries';
import type { Student } from '@/lib/types';

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const hdrs = await headers();
  const parentId = hdrs.get('x-parent-id');
  const parentNama = hdrs.get('x-parent-nama') || 'Orang Tua';

  if (!parentId) redirect('/orang-tua/login');

  const studentIds = await getParentStudentIds(parentId);
  const students = (await Promise.all(studentIds.map(id => getStudentForParent(id)))).filter(Boolean) as Student[];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-line)',
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div className="flex gap-2 items-center">
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'grid', placeItems: 'center', color: 'white',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
          }}>w</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, lineHeight: 1 }}>wani·pinter</div>
            <div style={{ fontSize: 10, color: 'var(--color-ink-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Portal Orang Tua</div>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <span style={{ fontSize: 13, color: 'var(--color-ink-2)', fontWeight: 500 }}>{parentNama}</span>
          <form action="/orang-tua/api/logout" method="post">
            <button type="submit" className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="settings" size={13} />
              Keluar
            </button>
          </form>
        </div>
      </header>

      {/* Child picker (multi-child only) */}
      {students.length > 1 && (
        <div style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-line)',
          padding: '10px 16px',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
        }}>
          {students.map(s => (
            <a key={s.id} href={`/orang-tua/anak/${s.id}`}
              className="flex gap-2 items-center"
              style={{
                padding: '6px 12px', borderRadius: 999,
                background: 'var(--color-surface-2)',
                fontSize: 13, fontWeight: 500, color: 'var(--color-ink)',
                textDecoration: 'none', whiteSpace: 'nowrap',
                border: '1px solid var(--color-line)',
              }}>
              <StudentAvatar student={s} size={22} />
              {s.nama.split(' ')[0]}
            </a>
          ))}
        </div>
      )}

      {/* Empty state */}
      {students.length === 0 ? (
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ maxWidth: 400, textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div className="card-title" style={{ marginBottom: 8 }}>Akun belum terhubung</div>
            <p style={{ fontSize: 14, color: 'var(--color-ink-3)', lineHeight: 1.6 }}>
              Akun Anda belum terhubung ke data siswa. Hubungi admin sekolah untuk menautkan akun Anda.
            </p>
          </div>
        </main>
      ) : (
        <main style={{ flex: 1, maxWidth: 680, width: '100%', margin: '0 auto', padding: '24px 16px' }}>
          {children}
        </main>
      )}
    </div>
  );
}
