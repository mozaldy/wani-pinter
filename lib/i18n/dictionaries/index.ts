import type { Locale } from '../config';
import { id, type Dictionary } from './id';
import { en } from './en';

export type { Dictionary };
export const dictionaries: Record<Locale, Dictionary> = { id, en };
