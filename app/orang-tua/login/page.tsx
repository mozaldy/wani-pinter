'use client';
import { useState, Suspense, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icon';

function ParentLoginContent() {
  const searchParams = useSearchParams();
  const hasError = searchParams.get('error') === '1';
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (_e: FormEvent<HTMLFormElement>) => {
    setLoading(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left: form */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '40px 56px', background: 'var(--color-surface)' }}>
        <div className="flex gap-3 items-center">
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'grid', placeItems: 'center', color: 'white',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
            boxShadow: '0 4px 16px color-mix(in oklab, var(--color-primary) 30%, transparent)',
          }}>w</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20 }}>wani·pinter</div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Portal Orang Tua</div>
          </div>
        </div>

        <div style={{ maxWidth: 380, width: '100%', margin: 'auto', padding: '40px 0' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            Pantau perkembangan anak
          </h1>
          <div style={{ color: 'var(--color-ink-3)', fontSize: 14, marginBottom: 28 }}>
            Masuk sebagai Orang Tua / Wali untuk melihat laporan belajar anak Anda.
          </div>

          <form action="/orang-tua/api/login" method="post" onSubmit={onSubmit}>
            <div className="field">
              <label className="field-label">Email</label>
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

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Memuat...' : 'Masuk'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-ink-3)', marginTop: 28 }}>
            Belum punya akun? Hubungi <strong>admin sekolah Anda</strong>.<br />
            <a href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-block', marginTop: 8 }}>
              ← Masuk sebagai Guru
            </a>
          </div>
        </div>
      </div>

      {/* Right: info panel */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
        color: 'white', padding: '48px 56px', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', position: 'relative', overflow: 'hidden', gap: 32,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.12), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08), transparent 50%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 34, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Terhubung dengan perjalanan belajar anak Anda.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.85 }}>
            Lihat nilai, kehadiran, progres kurikulum, dan catatan dari guru — semua dalam satu tempat.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: 'star' as const, label: 'Nilai & Rerata', desc: 'Pantau hasil belajar per mata pelajaran' },
            { icon: 'activity' as const, label: 'Kehadiran', desc: 'Rekap kehadiran semester berjalan' },
            { icon: 'target' as const, label: 'Capaian Pembelajaran', desc: 'Progres penguasaan CP Kurikulum Merdeka' },
            { icon: 'book' as const, label: 'Catatan Guru', desc: 'Pesan dan observasi langsung dari wali kelas' },
          ].map(f => (
            <div key={f.label} style={{
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 16px',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name={f.icon} size={17} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{f.label}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ParentLoginPage() {
  return (
    <Suspense>
      <ParentLoginContent />
    </Suspense>
  );
}
