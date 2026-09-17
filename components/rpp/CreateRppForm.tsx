'use client';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Icon } from '@/components/Icon';
import { createRpp } from '@/app/(app)/rpp/actions';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { lookup } from '@/lib/i18n/format';

const DEFAULTS = {
  satuan: 'SDN 1 Keputran Surabaya',
  semester: 'Ganjil',
  alokasi: '2 x 35 menit per pertemuan',
};

const DEFAULT_MAPEL = [
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'IPA Terpadu',
  'IPS Terpadu',
  'IPAS',
  'Pendidikan Pancasila',
  'Pendidikan Agama & Budi Pekerti',
  'PJOK',
  'Seni Budaya',
  'Seni Rupa',
  'Seni Musik',
  'Informatika',
  'Bahasa Jawa',
];

const FASE_OPTIONS = [
  {
    value: 'A',
    label: 'A (Kelas I–II)',
    kelas: [
      { value: 'I', label: 'Kelas I (1)' },
      { value: 'II', label: 'Kelas II (2)' },
    ],
  },
  {
    value: 'B',
    label: 'B (Kelas III–IV)',
    kelas: [
      { value: 'III', label: 'Kelas III (3)' },
      { value: 'IV', label: 'Kelas IV (4)' },
    ],
  },
  {
    value: 'C',
    label: 'C (Kelas V–VI)',
    kelas: [
      { value: 'V', label: 'Kelas V (5)' },
      { value: 'VI', label: 'Kelas VI (6)' },
    ],
  },
  {
    value: 'D',
    label: 'D (Kelas VII–IX)',
    kelas: [
      { value: 'VII', label: 'Kelas VII (7)' },
      { value: 'VIII', label: 'Kelas VIII (8)' },
      { value: 'IX', label: 'Kelas IX (9)' },
    ],
  },
  {
    value: 'E',
    label: 'E (Kelas X)',
    kelas: [
      { value: 'X', label: 'Kelas X (10)' },
    ],
  },
  {
    value: 'F',
    label: 'F (Kelas XI–XII)',
    kelas: [
      { value: 'XI', label: 'Kelas XI (11)' },
      { value: 'XII', label: 'Kelas XII (12)' },
    ],
  },
] as const;

export function CreateRppForm({ mapel, jabatan }: { mapel: string[]; jabatan: string }) {
  const { dict } = useI18n();
  const [error, action] = useActionState(createRpp, null);
  const mapelList = Array.from(new Set([...mapel, ...DEFAULT_MAPEL]));
  const mapelDefault = mapelList.find(m => jabatan.toLowerCase().includes(m.toLowerCase())) ?? mapelList[0] ?? '';

  return (
    <form action={action} className="card">
      <div className="card-title">
        <h3>{dict.rpp.create.title}</h3>
        <span className="sub">{dict.rpp.create.subtitle}</span>
      </div>

      <Fieldset mapel={mapelList} mapelDefault={mapelDefault} dict={dict} />

      {error && (
        <div className="small" style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'var(--color-bad-soft)', color: 'var(--color-bad)' }}>
          {error}
        </div>
      )}

      <Submit />
    </form>
  );
}

function Fieldset({ mapel, mapelDefault, dict }: { mapel: string[]; mapelDefault: string; dict: Dictionary }) {
  const { pending } = useFormStatus();
  const [fase, setFase] = useState('A');
  const [kelas, setKelas] = useState('I');

  const activeFase = FASE_OPTIONS.find(f => f.value === fase) ?? FASE_OPTIONS[0];

  const handleFaseChange = (newFase: string) => {
    setFase(newFase);
    const targetFase = FASE_OPTIONS.find(f => f.value === newFase);
    if (targetFase && !targetFase.kelas.some(k => k.value === kelas)) {
      setKelas(targetFase.kelas[0].value);
    }
  };

  return (
    <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0 }}>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6 field">
          <label className="field-label">{dict.rpp.create.mapelLabel}</label>
          <select name="mapel" required defaultValue={mapelDefault}>
            {mapel.map(m => (
              <option key={m} value={m}>{lookup(dict.enums.mapel, m)}</option>
            ))}
          </select>
        </div>
        <div className="col-span-6 field">
          <label className="field-label">{dict.rpp.create.satuanLabel}</label>
          <input name="satuan" required defaultValue={DEFAULTS.satuan} />
        </div>

        <div className="col-span-3 field">
          <label className="field-label">{dict.rpp.create.faseLabel}</label>
          <select name="fase" required value={fase} onChange={e => handleFaseChange(e.target.value)}>
            {FASE_OPTIONS.map(f => (
              <option key={f.value} value={f.value}>{dict.rpp.create.faseOptions[f.value]}</option>
            ))}
          </select>
        </div>
        <div className="col-span-3 field">
          <label className="field-label">{dict.rpp.create.kelasLabel}</label>
          <select name="kelas" required value={kelas} onChange={e => setKelas(e.target.value)}>
            {activeFase.kelas.map(k => (
              <option key={k.value} value={k.value}>{dict.rpp.create.kelasOptions[k.value]}</option>
            ))}
          </select>
        </div>
        <div className="col-span-3 field">
          <label className="field-label">{dict.rpp.create.semesterLabel}</label>
          <select name="semester" required defaultValue={DEFAULTS.semester}>
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </select>
        </div>
        <div className="col-span-3 field">
          <label className="field-label">{dict.rpp.create.jumlahPertemuanLabel}</label>
          <input name="jumlahPertemuan" type="number" min={1} max={20} required defaultValue={4} />
        </div>

        <div className="col-span-12 field">
          <label className="field-label">{dict.rpp.create.topikLabel}</label>
          <input name="topik" required placeholder={dict.rpp.create.topikPlaceholder} />
        </div>

        <div className="col-span-12 field">
          <label className="field-label">
            {dict.rpp.create.tpLabel} <span className="muted">{dict.rpp.create.tpOptional}</span>
          </label>
          <textarea name="tujuanPembelajaran" rows={2}
            placeholder={dict.rpp.create.tpPlaceholder} />
          <span className="tiny muted">{dict.rpp.create.tpHint}</span>
        </div>

        <div className="col-span-12 field">
          <label className="field-label">{dict.rpp.create.alokasiLabel}</label>
          <input name="alokasi" required defaultValue={DEFAULTS.alokasi} />
        </div>

        <div className="col-span-12 field">
          <label className="field-label">{dict.rpp.create.kondisiLabel} <span className="muted">{dict.rpp.create.kondisiOptional}</span></label>
          <textarea name="kondisiKelas" rows={3}
            placeholder={dict.rpp.create.kondisiPlaceholder} />
        </div>
      </div>
    </fieldset>
  );
}

function Submit() {
  const { dict } = useI18n();
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <div style={{ textAlign: 'center', padding: '28px 20px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 50,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          margin: '0 auto 14px', display: 'grid', placeItems: 'center',
          color: 'white', animation: 'pulseScale 1.5s infinite',
        }}>
          <Icon name="sparkle" size={24} />
        </div>
        <div className="h-display" style={{ fontWeight: 500, marginBottom: 4 }}>{dict.rpp.create.loadingTitle}</div>
        <div className="muted small">{dict.rpp.create.loadingBody}</div>
        <div style={{ maxWidth: 300, margin: '14px auto 0', height: 6, background: 'var(--color-surface-2)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', animation: 'rppSlide 1.2s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
      <Icon name="sparkle" size={13} /> {dict.rpp.create.submit}
    </button>
  );
}
