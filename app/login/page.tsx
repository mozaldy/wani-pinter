'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'guru' | 'kepsek' | 'ortu'>('guru');
  const [showPw, setShowPw] = useState(false);

  const onSubmit = (e: FormEvent) => { e.preventDefault(); router.push('/dashboard'); };

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
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Selamat datang kembali</h1>
          <div style={{ color: 'var(--color-ink-3)', fontSize: 14, marginBottom: 28 }}>Masuk untuk melanjutkan ke dasbor pembelajaran Anda.</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, background: 'var(--color-surface-2)', padding: 4, borderRadius: 12, marginBottom: 24 }}>
            {([
              { id: 'guru' as const, label: 'Guru', icon: 'users' as const },
              { id: 'kepsek' as const, label: 'Kepsek', icon: 'star' as const },
              { id: 'ortu' as const, label: 'Orang Tua', icon: 'parents' as const },
            ]).map(r => (
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

          <form onSubmit={onSubmit}>
            <div className="field">
              <label className="field-label">Email atau NIP</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icon name="message" size={16} style={{ position: 'absolute', left: 12, color: 'var(--color-ink-4)', pointerEvents: 'none' }} />
                <input style={{ width: '100%', paddingLeft: 38 }} defaultValue="sari.rahmawati@sdn1keputran.sch.id" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Kata sandi</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icon name="settings" size={16} style={{ position: 'absolute', left: 12, color: 'var(--color-ink-4)', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} style={{ width: '100%', paddingLeft: 38, paddingRight: 60 }} defaultValue="passwordpass" />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 8, padding: '4px 8px', fontSize: 11, color: 'var(--color-ink-3)', borderRadius: 6 }}>
                  {showPw ? 'Sembunyi' : 'Lihat'}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center" style={{ margin: '12px 0 20px', fontSize: 12.5 }}>
              <label className="flex gap-1 small items-center"><input type="checkbox" defaultChecked /> Ingat saya</label>
              <a href="#" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Lupa kata sandi?</a>
            </div>

            <button type="submit" className="btn btn-primary btn-block">Masuk ke dasbor</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px', color: 'var(--color-ink-4)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--color-line)' }} />
            atau lanjutkan dengan
            <span style={{ flex: 1, height: 1, background: 'var(--color-line)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button className="btn btn-outline" style={{ justifyContent: 'center', padding: 10 }}>Google for Education</button>
            <button className="btn btn-outline" style={{ justifyContent: 'center', padding: 10 }}>SSO Dapodik</button>
          </div>

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
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24,
          }}>
            <Icon name="sparkle" size={12} />
            Wani AI · Diperbarui April 2026
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 38, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
            Setiap data adalah cerita seorang anak.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.85 }}>
            Platform yang membantu guru Indonesia mengubah catatan harian menjadi keputusan pembelajaran yang lebih bijak — terhubung dengan Dapodik, Kurikulum Merdeka, dan rutinitas Anda.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
        </div>
      </div>
    </div>
  );
}
