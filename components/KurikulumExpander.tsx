'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import type { CP } from '@/lib/types';

const TPS_8_2 = [
  { kode: 'TP-1', nama: 'Mengidentifikasi sistem persamaan linear dua variabel dari konteks', mastered: 92, tugas: 3 },
  { kode: 'TP-2', nama: 'Menyelesaikan SPLDV dengan metode eliminasi', mastered: 84, tugas: 2 },
  { kode: 'TP-3', nama: 'Menyelesaikan SPLDV dengan metode substitusi', mastered: 67, tugas: 2 },
  { kode: 'TP-4', nama: 'Menerapkan SPLDV pada masalah kontekstual', mastered: 71, tugas: 2 },
  { kode: 'TP-5', nama: 'Menganalisis solusi SPLDV (tunggal, banyak, tidak ada)', mastered: 45, tugas: 1 },
];

export function KurikulumExpander({ cps }: { cps: CP[] }) {
  const [expanded, setExpanded] = useState<string | null>('CP-MTK-8.2');

  return (
    <div className="flex flex-col gap-2">
      {cps.map(cp => {
        const isExp = expanded === cp.kode;
        const tpList = cp.kode === 'CP-MTK-8.2' ? TPS_8_2 : Array.from({ length: cp.tp_count }).map((_, i) => ({
          kode: `TP-${i + 1}`,
          nama: `Tujuan pembelajaran ke-${i + 1}`,
          mastered: Math.max(0, cp.mastered + (Math.sin(i) * 15) | 0),
          tugas: ((i % 3) + 1),
        }));
        return (
          <div key={cp.kode} style={{ border: '1px solid var(--color-line)', borderRadius: 12, overflow: 'hidden' }}>
            <button onClick={() => setExpanded(isExp ? null : cp.kode)}
              style={{
                width: '100%', padding: 14, textAlign: 'left',
                display: 'grid', gridTemplateColumns: 'auto 110px 1fr 60px auto', gap: 12, alignItems: 'center',
                background: isExp ? 'var(--color-primary-soft)' : 'var(--color-surface)',
              }}>
              <Icon name={isExp ? 'chevD' : 'chevR'} size={14} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-primary)' }}>{cp.kode}</span>
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>{cp.nama}</span>
              <span style={{ textAlign: 'right', fontWeight: 700, fontSize: 13, color: cp.mastered >= 80 ? 'var(--color-good)' : cp.mastered >= 50 ? 'var(--color-warn)' : 'var(--color-bad)' }}>{cp.mastered}%</span>
              <span className="tiny muted">{cp.tp_count} TP</span>
            </button>
            {isExp && (
              <div style={{ padding: '4px 14px 14px', background: 'var(--color-surface-2)' }}>
                {tpList.map(tp => (
                  <div key={tp.kode} style={{
                    display: 'grid', gridTemplateColumns: '70px 1fr 100px 80px',
                    gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-line)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)' }}>{tp.kode}</span>
                    <span className="small">{tp.nama}</span>
                    <div className="bar-track" style={{ height: 6 }}>
                      <div className="bar-fill" style={{ width: `${tp.mastered}%` }} />
                    </div>
                    <div className="tiny muted" style={{ textAlign: 'right' }}>
                      {tp.tugas} tugas · {tp.mastered}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
