'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icon';

const ROLES = [
  { id: 'guru' as const, label: 'Guru', icon: 'users' as const },
  { id: 'kepsek' as const, label: 'Kepsek', icon: 'star' as const },
  { id: 'ortu' as const, label: 'Orang Tua', icon: 'parents' as const },
];

const CONTENT = {
  guru: {
    heading: 'Selamat datang kembali',
    sub: 'Masuk untuk melanjutkan ke dasbor pembelajaran Anda.',
    emailLabel: 'Email atau NIP',
    emailDefault: 'sari.rahmawati@sdn1keputran.sch.id',
    pwDefault: 'passwordpass',
    cta: 'Masuk ke dasbor',
    rightHeading: 'Setiap data adalah cerita seorang anak.',
    rightSub: 'Platform yang membantu guru Indonesia mengubah catatan harian menjadi keputusan pembelajaran yang lebih bijak — terhubung dengan Dapodik, Kurikulum Merdeka, dan rutinitas Anda.',
  },
  kepsek: {
    heading: 'Selamat datang kembali',
    sub: 'Masuk untuk melihat ringkasan sekolah Anda.',
    emailLabel: 'Email atau NIP',
    emailDefault: '',
    pwDefault: '',
    cta: 'Masuk ke dasbor',
    rightHeading: 'Pantau mutu pembelajaran seluruh kelas.',
    rightSub: 'Lihat data agregat kelas, tren kehadiran, dan capaian kurikulum lintas guru — semua dalam satu tampilan eksekutif.',
  },
  ortu: {
    heading: 'Pantau perkembangan anak',
    sub: 'Masuk sebagai Orang Tua / Wali untuk melihat laporan belajar anak Anda.',
    emailLabel: 'Email',
    emailDefault: '',
    pwDefault: '',
    cta: 'Masuk ke portal orang tua',
    rightHeading: 'Terhubung dengan perjalanan belajar anak Anda.',
    rightSub: 'Lihat nilai, kehadiran, progres kurikulum, dan catatan dari guru — semua dalam satu tempat.',
  },
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const hasError = searchParams.get('error') === '1';
  const [role, setRole] = useState<'guru' | 'kepsek' | 'ortu'>('guru');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const c = CONTENT[role];
  const isOrtu = role === 'ortu';

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1.1fr' }}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '40px 56px', background: 'var(--color-surface)' }}>
        <div className="flex gap-3 items-center">
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'grid', placeItems: 'center', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, boxShadow: '0 4px 16px color-mix(in oklab, var(--color-primary) 30%, transparent)' }}>w</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20 }}>wani·pinter</div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>SDN 1 Keputran Surabaya</div>
          </div>
        </div>

        <div style={{ maxWidth: 380, width: '100%', margin: 'auto', padding: '40px 0' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{c.heading}</h1>
          <div style={{ color: 'var(--color-ink-3)', fontSize: 14, marginBottom: 28 }}>{c.sub}</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, background: 'var(--color-surface-2)', padding: 4, borderRadius: 12, marginBottom: 24 }}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)} style={{
                padding: 10, borderRadius: 9, fontSize: 12.5, fontWeight: 600,
                color: role === r.id ? 'var(--color-primary)' : 'var(--color-ink-3)',
                background: role === r.id ? 'var(--color-surface)' : 'transparent',
                boxShadow: role === r.id ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <Icon name={r.icon} size={18} />
                {r.label}
              </button>
            ))}
          </div>

          {/* Orang tua: native form POST to API route */}
          {isOrtu ? (
            <form action="/orang-tua/api/login" method="post" onSubmit={() => setLoading(true)}>
              <div className="field">
                <label className="field-label">{c.emailLabel}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Icon name="message" size={16} style={{ position: 'absolute', left: 12, color: 'var(--color-ink-4)', pointerEvents: 'none' }} />
                  <input name="email" type="email" required style={{ width: '100%', paddingLeft: 38 }} placeholder="email@example.com" />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Kata sandi</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Icon name="settings" size={16} style={{ position: 'absolute', left: 12, color: 'var(--color-ink-4)', pointerEvents: 'none' }} />
                  <input name="password" type={showPw ? 'text' : 'password'} required style={{ width: '100%', paddingLeft: 38, paddingRight: 60 }} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 8, padding: '4px 8px', fontSize: 11, color: 'var(--color-ink-3)', borderRadius: 6 }}>
                    {showPw ? 'Sembunyi' : 'Lihat'}
                  </button>
                </div>
              </div>
              {hasError && (
                <div style={{ fontSize: 12.5, color: 'var(--color-bad)', marginBottom: 12 }}>
                  Email atau kata sandi salah. Coba lagi.
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? 'Memuat...' : c.cta}
              </button>
            </form>
          ) : (
            <form action="/api/auth/login" method="post" onSubmit={() => setLoading(true)}>
              <div className="field">
                <label className="field-label">{c.emailLabel}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Icon name="message" size={16} style={{ position: 'absolute', left: 12, color: 'var(--color-ink-4)', pointerEvents: 'none' }} />
                  <input name="email" type="email" required style={{ width: '100%', paddingLeft: 38 }} defaultValue={c.emailDefault} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Kata sandi</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Icon name="settings" size={16} style={{ position: 'absolute', left: 12, color: 'var(--color-ink-4)', pointerEvents: 'none' }} />
                  <input name="password" type={showPw ? 'text' : 'password'} required style={{ width: '100%', paddingLeft: 38, paddingRight: 60 }} defaultValue={c.pwDefault} />
                  <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 8, padding: '4px 8px', fontSize: 11, color: 'var(--color-ink-3)', borderRadius: 6 }}>
                    {showPw ? 'Sembunyi' : 'Lihat'}
                  </button>
                </div>
              </div>
              {hasError && (
                <div style={{ fontSize: 12.5, color: 'var(--color-bad)', marginBottom: 12 }}>
                  Email atau kata sandi salah. Coba lagi.
                </div>
              )}
              <div className="flex justify-between items-center" style={{ margin: '12px 0 20px', fontSize: 12.5 }}>
                <label className="flex gap-1 small items-center"><input type="checkbox" defaultChecked /> Ingat saya</label>
                <a href="#" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Lupa kata sandi?</a>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Memuat...' : c.cta}
              </button>
            </form>
          )}

          {!isOrtu && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px', color: 'var(--color-ink-4)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span style={{ flex: 1, height: 1, background: 'var(--color-line)' }} />
                atau lanjutkan dengan
                <span style={{ flex: 1, height: 1, background: 'var(--color-line)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button className="btn btn-outline" style={{ justifyContent: 'center', padding: 10 }}>Google for Education</button>
                <button className="btn btn-outline" style={{ justifyContent: 'center', padding: 10 }}>SSO Dapodik</button>
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-ink-3)', marginTop: 28 }}>
            Belum punya akun? Hubungi <strong>admin sekolah Anda</strong>.<br />
            <span style={{ marginTop: 8, display: 'inline-block' }}>© 2026 WANI-PINTER · v3.4.0</span>
          </div>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
        color: 'white', padding: '48px 56px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.12), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08), transparent 50%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
          {!isOrtu && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 999,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24,
            }}>
              <Icon name="sparkle" size={12} />
              Wani AI · Diperbarui April 2026
            </div>
          )}
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 38, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
            {c.rightHeading}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.85 }}>
            {c.rightSub}
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isOrtu ? (
            <>
              {[
                { icon: 'star' as const, label: 'Nilai & Rerata', desc: 'Pantau hasil belajar per mata pelajaran' },
                { icon: 'activity' as const, label: 'Kehadiran', desc: 'Rekap kehadiran semester berjalan' },
                { icon: 'target' as const, label: 'Capaian Pembelajaran', desc: 'Progres penguasaan CP Kurikulum Merdeka' },
                { icon: 'book' as const, label: 'Catatan Guru', desc: 'Pesan dan observasi langsung dari wali kelas' },
              ].map(f => (
                <div key={f.label} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name={f.icon} size={17} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{f.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="sparkle" size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Wani AI menemukan pola</div>
                  <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.5 }}>
                    "3 siswa di kelas VIII-A menunjukkan penurunan konsisten pada Sistem Persamaan Linear. Pertimbangkan sesi peer-learning."
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                {[
                  { v: '2.847', l: 'Sekolah aktif' },
                  { v: '68rb+', l: 'Guru pengguna' },
                  { v: '2.1jt', l: 'Siswa terdata' },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 32, letterSpacing: '-0.02em' }}>{s.v}</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
