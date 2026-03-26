import { NextResponse } from "next/server";
import { query, ensureTaleplerTable } from "@/lib/db";

type CiroRow = {
  id: string;
  created_at: string;
  ad_soyad: string;
  kapatici_kim: string;
  talep_edilen_tutar: string;
  durum: string;
  para_kime_gitti: string;
  aciklama: string;
};

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date || !isValidDate(date)) {
      return NextResponse.json(
        { error: "Geçerli bir tarih seçiniz (YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    await ensureTaleplerTable();

    const { rows } = await query<CiroRow>(
      `SELECT
        id,
        created_at,
        ad_soyad,
        kapatici_kim,
        talep_edilen_tutar,
        durum,
        para_kime_gitti,
        aciklama
       FROM talepler
       WHERE DATE(created_at AT TIME ZONE 'Europe/Istanbul') = $1
       ORDER BY created_at DESC`,
      [date]
    );

    return NextResponse.json({ rows });
  } catch (err) {
    console.error("ciro GET:", err);
    return NextResponse.json(
      { error: "Ciro verileri alınırken hata oluştu." },
      { status: 500 }
    );
  }
}

