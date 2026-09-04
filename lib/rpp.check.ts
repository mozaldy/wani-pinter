// Live contract check against Gemini: run with `pnpm rpp:check`.
// Fails loudly if a prompt or a response schema drifts.
import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import assert from 'node:assert/strict';
import { generateJson } from './gemini';
import {
  SKELETON_SCHEMA, PERTEMUAN_SCHEMA, sectionSchema,
  skeletonPrompt, pertemuanPrompt, refinePrompt, emptyPertemuan,
  type Rpp, type Pertemuan, type RppInput,
} from './rpp';

const JUMLAH = 4;

const input: RppInput = {
  satuan: 'SDN Ceria Bahagia', mapel: 'Matematika', fase: 'A', kelas: 'I',
  semester: 'Ganjil', topik: 'Penjumlahan dan pengurangan sampai 20',
  jumlahPertemuan: JUMLAH, alokasi: '2 x 35 menit per pertemuan',
  kondisiKelas: '23 murid; 10 cepat, 9 menengah, 4 butuh pendampingan intensif.',
};

const nonEmpty = (v: unknown) => typeof v === 'string' ? v.trim().length > 0 : Array.isArray(v) ? v.length > 0 : !!v;

async function main() {
  console.log('1/3 skeleton…');
  const skeleton = await generateJson<Omit<Rpp, 'pertemuan'>>(skeletonPrompt(input), SKELETON_SCHEMA);

  for (const k of Object.keys(SKELETON_SCHEMA.properties) as (keyof typeof skeleton)[]) {
    assert.ok(nonEmpty(skeleton[k]), `skeleton.${String(k)} kosong`);
  }
  assert.equal(skeleton.rutePertemuan.length, JUMLAH, 'jumlah rute pertemuan tidak sesuai permintaan');
  assert.deepEqual(skeleton.rutePertemuan.map(r => r.no), [1, 2, 3, 4], 'penomoran rute tidak berurutan');
  assert.ok(skeleton.indikator.length >= 3, 'indikator kurang dari 3');
  // Butir instrumen 11: alur belajar harus memuat alokasi waktu tiap pertemuan.
  assert.ok(skeleton.rutePertemuan.every(r => nonEmpty(r.alokasi)), 'ada pertemuan tanpa alokasi waktu');
  // Butir instrumen 13.4: rencana tindak lanjut wajib ada.
  assert.ok(skeleton.rencanaTindakLanjut.length >= 2, 'rencana tindak lanjut kurang dari 2 butir');
  assert.equal(emptyPertemuan(skeleton.rutePertemuan).length, JUMLAH);

  const rpp: Rpp = { ...skeleton, pertemuan: emptyPertemuan(skeleton.rutePertemuan) };

  console.log('2/3 pertemuan 1…');
  const p = await generateJson<Pertemuan>(pertemuanPrompt(rpp, 1), PERTEMUAN_SCHEMA);
  assert.ok(p.langkah.length >= 5, `langkah hanya ${p.langkah.length}, minimal 5`);
  assert.ok(p.asesmen, 'asesmen formatif tidak dihasilkan');
  assert.ok(p.asesmen!.rubrik.length >= 2, 'rubrik kurang dari 2 aspek');
  assert.ok(nonEmpty(p.media), 'media kosong');
  assert.ok(p.prinsip.length > 0, 'prinsip pembelajaran tidak ditulis eksplisit');
  assert.ok(nonEmpty(p.pengalamanBelajar), 'pengalaman belajar kosong');

  console.log('3/3 refine satu bagian…');
  const { value } = await generateJson<{ value: string[] }>(
    refinePrompt(rpp, 'indikator', rpp.indikator, 'buat lebih spesifik dan terukur'),
    sectionSchema('indikator'),
  );
  assert.ok(Array.isArray(value) && value.length >= 3, 'refine indikator tidak mengembalikan daftar');

  console.log(`\nOK — "${skeleton.identitas.judul}"`);
  console.log(`   ${skeleton.rutePertemuan.length} pertemuan, ${skeleton.indikator.length} indikator, ${p.langkah.length} langkah di P1`);
}

main().catch(e => { console.error('\nGAGAL:', e.message); process.exit(1); });
