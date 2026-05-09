import { headers } from 'next/headers';
import { KepsekSidebar } from '@/components/shell/KepsekSidebar';

export default async function KepsekLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();

  const user = {
    nama: hdrs.get('x-user-nama') || 'Kepala Sekolah',
    initials: hdrs.get('x-user-initials') || 'KS',
    jabatan: hdrs.get('x-user-jabatan') || 'Kepala Sekolah',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <KepsekSidebar user={user} />
      <main>
        <div style={{ padding: '24px 32px 64px', maxWidth: 1440, margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
