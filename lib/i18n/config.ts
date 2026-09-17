export const locales = ['id', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'id';
export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

export const intlLocale: Record<Locale, string> = { id: 'id-ID', en: 'en-US' };

export const hasLocale = (v: string | undefined | null): v is Locale =>
  !!v && (locales as readonly string[]).includes(v);

// Picks the highest-q supported language from an Accept-Language header.
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map(p => p.trim()).find(p => p.startsWith('q='));
      return { lang: tag.split('-')[0].toLowerCase(), q: q ? Number(q.slice(2)) || 0 : 1, i };
    })
    .sort((a, b) => b.q - a.q || a.i - b.i);
  return ranked.find(r => hasLocale(r.lang))?.lang as Locale ?? defaultLocale;
}
