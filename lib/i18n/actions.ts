'use server';
import { cookies } from 'next/headers';
import { refresh } from 'next/cache';
import { hasLocale, LOCALE_COOKIE, LOCALE_MAX_AGE } from './config';

export async function setLocale(locale: string) {
  if (!hasLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, { path: '/', maxAge: LOCALE_MAX_AGE, sameSite: 'lax' });
  refresh();
}
