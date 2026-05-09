import type { ReactNode, CSSProperties } from 'react';
import { Icon, type IconName } from './Icon';
import type { Student } from '@/lib/types';

export type PillKind = 'good' | 'warn' | 'bad' | 'ink' | 'primary' | 'accent';

export function Pill({ kind = 'ink', children, dot, style }: { kind?: PillKind; children: ReactNode; dot?: boolean; style?: CSSProperties }) {
  return <span className={`pill pill-${kind}`} style={style}>{dot && <span className="dot" />}{children}</span>;
}

export function StatCard({ label, value, foot, trend, icon, accent }: {
  label: string; value: ReactNode; foot?: string;
  trend?: 'up' | 'down'; icon?: IconName; accent?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <span className="stat-label">{label}</span>
        {icon && (
          <span style={{
            width: 30, height: 30, borderRadius: 8,
            background: accent ? `color-mix(in oklab, ${accent} 12%, white)` : 'var(--color-primary-soft)',
            color: accent || 'var(--color-primary)',
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {foot && (
        <div className="stat-foot">
          {trend === 'up' && <span className="stat-trend-up">▲</span>}
          {trend === 'down' && <span className="stat-trend-down">▼</span>}
          <span>{foot}</span>
        </div>
      )}
    </div>
  );
}

export function Sparkline({ data, color = 'var(--color-primary)', height = 32 }: { data: number[]; color?: string; height?: number }) {
  const w = 100;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ');
  const fillPts = `0,${height} ${pts} ${w},${height}`;
  const id = `sg-${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Donut({ value, color = 'var(--color-primary)', size = 90, label }: { value: number; color?: string; size?: number; label?: string }) {
  return (
    <div className="donut" style={{ ['--p' as string]: value, ['--c' as string]: color, width: size, height: size }}>
      <span className="donut-label" style={{ fontSize: size * 0.26 }}>{label || `${value}%`}</span>
    </div>
  );
}

export function StudentAvatar({ student, size = 32 }: { student: Pick<Student, 'nama' | 'avatar_color'>; size?: number }) {
  const initials = student.nama.split(' ').slice(0, 2).map(s => s[0]).join('');
  return (
    <div className="student-avatar" style={{ background: student.avatar_color, width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

export function RiskDot({ level }: { level: 'rendah' | 'sedang' | 'tinggi' }) {
  const map = { rendah: 'var(--color-good)', sedang: 'var(--color-warn)', tinggi: 'var(--color-bad)' };
  return <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: map[level] }} />;
}
