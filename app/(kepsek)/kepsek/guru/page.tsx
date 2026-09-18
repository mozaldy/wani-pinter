import Link from 'next/link';
import { StatCard, Pill } from '@/components/ui';
import { getTeacherActivity, type TeacherActivity } from '@/lib/queries';
import { getDictionary, getLocale } from '@/lib/i18n/server';
import { formatDate, interpolate } from '@/lib/i18n/format';
import type { Locale } from '@/lib/i18n/config';

function getStatus(t: TeacherActivity): 'aktif' | 'perhatian' | 'tidak-aktif' {
  if (t.total_minggu > 0) return 'aktif';
  if (t.terakhir_aktif) {
    const days = Math.floor((Date.now() - new Date(t.terakhir_aktif).getTime()) / 86400000);
    if (days <= 14) return 'perhatian';
  }
  return 'tidak-aktif';
}

function formatTgl(tgl: string | null, locale: Locale) {
  if (!tgl) return '—';
  return formatDate(tgl, locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function KepsekGuruPage() {
  const [teachers, dict, locale] = await Promise.all([getTeacherActivity(), getDictionary(), getLocale()]);

  const aktif = teachers.filter(t => getStatus(t) === 'aktif').length;
  const perhatian = teachers.filter(t => getStatus(t) === 'perhatian').length;
  const tidakAktif = teachers.filter(t => getStatus(t) === 'tidak-aktif').length;

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>{dict.kepsek.guru.title}</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            {interpolate(dict.kepsek.guru.subtitle, { count: teachers.length })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-4">
          <StatCard label={dict.kepsek.guru.statAktifMingguIni} value={aktif} foot={dict.kepsek.guru.statAktifMingguIniFoot} icon="check" accent="#10B981" />
        </div>
        <div className="col-span-4">
          <StatCard label={dict.kepsek.guru.statPerluPerhatian} value={perhatian} foot={dict.kepsek.guru.statPerluPerhatianFoot} icon="alert" accent="#F59E0B" />
        </div>
        <div className="col-span-4">
          <StatCard label={dict.kepsek.guru.statTidakAktif} value={tidakAktif} foot={dict.kepsek.guru.statTidakAktifFoot} icon="x" accent="#EF4444" />
        </div>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>{dict.kepsek.guru.colGuru}</th>
              <th>{dict.kepsek.guru.colJabatan}</th>
              <th>{dict.kepsek.guru.colEntriBulanIni}</th>
              <th>{dict.kepsek.guru.colEntriMingguIni}</th>
              <th>{dict.kepsek.guru.colTerakhirAktif}</th>
              <th>{dict.kepsek.guru.colStatus}</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => {
              const status = getStatus(t);
              return (
                <tr key={t.id} style={{ cursor: 'pointer' }}>
                  <td>
                    <Link href={`/kepsek/guru/${t.id}`} className="flex items-center gap-3">
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        display: 'grid', placeItems: 'center',
                        color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0,
                      }}>{t.initials}</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{t.nama}</div>
                    </Link>
                  </td>
                  <td className="muted">{t.jabatan}</td>
                  <td><strong>{t.total_bulan}</strong> {dict.kepsek.guru.entri}</td>
                  <td>
                    <strong style={{ color: t.total_minggu > 0 ? 'var(--color-good)' : 'var(--color-bad)' }}>
                      {t.total_minggu}
                    </strong> {dict.kepsek.guru.entri}
                  </td>
                  <td className="muted">{formatTgl(t.terakhir_aktif, locale)}</td>
                  <td>
                    {status === 'aktif' && <Pill kind="good" dot>{dict.kepsek.guru.statusAktif}</Pill>}
                    {status === 'perhatian' && <Pill kind="warn" dot>{dict.kepsek.guru.statPerluPerhatian}</Pill>}
                    {status === 'tidak-aktif' && <Pill kind="bad" dot>{dict.kepsek.guru.statTidakAktif}</Pill>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
