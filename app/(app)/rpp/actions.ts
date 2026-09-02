'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireTeacher } from '@/lib/auth';
import { generateJson } from '@/lib/gemini';
import {
  SKELETON_SCHEMA, PERTEMUAN_SCHEMA, sectionSchema, isSectionKey,
  skeletonPrompt, pertemuanPrompt, refinePrompt, emptyPertemuan,
  type Rpp, type Pertemuan, type RppInput, type SectionKey,
} from '@/lib/rpp';
import { getRpp, insertRpp, updateRppContent, deleteRppRow } from '@/lib/queries';

// ponytail: read-modify-write of the whole JSONB document, last write wins.
// Add optimistic concurrency on updated_at if one RPP is ever edited from two tabs.
async function loadOwned(id: string) {
  const user = await requireTeacher();
  const row = await getRpp(id, user.userId);
  if (!row) throw new Error('Modul ajar tidak ditemukan');
  return { user, row };
}

/** Returns an error message, or redirects on success (useActionState). */
export async function createRpp(_prev: string | null, formData: FormData): Promise<string | null> {
  const user = await requireTeacher();

  const jumlah = Math.min(20, Math.max(1, Number(formData.get('jumlahPertemuan')) || 1));
  const input: RppInput = {
    satuan: String(formData.get('satuan') || '').trim(),
    mapel: String(formData.get('mapel') || '').trim(),
    fase: String(formData.get('fase') || '').trim(),
    kelas: String(formData.get('kelas') || '').trim(),
    semester: String(formData.get('semester') || '').trim(),
    topik: String(formData.get('topik') || '').trim(),
    alokasi: String(formData.get('alokasi') || '').trim(),
    kondisiKelas: String(formData.get('kondisiKelas') || '').trim(),
    jumlahPertemuan: jumlah,
  };
  if (!input.mapel || !input.topik) return 'Mata pelajaran dan topik wajib diisi';

  let id: string;
  try {
    const skeleton = await generateJson<Omit<Rpp, 'pertemuan'>>(skeletonPrompt(input), SKELETON_SCHEMA);
    const content: Rpp = { ...skeleton, pertemuan: emptyPertemuan(skeleton.rutePertemuan) };
    id = await insertRpp(user.userId, {
      judul: content.identitas.judul,
      mapel: content.identitas.mapel,
      kelas: content.identitas.kelas,
    }, content);
  } catch (e) {
    return e instanceof Error ? e.message : 'Gagal menyusun modul ajar';
  }

  revalidatePath('/rpp');
  redirect(`/rpp/${id}`);  // redirect() throws, so it must sit outside the try
}

export async function generatePertemuan(id: string, no: number) {
  const { user, row } = await loadOwned(id);
  const content = row.content;

  const hasil = await generateJson<Pertemuan>(pertemuanPrompt(content, no), PERTEMUAN_SCHEMA);
  const i = content.pertemuan.findIndex(p => p.no === no);
  if (i === -1) throw new Error(`Pertemuan ${no} tidak ada dalam rute`);
  content.pertemuan[i] = { ...hasil, no };

  await updateRppContent(id, user.userId, content);
  revalidatePath(`/rpp/${id}`);
}

export async function refineSection(id: string, key: string, instruction: string) {
  if (!isSectionKey(key)) throw new Error(`Bagian tidak dikenal: ${key}`);
  if (!instruction.trim()) throw new Error('Tulis dulu perubahan yang Anda inginkan');
  const { user, row } = await loadOwned(id);
  const content = row.content;

  const { value } = await generateJson<{ value: Rpp[SectionKey] }>(
    refinePrompt(content, key, content[key], instruction),
    sectionSchema(key),
  );
  const next = { ...content, [key]: value } as Rpp;

  // Rute rows drive the pertemuan slots — keep the two in step after a refine.
  if (key === 'rutePertemuan') {
    next.pertemuan = next.rutePertemuan.map(r =>
      content.pertemuan.find(p => p.no === r.no) ?? emptyPertemuan([r])[0]);
  }

  await updateRppContent(id, user.userId, next);
  revalidatePath(`/rpp/${id}`);
}

export async function saveSection(id: string, key: string, value: unknown) {
  if (!isSectionKey(key)) throw new Error(`Bagian tidak dikenal: ${key}`);
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
  if (i === -1) throw new Error(`Pertemuan ${no} tidak ada dalam rute`);
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
