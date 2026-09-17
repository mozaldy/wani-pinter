import { intlLocale, type Locale } from './config';

export const interpolate = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

export const lookup = (map: Record<string, string>, key: string) => map[key] ?? key;

export const formatDate = (date: Date | string | number, locale: Locale, opts?: Intl.DateTimeFormatOptions) =>
  new Date(date).toLocaleDateString(intlLocale[locale], opts);

export const formatNumber = (n: number, locale: Locale, opts?: Intl.NumberFormatOptions) =>
  n.toLocaleString(intlLocale[locale], opts);
