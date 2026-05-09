'use client';
import { useModals } from '@/components/modals/ModalProvider';
import type { ReactNode } from 'react';

export function QuickInputButton({ children, className, primary }: { children: ReactNode; className?: string; primary?: boolean }) {
  const { openInput } = useModals();
  return (
    <button onClick={openInput} className={className || `btn ${primary ? 'btn-primary' : 'btn-outline'}`}>
      {children}
    </button>
  );
}

export function OpenAIButton({ children, className }: { children: ReactNode; className?: string }) {
  const { openAI } = useModals();
  return <button onClick={openAI} className={className || 'btn btn-primary'}>{children}</button>;
}
