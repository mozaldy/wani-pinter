'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/Icon';
import { Pill } from '@/components/ui';

const TABS: { id: string; label: string; icon: IconName }[] = [
  { id: 'profil', label: 'Profil', icon: 'users' },
  { id: 'akun', label: 'Akun & Keamanan', icon: 'settings' },
  { id: 'notifikasi', label: 'Notifikasi', icon: 'bell' },
  { id: 'preferensi', label: 'Preferensi', icon: 'sparkle' },
  { id: 'integrasi', label: 'Integrasi', icon: 'db' },
  { id: 'tagihan', label: 'Sekolah & Tagihan', icon: 'fileText' },
];

export function SettingsClient() {
  const [tab, setTab] = useState('profil');

  return (
    <div className="screen-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 26 }}>Pengaturan</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
            Kelola profil, keamanan, dan preferensi platform Anda
          </div>
        </div>
        <Link href="/login" className="btn btn-outline">
          <Icon name="arrowR" size={14} style={{ transform: 'rotate(180deg)' }} /> Keluar
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <div className="card" style={{ padding: 8, position: 'sticky', top: 80 }}>
            <div className="flex flex-col gap-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`nav-item ${tab === t.id ? 'active' : ''}`}>
                  <Icon name={t.icon} />
                  <span>{t.label}</span>
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
  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="card-title"><h3>Foto profil</h3></div>
        <div className="flex gap-4 items-center">
          <div style={{ width: 80, height: 80, borderRadius: 50, background: 'linear-gradient(135deg, #FCA5A5, #F59E0B)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: 28, fontFamily: 'var(--font-display)' }}>SR</div>
          <div style={{ flex: 1 }}>
            <div className="small mb-2">Foto akan muncul di komentar, jurnal, dan rapot. Gunakan format JPG/PNG, maksimal 2 MB.</div>
            <div className="flex gap-2">
              <button className="btn btn-outline"><Icon name="upload" size={13} /> Unggah foto</button>
              <button className="btn btn-ghost">Hapus</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h3>Informasi pribadi</h3><span className="sub">Tersinkron dengan Dapodik</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field"><label className="field-label">Nama lengkap</label><input defaultValue="Sari Rahmawati, S.Pd" /></div>
          <div className="field"><label className="field-label">Nama panggilan</label><input defaultValue="Bu Sari" /></div>
          <div className="field"><label className="field-label">NIP</label><input defaultValue="198509142010012015" style={{ fontFamily: 'var(--font-mono)' }} /></div>
          <div className="field"><label className="field-label">NUPTK</label><input defaultValue="2046763664300003" style={{ fontFamily: 'var(--font-mono)' }} /></div>
          <div className="field"><label className="field-label">Email sekolah</label><input defaultValue="sari.rahmawati@sdn1keputran.sch.id" /></div>
          <div className="field"><label className="field-label">No. WhatsApp</label><input defaultValue="+62 812-3456-7890" /></div>
          <div className="field"><label className="field-label">Mata pelajaran</label><input defaultValue="Matematika" /></div>
          <div className="field"><label className="field-label">Wali kelas</label><select><option>VIII-A</option><option>VIII-B</option><option>—</option></select></div>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label className="field-label">Bio singkat</label>
            <textarea rows={3} defaultValue="Guru Matematika SD dengan minat khusus pada diferensiasi pembelajaran dan numerasi kontekstual. 14 tahun mengajar." />
          </div>
        </div>
        <div className="flex gap-2 justify-end" style={{ marginTop: 16 }}>
          <button className="btn btn-ghost">Batal</button>
          <button className="btn btn-primary">Simpan perubahan</button>
        </div>
      </div>
    </div>
  );
}

function AkunTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="card-title"><h3>Kata sandi</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field" style={{ gridColumn: 'span 2' }}><label className="field-label">Kata sandi saat ini</label><input type="password" defaultValue="••••••••••" /></div>
          <div className="field"><label className="field-label">Kata sandi baru</label><input type="password" placeholder="Minimal 8 karakter" /></div>
          <div className="field"><label className="field-label">Konfirmasi</label><input type="password" placeholder="Ulangi kata sandi baru" /></div>
        </div>
        <div style={{ padding: 10, background: 'var(--color-surface-2)', borderRadius: 8, marginTop: 8 }}>
          <div className="tiny muted" style={{ fontWeight: 700, marginBottom: 6 }}>Kekuatan kata sandi:</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= 3 ? 'var(--color-good)' : 'var(--color-surface-3)' }} />)}
          </div>
          <div className="tiny" style={{ color: 'var(--color-good)', marginTop: 6, fontWeight: 600 }}>● Kuat — kombinasi huruf besar/kecil, angka, dan simbol</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h3>Verifikasi 2 langkah (2FA)</h3><Pill kind="good" dot>Aktif</Pill></div>
        <div className="small muted mb-3">Tambahan keamanan saat masuk dari perangkat baru. Saat ini aktif via aplikasi authenticator.</div>
        <div className="flex flex-col gap-2">
          {[
            { l: 'Aplikasi Authenticator', d: 'Google Authenticator · diaktifkan 14 Mar 2026', on: true },
            { l: 'SMS ke +62 812-***-7890', d: 'Cadangan jika authenticator tidak tersedia', on: true },
            { l: 'Kunci keamanan fisik (YubiKey)', d: 'Belum dikonfigurasi', on: false },
          ].map(o => (
            <div key={o.l} className="flex justify-between items-center" style={{ padding: 12, border: '1px solid var(--color-line)', borderRadius: 10 }}>
              <div>
                <div className="small" style={{ fontWeight: 600 }}>{o.l}</div>
                <div className="tiny muted">{o.d}</div>
              </div>
              <div style={{ width: 36, height: 20, borderRadius: 999, background: o.on ? 'var(--color-good)' : 'var(--color-surface-3)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 2, left: o.on ? 18 : 2, width: 16, height: 16, borderRadius: 50, background: 'white', transition: 'left 0.2s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ borderColor: 'var(--color-bad)', background: 'var(--color-bad-soft)' }}>
        <div className="card-title"><h3 style={{ color: 'var(--color-bad)' }}>Zona berbahaya</h3></div>
        <div className="flex justify-between items-center">
          <div>
            <div className="small" style={{ fontWeight: 600 }}>Hapus akun</div>
            <div className="tiny muted">Tindakan ini tidak dapat dibatalkan. Data jurnal &amp; nilai akan dipindah ke admin.</div>
          </div>
          <button className="btn" style={{ background: 'var(--color-bad)', color: 'white' }}>Minta penghapusan</button>
        </div>
      </div>
    </div>
  );
}

function NotifikasiTab() {
  const ROWS = [
    { l: 'Wani AI menemukan pola baru', d: 'Ringkasan harian dari analisis pembelajaran', e: true, p: true, w: false },
    { l: 'Siswa berisiko tidak tuntas', d: 'Peringatan dini dari tren formatif', e: true, p: true, w: true },
    { l: 'Penilaian harian deadline', d: 'Pengingat 1 hari sebelum deadline', e: true, p: true, w: false },
    { l: 'Komentar kepsek pada jurnal', d: 'Saat kepsek meninggalkan catatan', e: true, p: false, w: false },
    { l: 'Sinkronisasi Dapodik selesai', d: 'Konfirmasi sinkronisasi data', e: false, p: true, w: false },
    { l: 'Pengumuman platform', d: 'Pembaruan fitur, maintenance', e: false, p: false, w: false },
  ];
  return (
    <div className="card">
      <div className="card-title"><h3>Preferensi notifikasi</h3><span className="sub">Pilih saluran &amp; frekuensi</span></div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Tipe notifikasi</th>
            <th style={{ textAlign: 'center', width: 80 }}>Email</th>
            <th style={{ textAlign: 'center', width: 80 }}>Push</th>
            <th style={{ textAlign: 'center', width: 80 }}>WhatsApp</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r, i) => (
            <tr key={i}>
              <td><div style={{ fontWeight: 600 }}>{r.l}</div><div className="tiny muted">{r.d}</div></td>
              {(['e', 'p', 'w'] as const).map(c => (
                <td key={c} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-block', width: 32, height: 18, borderRadius: 999, background: r[c] ? 'var(--color-primary)' : 'var(--color-surface-3)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 2, left: r[c] ? 16 : 2, width: 14, height: 14, borderRadius: 50, background: 'white' }} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: 14, background: 'var(--color-surface-2)', borderRadius: 10, marginTop: 16 }}>
        <div className="small mb-2" style={{ fontWeight: 600 }}>Jam tenang (Do Not Disturb)</div>
        <div className="flex gap-3 items-center">
          <span className="small">Dari</span>
          <input type="time" defaultValue="22:00" style={{ padding: 6, borderRadius: 6, border: '1px solid var(--color-line)' }} />
          <span className="small">sampai</span>
          <input type="time" defaultValue="06:00" style={{ padding: 6, borderRadius: 6, border: '1px solid var(--color-line)' }} />
        </div>
      </div>
    </div>
  );
}

function PreferensiTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="card-title"><h3>Tampilan</h3></div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center"><span className="small" style={{ fontWeight: 600 }}>Bahasa</span>
            <select style={{ padding: 8, borderRadius: 8, border: '1px solid var(--color-line)' }}><option>Bahasa Indonesia</option><option>English</option><option>Bahasa Jawa</option></select>
          </div>
          <div className="flex justify-between items-center"><span className="small" style={{ fontWeight: 600 }}>Mode warna</span>
            <div className="seg"><button className="seg-btn active">Terang</button><button className="seg-btn">Gelap</button><button className="seg-btn">Otomatis</button></div>
          </div>
          <div className="flex justify-between items-center"><span className="small" style={{ fontWeight: 600 }}>Awal minggu</span>
            <div className="seg"><button className="seg-btn active">Senin</button><button className="seg-btn">Minggu</button></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h3>Wani AI</h3><Pill kind="primary" dot>Beta</Pill></div>
        <div className="flex flex-col gap-3">
          {[
            { l: 'Aktifkan ringkasan harian', d: 'AI merangkum kelas Anda setiap pagi', on: true },
            { l: 'Saran rubrik otomatis', d: 'AI menyarankan rubrik saat membuat penilaian', on: true },
            { l: 'Voice-to-text untuk catatan', d: 'Transkripsi otomatis catatan suara', on: true },
            { l: 'Berbagi data anonim', d: 'Data siswa tidak pernah dibagikan', on: false },
          ].map(o => (
            <label key={o.l} className="flex justify-between items-center">
              <div><div className="small" style={{ fontWeight: 600 }}>{o.l}</div><div className="tiny muted">{o.d}</div></div>
              <div style={{ width: 36, height: 20, borderRadius: 999, background: o.on ? 'var(--color-good)' : 'var(--color-surface-3)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 2, left: o.on ? 18 : 2, width: 16, height: 16, borderRadius: 50, background: 'white' }} />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntegrasiTab() {
  return (
    <div className="card">
      <div className="card-title"><h3>Aplikasi terhubung</h3><button className="btn btn-primary"><Icon name="plus" size={13} /> Hubungkan baru</button></div>
      <div className="flex flex-col gap-3">
        {[
          { n: 'Dapodik', d: 'Sumber data master siswa & sekolah', s: 'good', last: '2 jam lalu' },
          { n: 'Quizizz', d: 'Impor otomatis nilai formatif', s: 'good', last: 'Hari ini 06.00' },
          { n: 'Google Classroom', d: 'Sinkron tugas & submisi', s: 'good', last: 'Kemarin' },
          { n: 'Google Forms', d: 'Asesmen kustom', s: 'warn', last: '—' },
          { n: 'Microsoft Teams for Edu', d: 'Pertemuan virtual & kelas', s: 'ink', last: 'Belum dihubungkan' },
          { n: 'Kahoot!', d: 'Game-based assessment', s: 'ink', last: 'Belum dihubungkan' },
        ].map((a, i) => (
          <div key={i} className="flex justify-between items-center" style={{ padding: 14, border: '1px solid var(--color-line)', borderRadius: 12 }}>
            <div className="flex gap-3 items-center">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-surface-2)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-display)', color: 'var(--color-ink-2)' }}>{a.n[0]}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.n}</div>
                <div className="tiny muted">{a.d} · {a.last}</div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {a.s === 'good' && <Pill kind="good" dot>Tersinkron</Pill>}
              {a.s === 'warn' && <Pill kind="warn" dot>Perlu otorisasi</Pill>}
              {a.s === 'ink' && <Pill kind="ink">Tersedia</Pill>}
              <button className="btn btn-outline">{a.s === 'ink' ? 'Hubungkan' : 'Kelola'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TagihanTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="card-title"><h3>Sekolah</h3></div>
        <div className="flex gap-4 items-center">
          <div style={{ width: 64, height: 64, borderRadius: 12, background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'grid', placeItems: 'center', color: 'white', fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>S1</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>SDN 1 Keputran Surabaya</div>
            <div className="tiny muted">NPSN: 20403108 · Akreditasi A · Surabaya, JATIM</div>
            <div className="flex gap-2" style={{ marginTop: 8 }}>
              <Pill kind="primary">156 siswa</Pill>
              <Pill kind="ink">24 guru</Pill>
              <Pill kind="accent">6 kelas</Pill>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h3>Paket berlangganan</h3><Pill kind="primary" dot>Aktif</Pill></div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { n: 'Dasar', p: 'Gratis', f: ['1 kelas', 'Jurnal & presensi', 'Laporan dasar'], cur: false },
            { n: 'Sekolah', p: 'Rp 12.000/siswa/bulan', f: ['Semua kelas', 'Wani AI ringkasan', 'Integrasi Dapodik', 'Bank soal kolaboratif'], cur: true },
            { n: 'Yayasan', p: 'Custom', f: ['Multi-sekolah', 'Dasbor pengawas', 'API & SSO kustom', 'Dukungan prioritas'], cur: false },
          ].map(p => (
            <div key={p.n} style={{
              padding: 16, border: p.cur ? '2px solid var(--color-primary)' : '1px solid var(--color-line)',
              borderRadius: 14, background: p.cur ? 'var(--color-primary-soft)' : 'var(--color-surface)', position: 'relative',
            }}>
              {p.cur && <div style={{ position: 'absolute', top: -10, left: 16, background: 'var(--color-primary)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>PAKET ANDA</div>}
              <div className="h-display" style={{ fontSize: 18, fontWeight: 600 }}>{p.n}</div>
              <div className="small muted mb-3">{p.p}</div>
              <ul style={{ paddingLeft: 16, fontSize: 12.5, lineHeight: 1.8, color: 'var(--color-ink-2)' }}>
                {p.f.map(x => <li key={x}>{x}</li>)}
              </ul>
              {!p.cur && <button className="btn btn-outline btn-block" style={{ marginTop: 12 }}>{p.n === 'Yayasan' ? 'Hubungi sales' : 'Pilih'}</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
