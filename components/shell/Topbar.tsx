'use client';
import { Icon } from '@/components/Icon';
import { useModals } from '@/components/modals/ModalProvider';

export function Topbar() {
  const { openLive, openAI } = useModals();
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '18px 32px',
      borderBottom: '1px solid var(--color-line)',
      position: 'sticky', top: 0, zIndex: 10,
      backdropFilter: 'blur(8px)',
      background: 'color-mix(in oklab, var(--color-bg) 85%, transparent)',
    }}>
      <div className="search" style={{ flex: 1, maxWidth: 360, marginLeft: 'auto' }}>
        <Icon name="search" size={14} />
        <input placeholder="Cari siswa, kelas, CP, tugas..." />
        <span className="kbd">⌘K</span>
      </div>
      <button className="btn btn-primary" onClick={openLive} style={{ background: '#EF4444' }}>
        <span style={{ width: 8, height: 8, borderRadius: 50, background: 'white', animation: 'blink 1.5s infinite' }} />
        Mode Kelas
      </button>
      <button className="icon-btn" onClick={openAI} title="Asisten AI">
        <Icon name="sparkle" size={16} />
      </button>
      <button className="icon-btn">
        <Icon name="bell" size={16} />
        <span className="dot" />
      </button>
    </header>
  );
}
