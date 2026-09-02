'use client';
import { Icon } from '@/components/Icon';

export function PrintButton() {
  return (
    <button className="btn btn-primary" onClick={() => window.print()}>
      <Icon name="fileText" size={13} /> Cetak / Simpan PDF
    </button>
  );
}
