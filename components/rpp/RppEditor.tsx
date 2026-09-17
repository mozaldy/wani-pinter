'use client';
import { SECTIONS, type Rpp } from '@/lib/rpp';
import { Section } from './Section';
import { PertemuanCard } from './PertemuanCard';
import { useI18n } from '@/lib/i18n/I18nProvider';

export function RppEditor({ id, rpp }: { id: string; rpp: Rpp }) {
  const { dict } = useI18n();
  return (
    <>
      {SECTIONS.map(s => (
        <Section key={s.key} id={id} sectionKey={s.key} label={dict.rpp.editor.sections[s.key]} kind={s.kind}
          hint={'hint' in s ? dict.rpp.editor.rutePertemuanHint : undefined} ordered={'ordered' in s && s.ordered}
          value={rpp[s.key]} />
      ))}

      <h2 className="h-display" style={{ fontSize: 18, margin: '28px 0 12px' }}>
        {dict.rpp.editor.langkahTitle}
      </h2>
      <div className="muted small" style={{ marginBottom: 12 }}>
        {dict.rpp.editor.langkahSubtitle}
      </div>
      {rpp.pertemuan.map(p => <PertemuanCard key={p.no} id={id} p={p} />)}
    </>
  );
}
