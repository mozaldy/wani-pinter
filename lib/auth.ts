import { SignJWT, jwtVerify } from 'jose';
import { sql } from './db';

const SECRET = new TextEncoder().encode(process.env.PARENT_JWT_SECRET!);
const COOKIE = 'parent_session';
const TTL = 60 * 60 * 24 * 7; // 7 days

export type ParentJWTPayload = {
  parentId: string;
  nama: string;
};

export async function signParentToken(parentId: string, nama: string): Promise<string> {
  return new SignJWT({ parentId, nama })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL}s`)
    .sign(SECRET);
}

export async function verifyParentToken(token: string): Promise<ParentJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as ParentJWTPayload;
  } catch {
    return null;
  }
}

export const PARENT_COOKIE = COOKIE;

export async function getParentByEmail(email: string): Promise<{ id: string; pw_hash: string; nama: string } | null> {
  const rows = await sql`SELECT id, pw_hash, nama FROM parents WHERE email = ${email}`;
  return (rows[0] as { id: string; pw_hash: string; nama: string }) || null;
}
