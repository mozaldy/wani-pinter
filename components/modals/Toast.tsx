'use client';
import { Icon } from '@/components/Icon';

export function Toast({ items, onDismiss }: { items: { id: number; msg: string; kind?: 'good' | 'warn' }[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toast-stack">
      {items.map(t => (
        <div key={t.id} className={`toast ${t.kind || ''}`} onClick={() => onDismiss(t.id)}>
          <Icon name={t.kind === 'good' ? 'check' : 'sparkle'} size={16} />
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
