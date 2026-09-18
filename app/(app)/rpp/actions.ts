'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireTeacher } from '@/lib/auth';
import {
  isSectionKey, emptyPertemuan,
  type Rpp, type Pertemuan,
} from '@/lib/rpp';
import { getRpp, updateRppContent, deleteRppRow } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';

// ponytail: read-modify-write of the whole JSONB document, last write wins.
// Add optimistic concurrency on updated_at if one RPP is ever edited from two tabs.
export async function loadOwned(id: string) {
  const user = await requireTeacher();
  const row = await getRpp(id, user.userId);
  if (!row) throw new Error((await getDictionary()).errors.rppNotFound);
  return { user, row };
}

export async function saveSection(id: string, key: string, value: unknown) {
  if (!isSectionKey(key)) throw new Error(interpolate((await getDictionary()).errors.bagianTidakDikenal, { key }));
  const { user, row } = await loadOwned(id);
  const next = { ...row.content, [key]: value } as Rpp;

  if (key === 'rutePertemuan') {
    next.pertemuan = next.rutePertemuan.map(r =>
      row.content.pertemuan.find(p => p.no === r.no) ?? emptyPertemuan([r])[0]);
  }

  await updateRppContent(id, user.userId, next);
  revalidatePath(`/rpp/${id}`);
}

export async function savePertemuan(id: string, no: number, patch: Partial<Pertemuan>) {
  const { user, row } = await loadOwned(id);
  const content = row.content;
  const i = content.pertemuan.findIndex(p => p.no === no);
  if (i === -1) throw new Error(interpolate((await getDictionary()).errors.pertemuanTidakAda, { no }));
  content.pertemuan[i] = { ...content.pertemuan[i], ...patch, no };

  await updateRppContent(id, user.userId, content);
  revalidatePath(`/rpp/${id}`);
}

export async function deleteRpp(id: string) {
  const user = await requireTeacher();
  await deleteRppRow(id, user.userId);
  revalidatePath('/rpp');
  redirect('/rpp');
}
