import { SignJWT, jwtVerify } from 'jose';
import { sql } from './db';

const TTL = 60 * 60 * 24 * 7; // 7 days

// ─── Parent auth ───────────────────────────────────────────────────────────

const PARENT_SECRET = new TextEncoder().encode(process.env.PARENT_JWT_SECRET!);
export const PARENT_COOKIE = 'parent_session';

export type ParentJWTPayload = { parentId: string; nama: string };

export async function signParentToken(parentId: string, nama: string): Promise<string> {
  return new SignJWT({ parentId, nama })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL}s`)
    .sign(PARENT_SECRET);
}

export async function verifyParentToken(token: string): Promise<ParentJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, PARENT_SECRET);
    return payload as unknown as ParentJWTPayload;
  } catch {
    return null;
  }
}

export async function getParentByEmail(email: string): Promise<{ id: string; pw_hash: string; nama: string } | null> {
  const rows = await sql`SELECT id, pw_hash, nama FROM parents WHERE email = ${email}`;
  return (rows[0] as { id: string; pw_hash: string; nama: string }) || null;
}

// ─── Teacher auth ──────────────────────────────────────────────────────────

const TEACHER_SECRET = new TextEncoder().encode(process.env.TEACHER_JWT_SECRET!);
export const TEACHER_COOKIE = 'teacher_session';

export type TeacherJWTPayload = {
  userId: string;
  nama: string;
  initials: string;
  role: string;
  jabatan: string;
};

export async function signTeacherToken(payload: TeacherJWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL}s`)
    .sign(TEACHER_SECRET);
}

export async function verifyTeacherToken(token: string): Promise<TeacherJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, TEACHER_SECRET);
    return payload as unknown as TeacherJWTPayload;
  } catch {
    return null;
  }
}

export async function getTeacherByEmail(email: string): Promise<{ id: string; pw_hash: string; nama: string; initials: string; role: string; jabatan: string } | null> {
  const rows = await sql`SELECT id, pw_hash, nama, initials, role, jabatan FROM users WHERE email = ${email}`;
  return (rows[0] as { id: string; pw_hash: string; nama: string; initials: string; role: string; jabatan: string }) || null;
}
