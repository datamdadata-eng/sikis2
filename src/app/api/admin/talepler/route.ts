import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { query, ensureTaleplerTable } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    await ensureTaleplerTable();
    const { rows } = await query<{
      id: string;
      tc_kimlik_no: string;
      ad_soyad: string;
      email: string;
      siparis_no: string;
      talep_edilen_tutar: string;
      para_birimi: string;
      referans_tipi: string;
      iade_banka: string;
      para_kime_gitti: string;
      acici_kim: string;
      kapatici_kim: string;
      aciklama: string;
      durum: string;
      created_at: string;
    }>(
      `SELECT id, tc_kimlik_no, ad_soyad, email, siparis_no, talep_edilen_tutar,
              para_birimi, referans_tipi, iade_banka, para_kime_gitti, acici_kim,
              kapatici_kim, aciklama, durum, created_at
       FROM talepler
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ talepler: rows });
  } catch (err) {
    console.error("admin talepler GET:", err);
    return NextResponse.json(
      { error: "Liste alınamadı." },
      { status: 500 }
    );
  }
}
