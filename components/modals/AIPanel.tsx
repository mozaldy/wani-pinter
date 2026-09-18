'use client';
import { Modal } from './Modal';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { AIInsight } from '@/lib/types';

export function AIPanel({ open, onClose, insights }: { open: boolean; onClose: () => void; insights: AIInsight[] }) {
  const { dict } = useI18n();
  return (
    <Modal open={open} onClose={onClose} wide
      title={dict.modals.aiPanel.title}
      sub={dict.modals.aiPanel.sub}
      footer={<button className="btn btn-primary" onClick={onClose}>{dict.common.tutup}</button>}>
      <div className="flex flex-col gap-3">
        {insights.map(ins => (
          <div key={ins.id} style={{
            padding: 14, borderRadius: 12,
            background: ins.type === 'risk' ? 'var(--color-bad-soft)' : ins.type === 'win' ? 'var(--color-good-soft)' : 'var(--color-warn-soft)',
            border: `1px solid ${ins.type === 'risk' ? '#FCA5A5' : ins.type === 'win' ? '#86EFAC' : '#FDE68A'}`,
          }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{ins.title}</div>
            <div className="small" style={{ color: 'var(--color-ink-2)', lineHeight: 1.55 }}>{ins.body}</div>
            <button className="btn btn-outline" style={{ marginTop: 10, fontSize: 12 }}>{ins.action}</button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
