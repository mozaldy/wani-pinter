import { Icon } from '@/components/Icon';

export default function KepsekLaporanPage() {
  return (
    <div className="screen-enter">
      <div className="mb-6">
        <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>Laporan</h1>
        <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>Laporan mutu pembelajaran dan administrasi sekolah</div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '64px 32px', textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--color-surface-2)', display: 'grid', placeItems: 'center',
        }}>
          <Icon name="chart" size={24} style={{ color: 'var(--color-ink-3)' }} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Segera hadir</div>
          <div className="muted" style={{ fontSize: 14, maxWidth: 360 }}>
            Laporan rekap semester, tren capaian per kelas, dan ekspor data akan tersedia di sini.
          </div>
        </div>
      </div>
    </div>
  );
}
