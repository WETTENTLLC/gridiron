import * as jose from "jose";
import * as crypto from "crypto";
import * as cookie from "cookie";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

const JWT_ALG = "HS256";
const SESSION_COOKIE = "gid_session";
const SESSION_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

// ── Password hashing (using built-in crypto, no bcrypt dependency) ──

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(attempt));
}

// ── JWT session ─────────────────────────────────────────────────

async function signSession(userId: number, email: string): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT({ userId, email })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("1 year")
    .sign(secret);
}

async function verifySession(
  token: string,
): Promise<{ userId: number; email: string } | null> {
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    if (!payload.userId || !payload.email) return null;
    return { userId: payload.userId as number, email: payload.email as string };
  } catch {
    return null;
  }
}

// ── Auth from request ───────────────────────────────────────────

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[SESSION_COOKIE];
  if (!token) return undefined;

  const claim = await verifySession(token);
  if (!claim) return undefined;

  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, claim.userId))
    .limit(1);

  return rows[0] ?? undefined;
}

// ── Signup / Login ──────────────────────────────────────────────

export async function signup(email: string, password: string, name?: string) {
  const db = getDb();

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing[0]) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = hashPassword(password);
  const isOwner = env.ownerEmail && email === env.ownerEmail;

  await db.insert(users).values({
    email,
    passwordHash,
    name: name ?? email.split("@")[0],
    role: isOwner ? "admin" : "user",
  });

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = rows[0]!;

  const token = await signSession(user.id, user.email);
  return { user, token };
}

export async function login(email: string, password: string) {
  const db = getDb();

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid email or password");
  }

  await db
    .update(users)
    .set({ lastSignInAt: new Date() })
    .where(eq(users.id, user.id));

  const token = await signSession(user.id, user.email);
  return { user, token };
}

export { SESSION_COOKIE, SESSION_MAX_AGE, hashPassword, verifyPassword };
