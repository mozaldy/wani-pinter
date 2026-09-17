'use client';
import { useTransition } from 'react';
import { locales } from '@/lib/i18n/config';
import { setLocale } from '@/lib/i18n/actions';
import { useI18n } from '@/lib/i18n/I18nProvider';

export function LanguageSwitcher() {
  const { locale, dict } = useI18n();
  const [pending, startTransition] = useTransition();
  return (
    <div className="seg" role="group" aria-label={dict.locale.label} style={{ opacity: pending ? 0.6 : 1 }}>
      {locales.map(l => (
        <button
          key={l}
          type="button"
          className={`seg-btn ${l === locale ? 'active' : ''}`}
          aria-pressed={l === locale}
          title={dict.locale[l]}
          disabled={pending}
          onClick={() => l !== locale && startTransition(() => setLocale(l))}
        >
          {dict.locale.short[l]}
        </button>
      ))}
    </div>
  );
}
