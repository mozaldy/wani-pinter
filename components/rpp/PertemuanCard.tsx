'use client';
import { useState, useTransition } from 'react';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/ui';
import { useModals } from '@/components/modals/ModalProvider';
import { generatePertemuan, savePertemuan } from '@/app/(app)/rpp/actions';
import type { Pertemuan } from '@/lib/rpp';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { interpolate } from '@/lib/i18n/format';

export function PertemuanCard({ id, p }: { id: string; p: Pertemuan }) {
  const { dict } = useI18n();
  const { pushToast } = useModals();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [langkah, setLangkah] = useState(p.langkah.join('\n'));
  const [pending, start] = useTransition();
  const filled = p.langkah.length > 0;

  const run = (fn: () => Promise<void>, ok: string) => start(async () => {
    try { await fn(); pushToast(ok, 'good'); setEditing(false); setOpen(true); }
    catch (e) { pushToast(e instanceof Error ? e.message : dict.rpp.editor.gagal, 'warn'); }
  });

  return (
    <div className="card" style={{ marginBottom: 10, opacity: pending ? 0.6 : 1 }}>
      <div className="card-title" style={{ marginBottom: filled && open ? 12 : 0 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="tiny muted" style={{ fontFamily: 'var(--font-mono)' }}>P{p.no}</span>
          {p.judul || interpolate(dict.rpp.editor.pertemuanLabel, { no: p.no })}
          {filled
            ? <Pill kind="good">{interpolate(dict.rpp.editor.langkahCount, { count: p.langkah.length })}</Pill>
            : <Pill kind="ink">{dict.rpp.editor.belumDisusun}</Pill>}
        </h3>
        <span className="flex gap-1">
          {filled && (
            <button className="btn btn-ghost small" onClick={() => setOpen(o => !o)}>
              {open ? dict.common.tutup : dict.rpp.editor.lihat}
            </button>
          )}
          <button className="btn btn-ghost small" disabled={pending}
            onClick={() => run(() => generatePertemuan(id, p.no), interpolate(dict.rpp.editor.pertemuanTersusunToast, { no: p.no }))}>
            <Icon name="sparkle" size={12} />
            {pending ? dict.rpp.editor.menyusun : filled ? dict.rpp.editor.susunUlang : dict.rpp.editor.susunDenganAi}
          </button>
        </span>
      </div>

      {filled && open && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 tiny muted" style={{ flexWrap: 'wrap' }}>
            <Pill kind="primary">{p.pengalamanBelajar}</Pill>
            {p.prinsip.map(x => <Pill key={x} kind="accent">{x}</Pill>)}
          </div>
          <div className="small"><strong>{dict.rpp.editor.mediaLabel}</strong> {p.media}</div>

          {editing ? (
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">{dict.rpp.editor.langkahFieldLabel}</label>
              <textarea rows={Math.max(8, p.langkah.length + 2)} value={langkah}
                onChange={e => setLangkah(e.target.value)} />
              <div className="flex gap-2" style={{ marginTop: 8 }}>
                <button className="btn btn-primary" disabled={pending}
                  onClick={() => run(
                    () => savePertemuan(id, p.no, { langkah: langkah.split('\n').map(s => s.trim()).filter(Boolean) }),
                    interpolate(dict.rpp.editor.pertemuanDisimpanToast, { no: p.no }))}>
                  <Icon name="check" size={13} /> {dict.common.simpan}
                </button>
                <button className="btn btn-ghost" onClick={() => { setLangkah(p.langkah.join('\n')); setEditing(false); }}>{dict.common.batal}</button>
              </div>
            </div>
          ) : (
            <>
              <ol style={{ margin: '0 0 0 18px', listStyleType: 'decimal', fontSize: 13, lineHeight: 1.7, color: 'var(--color-ink-2)' }}>
                {p.langkah.map((l, i) => <li key={i} style={{ marginBottom: 4 }}>{l}</li>)}
              </ol>
              <button className="btn btn-ghost small" style={{ alignSelf: 'flex-start' }}
                onClick={() => { setLangkah(p.langkah.join('\n')); setEditing(true); }}>
                <Icon name="edit" size={12} /> {dict.rpp.editor.editLangkah}
              </button>
            </>
          )}

          {p.asesmen && (
            <div style={{ padding: 12, background: 'var(--color-surface-2)', borderRadius: 10 }}>
              <div className="small" style={{ fontWeight: 700, marginBottom: 6 }}>
                {interpolate(dict.rpp.editor.lampiranAsesmen, { no: p.no })}
              </div>
              <div className="tiny muted" style={{ marginBottom: 6 }}>
                {p.asesmen.teknik} — {p.asesmen.tujuan}
              </div>
              <ul style={{ margin: '0 0 0 16px', listStyleType: 'disc', fontSize: 12, lineHeight: 1.6 }}>
                {p.asesmen.rubrik.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
