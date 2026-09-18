import { Icon } from '@/components/Icon';
import { getDictionary } from '@/lib/i18n/server';

export default async function KepsekLaporanPage() {
  const dict = await getDictionary();

  return (
    <div className="screen-enter">
      <div className="mb-6">
        <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>{dict.kepsek.laporan.title}</h1>
        <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>{dict.kepsek.laporan.subtitle}</div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '64px 32px', textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--color-surface-2)', display: 'grid', placeItems: 'center',
        }}>
          <Icon name="chart" size={24} style={{ color: 'var(--color-ink-3)' }} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{dict.kepsek.laporan.comingSoonTitle}</div>
          <div className="muted" style={{ fontSize: 14, maxWidth: 360 }}>
            {dict.kepsek.laporan.comingSoonBody}
          </div>
        </div>
      </div>
    </div>
  );
}
