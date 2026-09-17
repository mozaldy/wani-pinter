'use client';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/ui';
import { useModals } from '@/components/modals/ModalProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { Student } from '@/lib/types';

export function ProfilHeaderActions({ student }: { student: Student }) {
  const { openRapor, openLive } = useModals();
  const { dict } = useI18n();
  return (
    <div className="flex gap-2">
      <button className="btn btn-outline" onClick={openLive}><Icon name="pulse" size={14} /> {dict.profil.actions.modeKelas}</button>
      <button className="btn btn-outline" onClick={() => openRapor(student)}><Icon name="sparkle" size={14} /> {dict.profil.actions.buatRapor}</button>
      <button className="btn btn-primary"><Icon name="message" size={14} /> {dict.profil.actions.hubungiWali}</button>
    </div>
  );
}

export function BackLink() {
  const { dict } = useI18n();
  return (
    <Link href="/dashboard" className="btn btn-ghost mb-3">
      <Icon name="arrowR" size={14} style={{ transform: 'rotate(180deg)' }} /> {dict.profil.kembali}
    </Link>
  );
}

export function PassThru() { return null; }
export { Pill };
