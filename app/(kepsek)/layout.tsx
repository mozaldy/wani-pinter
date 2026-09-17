import { headers } from 'next/headers';
import { KepsekSidebar } from '@/components/shell/KepsekSidebar';
import { getDictionary } from '@/lib/i18n/server';

export default async function KepsekLayout({ children }: { children: React.ReactNode }) {
  const [hdrs, dict] = await Promise.all([headers(), getDictionary()]);

  const user = {
    nama: hdrs.get('x-user-nama') || dict.kepsekNav.defaultRole,
    initials: hdrs.get('x-user-initials') || 'KS',
    jabatan: hdrs.get('x-user-jabatan') || dict.kepsekNav.defaultRole,
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
