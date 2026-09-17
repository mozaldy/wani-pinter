import 'server-only';
import { cookies, headers } from 'next/headers';
import { hasLocale, negotiateLocale, LOCALE_COOKIE, type Locale } from './config';
import { dictionaries, type Dictionary } from './dictionaries';

export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (hasLocale(fromCookie)) return fromCookie;
  return negotiateLocale((await headers()).get('accept-language'));
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  return dictionaries[locale ?? (await getLocale())];
}
