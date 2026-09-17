'use client';
import { useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import { Pill, StudentAvatar } from '@/components/ui';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { interpolate } from '@/lib/i18n/format';
import type { Student, CP, Mapel } from '@/lib/types';

const TABS = [
  { id: 'siswa' as const, count: 156 },
  { id: 'kurikulum' as const, count: 8 },
  { id: 'mapel' as const, count: 6 },
  { id: 'guru' as const, count: 24 },
];

export function AdminTabs({ students, cps, mapel }: { students: Student[]; cps: CP[]; mapel: Mapel[] }) {
  const { dict } = useI18n();
  const [tab, setTab] = useState('siswa');

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-line)', marginBottom: 16, marginTop: -4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '10px 14px',
              borderBottom: tab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: tab === t.id ? 'var(--color-primary)' : 'var(--color-ink-3)',
              fontWeight: 600, fontSize: 13, marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            {dict.adminTabs.tabs[t.id]}
            <span style={{
              background: tab === t.id ? 'var(--color-primary-soft)' : 'var(--color-surface-2)',
              color: tab === t.id ? 'var(--color-primary)' : 'var(--color-ink-3)',
              padding: '1px 7px', borderRadius: 999, fontSize: 11,
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'siswa' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 items-center">
              <div className="search" style={{ width: 240 }}>
                <Icon name="search" size={14} />
                <input placeholder={dict.adminTabs.searchPlaceholder} />
              </div>
              <div className="seg">
                <button className="seg-btn active">{dict.adminTabs.semuaKelas}</button>
                <button className="seg-btn">VIII-A</button>
                <button className="seg-btn">VIII-B</button>
              </div>
            </div>
            <button className="btn btn-ghost"><Icon name="filter" size={14} /> {dict.adminTabs.filter}</button>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 32 }}><input type="checkbox" /></th>
                <th>{dict.adminTabs.colSiswa}</th><th>{dict.adminTabs.colNis}</th><th>{dict.adminTabs.colKelas}</th><th>{dict.adminTabs.colJk}</th>
                <th>{dict.adminTabs.colOrtu}</th><th>{dict.adminTabs.colSumber}</th><th>{dict.adminTabs.colDiperbarui}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <StudentAvatar student={s} size={28} />
                      <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{s.nama}</div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s.nis}</td>
                  <td>{s.kelas}</td>
                  <td>{s.jk}</td>
                  <td className="muted">{s.ortu}</td>
                  <td><Pill kind="primary">Dapodik</Pill></td>
                  <td className="tiny muted">26 Apr 2026</td>
                  <td><button className="btn btn-ghost"><Icon name="edit" size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'kurikulum' && (
        <div className="flex flex-col gap-3">
          <div className="muted small mb-2">{dict.adminTabs.kurikulumDesc}</div>
          {cps.map(cp => (
            <div key={cp.kode} style={{
              padding: 14, border: '1px solid var(--color-line)', borderRadius: 12,
              display: 'grid', gridTemplateColumns: '120px 1fr 200px auto', gap: 16, alignItems: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--color-primary)' }}>{cp.kode}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{cp.nama}</div>
                <div className="tiny muted">{interpolate(dict.adminTabs.tpTerkait, { count: cp.tp_count })}</div>
              </div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${cp.mastered}%` }} /></div>
              <button className="btn btn-ghost"><Icon name="chevR" size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {tab === 'mapel' && (
        <div className="grid grid-cols-3 gap-4">
          {mapel.map(m => (
            <div key={m.kode} style={{ padding: 16, border: '1px solid var(--color-line)', borderRadius: 12 }}>
              <div className="flex gap-3 mb-3">
                <span style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}15`, color: m.color, display: 'grid', placeItems: 'center' }}>
                  <Icon name={m.icon as IconName} size={20} />
                </span>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.nama}</div>
                  <div className="tiny muted">{interpolate(dict.adminTabs.kodeLabel, { kode: m.kode })}</div>
                </div>
              </div>
              <div className="flex justify-between tiny muted">
                <span>{dict.adminTabs.cpTpCount}</span>
                <span>{dict.adminTabs.guruCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'guru' && (
        <div className="muted" style={{ padding: 32, textAlign: 'center' }}>
          <Icon name="users" size={32} style={{ color: 'var(--color-ink-4)', marginBottom: 12 }} />
          <div>{dict.adminTabs.guruEmptyState}</div>
        </div>
      )}
    </div>
  );
}
