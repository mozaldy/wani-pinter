'use client';
import { Icon } from '@/components/Icon';
import { useModals } from '@/components/modals/ModalProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Topbar() {
  const { openLive, openAI } = useModals();
  const { dict } = useI18n();
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
        <input placeholder={dict.topbar.searchPlaceholder} />
        <span className="kbd">⌘K</span>
      </div>
      <LanguageSwitcher />
      <button className="btn btn-primary" onClick={openLive} style={{ background: '#EF4444' }}>
        <span style={{ width: 8, height: 8, borderRadius: 50, background: 'white', animation: 'blink 1.5s infinite' }} />
        {dict.topbar.classMode}
      </button>
      <button className="icon-btn" onClick={openAI} title={dict.topbar.aiAssistant}>
        <Icon name="sparkle" size={16} />
      </button>
      <button className="icon-btn" aria-label={dict.topbar.notifications}>
        <Icon name="bell" size={16} />
        <span className="dot" />
      </button>
    </header>
  );
}
