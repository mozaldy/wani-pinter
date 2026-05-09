DROP TABLE IF EXISTS recent_activity, ai_insights, kehadiran_minggu, jadwal_hari_ini, cp_list, mapel, students CASCADE;

CREATE TABLE students (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  nis TEXT NOT NULL,
  kelas TEXT NOT NULL,
  jk CHAR(1) NOT NULL,
  avatar_color TEXT NOT NULL,
  rerata INT NOT NULL,
  kehadiran INT NOT NULL,
  risiko TEXT NOT NULL,
  ortu TEXT NOT NULL,
  alamat TEXT NOT NULL,
  cp_matematika INT NOT NULL,
  cp_ipa INT NOT NULL,
  cp_ips INT NOT NULL,
  cp_bind INT NOT NULL,
  cp_bing INT NOT NULL,
  cp_pjok INT NOT NULL
);

CREATE TABLE mapel (
  kode TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  ord INT NOT NULL
);

CREATE TABLE cp_list (
  kode TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  tp_count INT NOT NULL,
  mastered INT NOT NULL,
  ord INT NOT NULL
);

CREATE TABLE jadwal_hari_ini (
  id SERIAL PRIMARY KEY,
  waktu TEXT NOT NULL,
  mapel TEXT NOT NULL,
  kelas TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL,
  ruang TEXT NOT NULL,
  ord INT NOT NULL
);

CREATE TABLE kehadiran_minggu (
  hari TEXT PRIMARY KEY,
  hadir INT NOT NULL,
  izin INT NOT NULL,
  sakit INT NOT NULL,
  alpa INT NOT NULL,
  ord INT NOT NULL
);

CREATE TABLE ai_insights (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action TEXT NOT NULL,
  ord INT NOT NULL
);

CREATE TABLE recent_activity (
  id SERIAL PRIMARY KEY,
  time_label TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ord INT NOT NULL
);
