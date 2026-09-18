'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/Icon';
import { Pill } from '@/components/ui';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { locales } from '@/lib/i18n/config';
import { setLocale } from '@/lib/i18n/actions';
import { interpolate } from '@/lib/i18n/format';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type TabId = keyof Dictionary['settings']['tabs'];

const TABS: { id: TabId; icon: IconName }[] = [
  { id: 'profil', icon: 'users' },
  { id: 'akun', icon: 'settings' },
  { id: 'notifikasi', icon: 'bell' },
  { id: 'preferensi', icon: 'sparkle' },
  { id: 'integrasi', icon: 'db' },
  { id: 'tagihan', icon: 'fileText' },
];

export function SettingsClient() {
  const [tab, setTab] = useState<TabId>('profil');
  const { dict } = useI18n();

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>{dict.settings.title}</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            {dict.settings.subtitle}
          </div>
        </div>
        <Link href="/login" className="btn btn-outline">
          <Icon name="arrowR" size={14} style={{ transform: 'rotate(180deg)' }} /> {dict.common.logout}
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <div className="card" style={{ padding: 8, position: 'sticky', top: 80 }}>
            <div className="flex flex-col gap-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`nav-item ${tab === t.id ? 'active' : ''}`}>
                  <Icon name={t.icon} />
                  <span>{dict.settings.tabs[t.id]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-9">
          {tab === 'profil' && <ProfilTab />}
          {tab === 'akun' && <AkunTab />}
          {tab === 'notifikasi' && <NotifikasiTab />}
          {tab === 'preferensi' && <PreferensiTab />}
          {tab === 'integrasi' && <IntegrasiTab />}
          {tab === 'tagihan' && <TagihanTab />}
        </div>
      </div>
    </div>
  );
}

function ProfilTab() {
  const { dict } = useI18n();
  const p = dict.settings.profil;
  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="card-title"><h3>{p.photoTitle}</h3></div>
        <div className="flex gap-4 items-center">
          <div style={{ width: 80, height: 80, borderRadius: 50, background: 'linear-gradient(135deg, #FCA5A5, #F59E0B)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: 28, fontFamily: 'var(--font-display)' }}>SR</div>
          <div style={{ flex: 1 }}>
            <div className="small mb-2">{p.photoDesc}</div>
            <div className="flex gap-2">
              <button className="btn btn-outline"><Icon name="upload" size={13} /> {p.uploadPhoto}</button>
              <button className="btn btn-ghost">{p.removePhoto}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h3>{p.infoTitle}</h3><span className="sub">{p.infoSynced}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field"><label className="field-label">{p.fields.fullName}</label><input defaultValue="Sari Rahmawati, S.Pd" /></div>
          <div className="field"><label className="field-label">{p.fields.nickname}</label><input defaultValue="Bu Sari" /></div>
          <div className="field"><label className="field-label">{p.fields.nip}</label><input defaultValue="198509142010012015" style={{ fontFamily: 'var(--font-mono)' }} /></div>
          <div className="field"><label className="field-label">{p.fields.nuptk}</label><input defaultValue="2046763664300003" style={{ fontFamily: 'var(--font-mono)' }} /></div>
          <div className="field"><label className="field-label">{p.fields.schoolEmail}</label><input defaultValue="sari.rahmawati@sdn1keputran.sch.id" /></div>
          <div className="field"><label className="field-label">{p.fields.whatsapp}</label><input defaultValue="+62 812-3456-7890" /></div>
          <div className="field"><label className="field-label">{p.fields.subject}</label><input defaultValue="Matematika" /></div>
          <div className="field"><label className="field-label">{p.fields.homeroom}</label><select><option>VIII-A</option><option>VIII-B</option><option>—</option></select></div>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label className="field-label">{p.fields.bio}</label>
            <textarea rows={3} defaultValue="Guru Matematika SD dengan minat khusus pada diferensiasi pembelajaran dan numerasi kontekstual. 14 tahun mengajar." />
          </div>
        </div>
        <div className="flex gap-2 justify-end" style={{ marginTop: 16 }}>
          <button className="btn btn-ghost">{dict.common.batal}</button>
          <button className="btn btn-primary">{p.saveChanges}</button>
        </div>
      </div>
    </div>
  );
}

const TWO_FA: { id: keyof Dictionary['settings']['akun']['twoFaOptions']; on: boolean }[] = [
  { id: 'authenticator', on: true },
  { id: 'sms', on: true },
  { id: 'yubikey', on: false },
];

function AkunTab() {
  const { dict } = useI18n();
  const a = dict.settings.akun;
  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="card-title"><h3>{a.passwordTitle}</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field" style={{ gridColumn: 'span 2' }}><label className="field-label">{a.currentPassword}</label><input type="password" defaultValue="••••••••••" /></div>
          <div className="field"><label className="field-label">{a.newPassword}</label><input type="password" placeholder={a.newPasswordPlaceholder} /></div>
          <div className="field"><label className="field-label">{a.confirmPassword}</label><input type="password" placeholder={a.confirmPasswordPlaceholder} /></div>
        </div>
        <div style={{ padding: 10, background: 'var(--color-surface-2)', borderRadius: 8, marginTop: 8 }}>
          <div className="tiny muted" style={{ fontWeight: 700, marginBottom: 6 }}>{a.strengthLabel}</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= 3 ? 'var(--color-good)' : 'var(--color-surface-3)' }} />)}
          </div>
          <div className="tiny" style={{ color: 'var(--color-good)', marginTop: 6, fontWeight: 600 }}>{a.strengthStrong}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h3>{a.twoFaTitle}</h3><Pill kind="good" dot>{a.active}</Pill></div>
        <div className="small muted mb-3">{a.twoFaDesc}</div>
        <div className="flex flex-col gap-2">
          {TWO_FA.map(o => {
            const opt = a.twoFaOptions[o.id];
            return (
              <div key={o.id} className="flex justify-between items-center" style={{ padding: 12, border: '1px solid var(--color-line)', borderRadius: 10 }}>
                <div>
                  <div className="small" style={{ fontWeight: 600 }}>{opt.label}</div>
                  <div className="tiny muted">{opt.desc}</div>
                </div>
                <div style={{ width: 36, height: 20, borderRadius: 999, background: o.on ? 'var(--color-good)' : 'var(--color-surface-3)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 2, left: o.on ? 18 : 2, width: 16, height: 16, borderRadius: 50, background: 'white', transition: 'left 0.2s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ borderColor: 'var(--color-bad)', background: 'var(--color-bad-soft)' }}>
        <div className="card-title"><h3 style={{ color: 'var(--color-bad)' }}>{a.dangerZoneTitle}</h3></div>
        <div className="flex justify-between items-center">
          <div>
            <div className="small" style={{ fontWeight: 600 }}>{a.deleteAccountTitle}</div>
            <div className="tiny muted">{a.deleteAccountDesc}</div>
          </div>
          <button className="btn" style={{ background: 'var(--color-bad)', color: 'white' }}>{a.requestDeletion}</button>
        </div>
      </div>
    </div>
  );
}

const NOTIF_ROWS: { id: keyof Dictionary['settings']['notifikasi']['rows']; e: boolean; p: boolean; w: boolean }[] = [
  { id: 'newPattern', e: true, p: true, w: false },
  { id: 'atRiskStudent', e: true, p: true, w: true },
  { id: 'dailyDeadline', e: true, p: true, w: false },
  { id: 'kepsekComment', e: true, p: false, w: false },
  { id: 'dapodikSync', e: false, p: true, w: false },
  { id: 'platformAnnouncement', e: false, p: false, w: false },
];

function NotifikasiTab() {
  const { dict } = useI18n();
  const n = dict.settings.notifikasi;
  return (
    <div className="card">
      <div className="card-title"><h3>{n.title}</h3><span className="sub">{n.subtitle}</span></div>
      <table className="tbl">
        <thead>
          <tr>
            <th>{n.columns.type}</th>
            <th style={{ textAlign: 'center', width: 80 }}>{n.columns.email}</th>
            <th style={{ textAlign: 'center', width: 80 }}>{n.columns.push}</th>
            <th style={{ textAlign: 'center', width: 80 }}>{n.columns.whatsapp}</th>
          </tr>
        </thead>
        <tbody>
          {NOTIF_ROWS.map(r => {
            const row = n.rows[r.id];
            return (
              <tr key={r.id}>
                <td><div style={{ fontWeight: 600 }}>{row.label}</div><div className="tiny muted">{row.desc}</div></td>
                {(['e', 'p', 'w'] as const).map(c => (
                  <td key={c} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', width: 32, height: 18, borderRadius: 999, background: r[c] ? 'var(--color-primary)' : 'var(--color-surface-3)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 2, left: r[c] ? 16 : 2, width: 14, height: 14, borderRadius: 50, background: 'white' }} />
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ padding: 14, background: 'var(--color-surface-2)', borderRadius: 10, marginTop: 16 }}>
        <div className="small mb-2" style={{ fontWeight: 600 }}>{n.quietHours}</div>
        <div className="flex gap-3 items-center">
          <span className="small">{n.from}</span>
          <input type="time" defaultValue="22:00" style={{ padding: 6, borderRadius: 6, border: '1px solid var(--color-line)' }} />
          <span className="small">{n.until}</span>
          <input type="time" defaultValue="06:00" style={{ padding: 6, borderRadius: 6, border: '1px solid var(--color-line)' }} />
        </div>
      </div>
    </div>
  );
}

const AI_OPTIONS: { id: keyof Dictionary['settings']['preferensi']['aiOptions']; on: boolean }[] = [
  { id: 'dailySummary', on: true },
  { id: 'autoRubric', on: true },
  { id: 'voiceToText', on: true },
  { id: 'anonymousSharing', on: false },
];

function PreferensiTab() {
  const { dict, locale } = useI18n();
  const [pending, startTransition] = useTransition();
  const p = dict.settings.preferensi;
  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="card-title"><h3>{p.displayTitle}</h3></div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="small" style={{ fontWeight: 600 }}>{dict.locale.label}</span>
            <select
              value={locale}
              disabled={pending}
              onChange={e => { const next = e.target.value; startTransition(() => setLocale(next)); }}
              style={{ padding: 8, borderRadius: 8, border: '1px solid var(--color-line)' }}
            >
              {locales.map(l => <option key={l} value={l}>{dict.locale[l]}</option>)}
            </select>
          </div>
          <div className="flex justify-between items-center"><span className="small" style={{ fontWeight: 600 }}>{p.colorMode}</span>
            <div className="seg"><button className="seg-btn active">{p.themeOptions.light}</button><button className="seg-btn">{p.themeOptions.dark}</button><button className="seg-btn">{p.themeOptions.auto}</button></div>
          </div>
          <div className="flex justify-between items-center"><span className="small" style={{ fontWeight: 600 }}>{p.weekStart}</span>
            <div className="seg"><button className="seg-btn active">{p.weekStartOptions.monday}</button><button className="seg-btn">{p.weekStartOptions.sunday}</button></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h3>{p.aiTitle}</h3><Pill kind="primary" dot>{p.betaBadge}</Pill></div>
        <div className="flex flex-col gap-3">
          {AI_OPTIONS.map(o => {
            const opt = p.aiOptions[o.id];
            return (
              <label key={o.id} className="flex justify-between items-center">
                <div><div className="small" style={{ fontWeight: 600 }}>{opt.label}</div><div className="tiny muted">{opt.desc}</div></div>
                <div style={{ width: 36, height: 20, borderRadius: 999, background: o.on ? 'var(--color-good)' : 'var(--color-surface-3)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 2, left: o.on ? 18 : 2, width: 16, height: 16, borderRadius: 50, background: 'white', transition: 'left 0.2s' }} />
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const APPS: { id: keyof Dictionary['settings']['integrasi']['apps']; name: string; status: keyof Dictionary['settings']['integrasi']['status'] }[] = [
  { id: 'dapodik', name: 'Dapodik', status: 'good' },
  { id: 'quizizz', name: 'Quizizz', status: 'good' },
  { id: 'googleClassroom', name: 'Google Classroom', status: 'good' },
  { id: 'googleForms', name: 'Google Forms', status: 'warn' },
  { id: 'msTeams', name: 'Microsoft Teams for Edu', status: 'ink' },
  { id: 'kahoot', name: 'Kahoot!', status: 'ink' },
];

function IntegrasiTab() {
  const { dict } = useI18n();
  const t = dict.settings.integrasi;
  return (
    <div className="card">
      <div className="card-title"><h3>{t.title}</h3><button className="btn btn-primary"><Icon name="plus" size={13} /> {t.connectNew}</button></div>
      <div className="flex flex-col gap-3">
        {APPS.map(a => {
          const app = t.apps[a.id];
          return (
            <div key={a.id} className="flex justify-between items-center" style={{ padding: 14, border: '1px solid var(--color-line)', borderRadius: 12 }}>
              <div className="flex gap-3 items-center">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-surface-2)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-display)', color: 'var(--color-ink-2)' }}>{a.name[0]}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.name}</div>
                  <div className="tiny muted">{app.desc} · {app.last}</div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                {a.status === 'good' && <Pill kind="good" dot>{t.status.good}</Pill>}
                {a.status === 'warn' && <Pill kind="warn" dot>{t.status.warn}</Pill>}
                {a.status === 'ink' && <Pill kind="ink">{t.status.ink}</Pill>}
                <button className="btn btn-outline">{a.status === 'ink' ? t.connect : t.manage}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PLANS: { id: keyof Dictionary['settings']['tagihan']['plans']; cur: boolean }[] = [
  { id: 'dasar', cur: false },
  { id: 'sekolah', cur: true },
  { id: 'yayasan', cur: false },
];

function TagihanTab() {
  const { dict } = useI18n();
  const t = dict.settings.tagihan;
  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="card-title"><h3>{t.schoolTitle}</h3></div>
        <div className="flex gap-4 items-center">
          <div style={{ width: 64, height: 64, borderRadius: 12, background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'grid', placeItems: 'center', color: 'white', fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>S1</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>SDN 1 Keputran Surabaya</div>
            <div className="tiny muted">NPSN: 20403108 · Akreditasi A · Surabaya, JATIM</div>
            <div className="flex gap-2" style={{ marginTop: 8 }}>
              <Pill kind="primary">{interpolate(t.stats.students, { count: 156 })}</Pill>
              <Pill kind="ink">{interpolate(t.stats.teachers, { count: 24 })}</Pill>
              <Pill kind="accent">{interpolate(t.stats.classes, { count: 6 })}</Pill>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h3>{t.subscriptionTitle}</h3><Pill kind="primary" dot>{t.active}</Pill></div>
        <div className="grid grid-cols-3 gap-3">
          {PLANS.map(p => {
            const plan = t.plans[p.id];
            const features = Object.values(plan.features);
            const price = interpolate(plan.price, { amount: 'Rp 12.000' });
            return (
              <div key={p.id} style={{
                padding: 16, border: p.cur ? '2px solid var(--color-primary)' : '1px solid var(--color-line)',
                borderRadius: 14, background: p.cur ? 'var(--color-primary-soft)' : 'var(--color-surface)', position: 'relative',
              }}>
                {p.cur && <div style={{ position: 'absolute', top: -10, left: 16, background: 'var(--color-primary)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{t.currentPlanBadge}</div>}
                <div className="h-display" style={{ fontSize: 18, fontWeight: 600 }}>{plan.name}</div>
                <div className="small muted mb-3">{price}</div>
                <ul style={{ paddingLeft: 16, fontSize: 12.5, lineHeight: 1.8, color: 'var(--color-ink-2)' }}>
                  {features.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
                {!p.cur && <button className="btn btn-outline btn-block" style={{ marginTop: 12 }}>{p.id === 'yayasan' ? t.contactSales : t.choosePlan}</button>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
