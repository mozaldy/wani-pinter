'use client';
import { useState, useTransition } from 'react';
import { Icon } from '@/components/Icon';
import { useModals } from '@/components/modals/ModalProvider';
import { refineSection, saveSection } from '@/app/(app)/rpp/actions';
import type { RuteRow, SectionKind } from '@/lib/rpp';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { interpolate } from '@/lib/i18n/format';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type Value = string | string[] | RuteRow[];

export function Section({ id, sectionKey, label, kind, hint, ordered, value }: {
  id: string; sectionKey: string; label: string;
  kind: SectionKind; hint?: string; ordered?: boolean; value: Value;
}) {
  const { dict } = useI18n();
  const { pushToast } = useModals();
  const [mode, setMode] = useState<'read' | 'edit' | 'refine'>('read');
  const [draft, setDraft] = useState<Value>(value);
  const [instruction, setInstruction] = useState('');
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<void>, ok: string) => start(async () => {
    try {
      await fn();
      pushToast(ok, 'good');
      setMode('read');
      setInstruction('');
    } catch (e) {
      pushToast(e instanceof Error ? e.message : dict.rpp.editor.gagalMenyimpan, 'warn');
    }
  });

  const openEdit = () => { setDraft(value); setMode('edit'); };

  return (
    <div className="card" style={{ marginBottom: 14, opacity: pending ? 0.6 : 1 }}>
      <div className="card-title">
        <h3>{label}</h3>
        <span className="flex gap-1">
          {hint && mode === 'read' && <span className="sub" style={{ marginRight: 8 }}>{hint}</span>}
          <button className="btn btn-ghost small" disabled={pending}
            onClick={() => (mode === 'edit' ? setMode('read') : openEdit())}>
            <Icon name="edit" size={12} /> {mode === 'edit' ? dict.common.batal : dict.rpp.editor.edit}
          </button>
          <button className="btn btn-ghost small" disabled={pending}
            onClick={() => setMode(mode === 'refine' ? 'read' : 'refine')}>
            <Icon name="sparkle" size={12} /> {mode === 'refine' ? dict.common.tutup : dict.rpp.editor.ubahDenganAi}
          </button>
        </span>
      </div>

      {mode === 'edit'
        ? <Editor kind={kind} draft={draft} onChange={setDraft} dict={dict} />
        : <Reader kind={kind} ordered={ordered} value={value} dict={dict} />}

      {mode === 'edit' && (
        <div className="flex gap-2" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" disabled={pending}
            onClick={() => run(() => saveSection(id, sectionKey, draft), interpolate(dict.rpp.editor.disimpan, { label }))}>
            <Icon name="check" size={13} /> {dict.common.simpan}
          </button>
        </div>
      )}

      {mode === 'refine' && (
        <div className="ai-card" style={{ marginTop: 12 }}>
          <div className="ai-badge"><span className="ai-glyph"><Icon name="sparkle" size={11} /></span> {dict.rpp.editor.refineTitle}</div>
          <div className="field" style={{ marginBottom: 8, marginTop: 8 }}>
            <textarea rows={2} value={instruction} disabled={pending}
              placeholder={dict.rpp.editor.refinePlaceholder}
              onChange={e => setInstruction(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={pending || !instruction.trim()}
            onClick={() => run(() => refineSection(id, sectionKey, instruction), interpolate(dict.rpp.editor.diperbarui, { label }))}>
            <Icon name="sparkle" size={13} /> {pending ? dict.rpp.editor.menyusunUlang : dict.rpp.editor.terapkan}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── read / edit views per kind ────────────────────────────────────────────

function Reader({ kind, ordered, value, dict }: { kind: SectionKind; ordered?: boolean; value: Value; dict: Dictionary }) {
  if (kind === 'table') {
    const rows = value as RuteRow[];
    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th style={{ width: 90 }}>{dict.rpp.editor.tableHeaders.pertemuan}</th><th>{dict.rpp.editor.tableHeaders.tujuan}</th><th>{dict.rpp.editor.tableHeaders.aktivitas}</th><th style={{ width: 130 }}>{dict.rpp.editor.tableHeaders.alokasi}</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.no}><td>{r.no}</td><td>{r.tujuan}</td><td>{r.aktivitas}</td><td>{r.alokasi}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (kind === 'list') {
    // Match RppDocument: numbered only where the printed document numbers too.
    const List = ordered ? 'ol' : 'ul';
    return (
      <List style={{ margin: '0 0 0 18px', listStyleType: ordered ? 'decimal' : 'disc', fontSize: 13, lineHeight: 1.7, color: 'var(--color-ink-2)' }}>
        {(value as string[]).map((t, i) => <li key={i}>{t}</li>)}
      </List>
    );
  }
  return <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--color-ink-2)', margin: 0, textAlign: 'justify' }}>{value as string}</p>;
}

function Editor({ kind, draft, onChange, dict }: { kind: SectionKind; draft: Value; onChange: (v: Value) => void; dict: Dictionary }) {
  if (kind === 'table') {
    const rows = draft as RuteRow[];
    const set = (i: number, patch: Partial<RuteRow>) =>
      onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
    return (
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="tiny muted" style={{ width: 24, textAlign: 'right' }}>{r.no}</span>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <input value={r.tujuan} placeholder={dict.rpp.editor.tujuanPlaceholder} onChange={e => set(i, { tujuan: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <input value={r.aktivitas} placeholder={dict.rpp.editor.aktivitasPlaceholder} onChange={e => set(i, { aktivitas: e.target.value })} />
            </div>
            <div className="field" style={{ width: 140, marginBottom: 0 }}>
              <input value={r.alokasi ?? ''} placeholder={dict.rpp.editor.alokasiPlaceholder} onChange={e => set(i, { alokasi: e.target.value })} />
            </div>
            <button className="btn btn-ghost small" title={dict.rpp.editor.hapusBaris}
              onClick={() => onChange(rows.filter((_, j) => j !== i).map((r2, j) => ({ ...r2, no: j + 1 })))}>&times;</button>
          </div>
        ))}
        <button className="btn btn-outline small" style={{ alignSelf: 'flex-start' }}
          onClick={() => onChange([...rows, { no: rows.length + 1, tujuan: '', aktivitas: '', alokasi: '' }])}>
          {dict.rpp.editor.tambahPertemuan}
        </button>
        <div className="tiny muted">{dict.rpp.editor.tambahPertemuanHint}</div>
      </div>
    );
  }

  if (kind === 'list') {
    return (
      <div className="field" style={{ marginBottom: 0 }}>
        <textarea rows={Math.max(4, (draft as string[]).length + 1)} value={(draft as string[]).join('\n')}
          onChange={e => onChange(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} />
        <span className="tiny muted">{dict.rpp.editor.satuButirPerBaris}</span>
      </div>
    );
  }

  return (
    <div className="field" style={{ marginBottom: 0 }}>
      <textarea rows={6} value={draft as string} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
