import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";

export async function GET() {
  const ok = await isAdmin();
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
