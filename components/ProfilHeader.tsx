'use client';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/ui';
import { useModals } from '@/components/modals/ModalProvider';
import type { Student } from '@/lib/types';

export function ProfilHeaderActions({ student }: { student: Student }) {
  const { openRapor, openLive } = useModals();
  return (
    <div className="flex gap-2">
      <button className="btn btn-outline" onClick={openLive}><Icon name="pulse" size={14} /> Mode Kelas</button>
      <button className="btn btn-outline" onClick={() => openRapor(student)}><Icon name="sparkle" size={14} /> Buat Rapor</button>
      <button className="btn btn-primary"><Icon name="message" size={14} /> Hubungi wali</button>
    </div>
  );
}

export function BackLink() {
  return (
    <Link href="/dashboard" className="btn btn-ghost mb-3">
      <Icon name="arrowR" size={14} style={{ transform: 'rotate(180deg)' }} /> Kembali
    </Link>
  );
}

export function PassThru() { return null; }
export { Pill };
