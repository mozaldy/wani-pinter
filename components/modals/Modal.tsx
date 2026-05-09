'use client';
import { type ReactNode } from 'react';
import { Icon } from '@/components/Icon';

export function Modal({ open, title, sub, children, onClose, footer, wide }: {
  open: boolean; title?: ReactNode; sub?: ReactNode;
  children: ReactNode; onClose: () => void; footer?: ReactNode; wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={wide ? { width: 'min(720px, 92vw)' } : undefined}>
        <div className="modal-head">
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18 }}>{title}</h3>
            {sub && <div className="muted small" style={{ marginTop: 4 }}>{sub}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
