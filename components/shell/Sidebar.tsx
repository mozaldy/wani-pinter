'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/Icon';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type SidebarUser = { nama: string; initials: string; jabatan: string };

type NavId = Exclude<keyof Dictionary['nav'], 'groups'>;
type NavGroup = keyof Dictionary['nav']['groups'];

const NAV: { id: NavId; href: string; icon: IconName; badge?: number; group: NavGroup }[] = [
  { id: 'dashboard', href: '/dashboard', icon: 'home', group: 'utama' },
  { id: 'analytics', href: '/analytics', icon: 'chart', badge: 3, group: 'utama' },
  { id: 'jurnal', href: '/jurnal', icon: 'clipboard', group: 'operasional' },
  { id: 'penilaian', href: '/penilaian', icon: 'edit', group: 'operasional' },
  { id: 'bank', href: '/bank', icon: 'folder', group: 'operasional' },
  { id: 'catatan', href: '/catatan', icon: 'fileText', group: 'operasional' },
  { id: 'rpp', href: '/rpp', icon: 'layers', group: 'operasional' },
  { id: 'admin', href: '/admin', icon: 'db', group: 'administrasi' },
  { id: 'kurikulum', href: '/kurikulum', icon: 'layers', group: 'administrasi' },
];

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const { dict } = useI18n();
  let lastGroup: NavGroup | '' = '';
  return (
    <aside style={{
      width: 260, background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-line)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 16px', gap: 4,
      position: 'sticky', top: 0, height: '100vh',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 20px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800,
          fontFamily: 'var(--font-display)', fontSize: 18, flexShrink: 0,
          boxShadow: '0 4px 12px color-mix(in oklab, var(--color-primary) 30%, transparent)',
        }}>w</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em', lineHeight: 1.1 }}>wani·pinter</div>
          <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>SDN 1 Keputran Surabaya</div>
        </div>
      </div>

      {NAV.map(n => {
        const showGroup = n.group !== lastGroup;
        lastGroup = n.group;
        const active = pathname === n.href || pathname.startsWith(n.href + '/');
        return (
          <div key={n.id}>
            {showGroup && <div className="nav-group-label">{dict.nav.groups[n.group]}</div>}
            <Link href={n.href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon name={n.icon} />
              <span>{dict.nav[n.id]}</span>
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </Link>
          </div>
        );
      })}

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-line)', padding: '14px 8px 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FCA5A5, #F59E0B)',
            display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: 13,
            flexShrink: 0,
          }}>{user.initials}</div>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.nama}</div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>{user.jabatan}</div>
          </div>
          <Link href="/settings" className="icon-btn" title={dict.common.settings} style={{ width: 30, height: 30 }}>
            <Icon name="settings" size={14} />
          </Link>
        </div>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="btn btn-ghost" style={{ width: '100%', fontSize: 12, justifyContent: 'center', padding: '6px 0' }}>
            {dict.common.logout}
          </button>
        </form>
      </div>
    </aside>
  );
}
