import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin_session";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin şifresi tanımlı değil (ADMIN_PASSWORD)." },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Şifre hatalı." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 saat
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "İstek işlenemedi." },
      { status: 500 }
    );
  }
}
