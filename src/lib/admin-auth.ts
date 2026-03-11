import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin_session";

export async function isAdmin(): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  return session === "1";
}

export async function requireAdmin(): Promise<{ ok: false } | { ok: true }> {
  const ok = await isAdmin();
  if (!ok) return { ok: false };
  return { ok: true };
}
