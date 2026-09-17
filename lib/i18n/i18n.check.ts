// Offline check for the i18n core: run with `pnpm i18n:check`.
import assert from 'node:assert/strict';
import { negotiateLocale, hasLocale, locales } from './config';
import { interpolate, lookup, formatDate, formatNumber } from './format';
import { dictionaries } from './dictionaries';

// negotiateLocale
assert.equal(negotiateLocale(undefined), 'id');
assert.equal(negotiateLocale(''), 'id');
assert.equal(negotiateLocale('en-US,en;q=0.9'), 'en');
assert.equal(negotiateLocale('id-ID,id;q=0.9,en;q=0.8'), 'id');
assert.equal(negotiateLocale('fr-FR,en;q=0.5,id;q=0.7'), 'id');
assert.equal(negotiateLocale('fr-FR,de;q=0.5'), 'id');
assert.equal(negotiateLocale('EN'), 'en');

// hasLocale
assert.ok(hasLocale('en'));
assert.ok(!hasLocale('fr'));
assert.ok(!hasLocale(undefined));

// interpolate
assert.equal(interpolate('Kelas {kelas} · {n} siswa', { kelas: '4A', n: 28 }), 'Kelas 4A · 28 siswa');
assert.equal(interpolate('Tanpa variabel', {}), 'Tanpa variabel');
assert.equal(interpolate('{missing} tetap', {}), '{missing} tetap');

// lookup
assert.equal(lookup({ rendah: 'Low' }, 'rendah'), 'Low');
assert.equal(lookup({ rendah: 'Low' }, 'Bahasa Jawa'), 'Bahasa Jawa');

// formatDate / formatNumber
const d = new Date('2026-04-10T08:00:00Z');
assert.equal(formatDate(d, 'id', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }), '10 April 2026');
assert.equal(formatDate(d, 'en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }), 'April 10, 2026');
assert.equal(formatDate('2026-04-10T08:00:00Z', 'id', { month: 'short', timeZone: 'UTC' }), 'Apr');
assert.equal(formatNumber(2847, 'id'), '2.847');
assert.equal(formatNumber(2847, 'en'), '2,847');

// dictionaries: same key set, no empty strings, placeholders preserved
type Tree = { [k: string]: string | Tree };
function leaves(t: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [k, v] of Object.entries(t)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.set(path, v);
    else for (const [p, s] of leaves(v, path)) out.set(p, s);
  }
  return out;
}
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
const ref = leaves(dictionaries.id as unknown as Tree);
for (const loc of locales) {
  const cur = leaves(dictionaries[loc] as unknown as Tree);
  assert.deepEqual([...cur.keys()].sort(), [...ref.keys()].sort(), `${loc}: key set differs from id`);
  for (const [path, s] of cur) {
    assert.ok(s.trim().length > 0, `${loc}.${path} is empty`);
    assert.deepEqual(placeholders(s), placeholders(ref.get(path)!), `${loc}.${path} placeholders differ from id`);
  }
}

console.log(`OK — ${ref.size} keys × ${locales.length} locales`);
