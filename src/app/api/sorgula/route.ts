import { NextResponse } from "next/server";
import { query, ensureTaleplerTable } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tc = searchParams.get("tc")?.replace(/\D/g, "") ?? "";

    if (tc.length !== 11) {
      return NextResponse.json(
        { error: "TC Kimlik No 11 haneli olmalıdır." },
        { status: 400 }
      );
    }

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
      aciklama: string;
      durum: string;
      created_at: string;
    }>(
      `SELECT id, tc_kimlik_no, ad_soyad, email, siparis_no, talep_edilen_tutar,
              para_birimi, referans_tipi, iade_banka, aciklama, durum, created_at
       FROM talepler
       WHERE tc_kimlik_no = $1
       ORDER BY created_at DESC`,
      [tc]
    );

    const talepler = rows.map((r) => ({
      id: r.id,
      tcKimlikNo: r.tc_kimlik_no,
      adSoyad: r.ad_soyad,
      email: r.email,
      siparisNo: r.siparis_no,
      talepEdilenTutar: r.talep_edilen_tutar,
      paraBirimi: r.para_birimi,
      referansTipi: r.referans_tipi,
      iadeBanka: r.iade_banka,
      aciklama: r.aciklama,
      durum: r.durum,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ talepler });
  } catch (err) {
    console.error("sorgula GET:", err);
    return NextResponse.json(
      { error: "Sorgu sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
