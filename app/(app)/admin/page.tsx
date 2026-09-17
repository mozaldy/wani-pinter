import { Icon } from '@/components/Icon';
import { Pill } from '@/components/ui';
import { AdminTabs } from '@/components/AdminTabs';
import { getStudents, getCPList, getMapel } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';

export default async function AdminPage() {
  const [students, cps, mapel] = await Promise.all([getStudents(), getCPList(), getMapel()]);
  const dict = await getDictionary();
  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>{dict.admin.title}</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            {dict.admin.subtitle}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline"><Icon name="download" size={14} /> {dict.admin.eksporCsv}</button>
          <button className="btn btn-primary"><Icon name="upload" size={14} /> {dict.admin.imporData}</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        {[
          { l: 'Dapodik', s: dict.admin.integrations.dapodik.status, d: dict.admin.integrations.dapodik.desc, last: dict.admin.integrations.dapodik.last, color: 'var(--color-good)', kind: 'good' as const },
          { l: 'Quizizz', s: dict.admin.integrations.quizizz.status, d: dict.admin.integrations.quizizz.desc, last: dict.admin.integrations.quizizz.last, color: 'var(--color-good)', kind: 'good' as const },
          { l: 'Google Forms', s: dict.admin.integrations.googleForms.status, d: dict.admin.integrations.googleForms.desc, last: dict.admin.integrations.googleForms.last, color: 'var(--color-warn)', kind: 'warn' as const },
          { l: 'Excel Internal', s: dict.admin.integrations.excel.status, d: dict.admin.integrations.excel.desc, last: dict.admin.integrations.excel.last, color: 'var(--color-ink-4)', kind: 'ink' as const },
        ].map((c, i) => (
          <div key={i} className="col-span-3">
            <div className="card" style={{ borderLeft: `3px solid ${c.color}` }}>
              <div className="flex justify-between mb-2">
                <span className="small" style={{ fontWeight: 600 }}>{c.l}</span>
                <Pill kind={c.kind} dot={c.kind !== 'ink'}>{c.s}</Pill>
              </div>
              <div className="tiny muted">{c.d}</div>
              <div className="tiny muted" style={{ marginTop: 4 }}>{c.last}</div>
            </div>
          </div>
        ))}
      </div>

      <AdminTabs students={students} cps={cps} mapel={mapel} />
    </div>
  );
}
