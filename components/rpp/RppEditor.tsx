'use client';
import { SECTIONS, type Rpp } from '@/lib/rpp';
import { Section } from './Section';
import { PertemuanCard } from './PertemuanCard';

export function RppEditor({ id, rpp }: { id: string; rpp: Rpp }) {
  return (
    <>
      {SECTIONS.map(s => (
        <Section key={s.key} id={id} sectionKey={s.key} label={s.label} kind={s.kind}
          hint={'hint' in s ? s.hint : undefined} value={rpp[s.key]} />
      ))}

      <h2 className="h-display" style={{ fontSize: 18, margin: '28px 0 12px' }}>
        Langkah-Langkah Pembelajaran
      </h2>
      <div className="muted small" style={{ marginBottom: 12 }}>
        Susun tiap pertemuan saat Anda membutuhkannya — tidak harus sekaligus.
      </div>
      {rpp.pertemuan.map(p => <PertemuanCard key={p.no} id={id} p={p} />)}
    </>
  );
}
