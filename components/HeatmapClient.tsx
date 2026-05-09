'use client';
import Link from 'next/link';
import { useState } from 'react';
import { StudentAvatar, Pill } from '@/components/ui';
import type { CP, HeatmapRow } from '@/lib/types';

export function HeatmapClient({ cps, rows }: { cps: CP[]; rows: HeatmapRow[] }) {
  const [selected, setSelected] = useState<{ row: HeatmapRow; cellIndex: number } | null>(null);
  const cps8 = cps.slice(0, 8);
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, alignItems: 'flex-start' }}>
        <div></div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cps8.length}, 1fr)`, gap: 3, paddingBottom: 8 }}>
          {cps8.map(cp => (
            <div key={cp.kode} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-3)', textAlign: 'center', lineHeight: 1.2 }}>
              {cp.kode.split('-').slice(-1)[0]}
              <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-4)', fontSize: 9, marginTop: 2, height: 22, overflow: 'hidden' }}>{cp.nama}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {rows.map(row => (
            <Link key={row.student.id} href={`/siswa/${row.student.id}`} className="flex gap-2 items-center" style={{ height: 32 }}>
              <StudentAvatar student={row.student} size={26} />
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.student.nama}
              </div>
            </Link>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateRows: `repeat(${rows.length}, 32px)`, gap: 4 }}>
          {rows.map((row) => (
            <div key={row.student.id} style={{ display: 'grid', gridTemplateColumns: `repeat(${cps8.length}, 1fr)`, gap: 3, height: 32 }}>
              {row.cells.map((cell, i) => (
                <div key={i} className={`heatmap-cell heat-${cell.value}`}
                  onMouseEnter={() => setSelected({ row, cellIndex: i })}
                  onMouseLeave={() => setSelected(null)}>
                  {cell.value === 0 ? '–' : cell.value}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div style={{ marginTop: 16, padding: 12, background: 'var(--color-surface-2)', borderRadius: 10, display: 'flex', gap: 16, alignItems: 'center' }}>
          <StudentAvatar student={selected.row.student} size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{selected.row.student.nama}</div>
            <div className="tiny muted">{cps8[selected.cellIndex].kode} · {cps8[selected.cellIndex].nama}</div>
          </div>
          <Pill kind={selected.row.cells[selected.cellIndex].value >= 4 ? 'good' : selected.row.cells[selected.cellIndex].value >= 2 ? 'warn' : 'bad'}>
            Skor {selected.row.cells[selected.cellIndex].value}/5
          </Pill>
        </div>
      )}
    </>
  );
}
