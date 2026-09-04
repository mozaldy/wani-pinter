'use client';
import { useState, useTransition } from 'react';
import { Icon } from '@/components/Icon';
import { useModals } from '@/components/modals/ModalProvider';
import { refineSection, saveSection } from '@/app/(app)/rpp/actions';
import type { RuteRow, SectionKind } from '@/lib/rpp';

type Value = string | string[] | RuteRow[];

export function Section({ id, sectionKey, label, kind, hint, value }: {
  id: string; sectionKey: string; label: string;
  kind: SectionKind; hint?: string; value: Value;
}) {
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
      pushToast(e instanceof Error ? e.message : 'Gagal menyimpan', 'warn');
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
            <Icon name="edit" size={12} /> {mode === 'edit' ? 'Batal' : 'Edit'}
          </button>
          <button className="btn btn-ghost small" disabled={pending}
            onClick={() => setMode(mode === 'refine' ? 'read' : 'refine')}>
            <Icon name="sparkle" size={12} /> {mode === 'refine' ? 'Tutup' : 'Ubah dengan AI'}
          </button>
        </span>
      </div>

      {mode === 'edit'
        ? <Editor kind={kind} draft={draft} onChange={setDraft} />
        : <Reader kind={kind} value={value} />}

      {mode === 'edit' && (
        <div className="flex gap-2" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" disabled={pending}
            onClick={() => run(() => saveSection(id, sectionKey, draft), `${label} disimpan`)}>
            <Icon name="check" size={13} /> Simpan
          </button>
        </div>
      )}

      {mode === 'refine' && (
        <div className="ai-card" style={{ marginTop: 12 }}>
          <div className="ai-badge"><span className="ai-glyph"><Icon name="sparkle" size={11} /></span> Ubah bagian ini</div>
          <div className="field" style={{ marginBottom: 8, marginTop: 8 }}>
            <textarea rows={2} value={instruction} disabled={pending}
              placeholder="Contoh: buat lebih spesifik dan terukur, sesuaikan untuk kelas dengan 4 murid berkebutuhan khusus"
              onChange={e => setInstruction(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={pending || !instruction.trim()}
            onClick={() => run(() => refineSection(id, sectionKey, instruction), `${label} diperbarui`)}>
            <Icon name="sparkle" size={13} /> {pending ? 'Menyusun ulang…' : 'Terapkan'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── read / edit views per kind ────────────────────────────────────────────

function Reader({ kind, value }: { kind: SectionKind; value: Value }) {
  if (kind === 'table') {
    const rows = value as RuteRow[];
    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th style={{ width: 90 }}>Pertemuan</th><th>Tujuan</th><th>Aktivitas</th><th style={{ width: 130 }}>Alokasi Waktu</th></tr></thead>
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
    return (
      <ol style={{ margin: '0 0 0 18px', fontSize: 13, lineHeight: 1.7, color: 'var(--color-ink-2)' }}>
        {(value as string[]).map((t, i) => <li key={i}>{t}</li>)}
      </ol>
    );
  }
  return <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--color-ink-2)', margin: 0, textAlign: 'justify' }}>{value as string}</p>;
}

function Editor({ kind, draft, onChange }: { kind: SectionKind; draft: Value; onChange: (v: Value) => void }) {
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
              <input value={r.tujuan} placeholder="Tujuan pertemuan" onChange={e => set(i, { tujuan: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <input value={r.aktivitas} placeholder="Aktivitas" onChange={e => set(i, { aktivitas: e.target.value })} />
            </div>
            <div className="field" style={{ width: 140, marginBottom: 0 }}>
              <input value={r.alokasi ?? ''} placeholder="2 x 35 menit" onChange={e => set(i, { alokasi: e.target.value })} />
            </div>
            <button className="btn btn-ghost small" title="Hapus baris"
              onClick={() => onChange(rows.filter((_, j) => j !== i).map((r2, j) => ({ ...r2, no: j + 1 })))}>&times;</button>
          </div>
        ))}
        <button className="btn btn-outline small" style={{ alignSelf: 'flex-start' }}
          onClick={() => onChange([...rows, { no: rows.length + 1, tujuan: '', aktivitas: '', alokasi: '' }])}>
          + Tambah pertemuan
        </button>
        <div className="tiny muted">Menghapus atau menambah baris menyesuaikan daftar pertemuan di bawah.</div>
      </div>
    );
  }

  if (kind === 'list') {
    return (
      <div className="field" style={{ marginBottom: 0 }}>
        <textarea rows={Math.max(4, (draft as string[]).length + 1)} value={(draft as string[]).join('\n')}
          onChange={e => onChange(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} />
        <span className="tiny muted">Satu butir per baris.</span>
      </div>
    );
  }

  return (
    <div className="field" style={{ marginBottom: 0 }}>
      <textarea rows={6} value={draft as string} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
