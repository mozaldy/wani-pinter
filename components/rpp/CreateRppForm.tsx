'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Icon } from '@/components/Icon';
import { createRpp } from '@/app/(app)/rpp/actions';

const DEFAULTS = {
  satuan: 'SDN 1 Keputran Surabaya',
  semester: 'Ganjil',
  alokasi: '2 x 35 menit per pertemuan',
};

export function CreateRppForm({ mapel, jabatan }: { mapel: string[]; jabatan: string }) {
  const [error, action] = useActionState(createRpp, null);
  const mapelDefault = mapel.find(m => jabatan.toLowerCase().includes(m.toLowerCase())) ?? mapel[0] ?? '';

  return (
    <form action={action} className="card">
      <div className="card-title">
        <h3>Buat Modul Ajar baru</h3>
        <span className="sub">Wani AI menyusun kerangka, Anda menyempurnakan</span>
      </div>

      <Fieldset mapel={mapel} mapelDefault={mapelDefault} />

      {error && (
        <div className="small" style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'var(--color-bad-soft)', color: 'var(--color-bad)' }}>
          {error}
        </div>
      )}

      <Submit />
    </form>
  );
}

function Fieldset({ mapel, mapelDefault }: { mapel: string[]; mapelDefault: string }) {
  const { pending } = useFormStatus();
  return (
    <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0 }}>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6 field">
          <label className="field-label">Mata Pelajaran</label>
          <input name="mapel" required defaultValue={mapelDefault} list="mapel-list" placeholder="Matematika" />
          <datalist id="mapel-list">{mapel.map(m => <option key={m} value={m} />)}</datalist>
        </div>
        <div className="col-span-6 field">
          <label className="field-label">Satuan Pendidikan</label>
          <input name="satuan" required defaultValue={DEFAULTS.satuan} />
        </div>

        <div className="col-span-3 field">
          <label className="field-label">Fase</label>
          <input name="fase" required defaultValue="A" placeholder="A / B / C / D" />
        </div>
        <div className="col-span-3 field">
          <label className="field-label">Kelas</label>
          <input name="kelas" required defaultValue="I" placeholder="I" />
        </div>
        <div className="col-span-3 field">
          <label className="field-label">Semester</label>
          <input name="semester" required defaultValue={DEFAULTS.semester} />
        </div>
        <div className="col-span-3 field">
          <label className="field-label">Jumlah pertemuan</label>
          <input name="jumlahPertemuan" type="number" min={1} max={20} required defaultValue={4} />
        </div>

        <div className="col-span-12 field">
          <label className="field-label">Topik / Materi</label>
          <input name="topik" required placeholder="Penjumlahan dan pengurangan sampai 20" />
        </div>

        <div className="col-span-12 field">
          <label className="field-label">Alokasi waktu</label>
          <input name="alokasi" required defaultValue={DEFAULTS.alokasi} />
        </div>

        <div className="col-span-12 field">
          <label className="field-label">Kondisi kelas <span className="muted">(opsional)</span></label>
          <textarea name="kondisiKelas" rows={3}
            placeholder="23 murid; 10 cepat menangkap, 9 menengah, 4 butuh pendampingan intensif. Sarana terbatas, banyak memakai benda konkret." />
        </div>
      </div>
    </fieldset>
  );
}

function Submit() {
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
        <div className="h-display" style={{ fontWeight: 500, marginBottom: 4 }}>Wani AI sedang menyusun kerangka</div>
        <div className="muted small">Identifikasi murid, tujuan, indikator, dan rute pertemuan.</div>
        <div style={{ maxWidth: 300, margin: '14px auto 0', height: 6, background: 'var(--color-surface-2)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', animation: 'rppSlide 1.2s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
      <Icon name="sparkle" size={13} /> Susun kerangka modul ajar
    </button>
  );
}
