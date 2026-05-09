import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { ModalProvider } from '@/components/modals/ModalProvider';
import { getStudents, getInsights } from '@/lib/queries';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [students, insights] = await Promise.all([getStudents(), getInsights()]);
  return (
    <ModalProvider students={students} insights={insights}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <Sidebar />
        <main>
          <Topbar />
          <div style={{ padding: '24px 32px 64px', maxWidth: 1440, margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </ModalProvider>
  );
}
