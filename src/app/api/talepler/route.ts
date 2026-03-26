import { NextResponse } from "next/server";
import { query, ensureTaleplerTable } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tcKimlikNo,
      adSoyad,
      email,
      siparisNo,
      talepEdilenTutar,
      paraBirimi,
      referansTipi,
      iadeBanka,
      paraKimeGitti,
      aciciKim,
      kapaticiKim,
      aciklama,
    } = body;

    if (
      !tcKimlikNo ||
      !adSoyad ||
      !email ||
      !siparisNo ||
      talepEdilenTutar == null ||
      !paraBirimi ||
      !referansTipi ||
      !iadeBanka ||
      !paraKimeGitti ||
      !aciciKim ||
      !kapaticiKim ||
      !aciklama
    ) {
      return NextResponse.json(
        { error: "Eksik alan var." },
        { status: 400 }
      );
    }

    const tc = String(tcKimlikNo).replace(/\D/g, "");
    if (tc.length !== 11) {
      return NextResponse.json(
        { error: "TC Kimlik No 11 haneli olmalıdır." },
        { status: 400 }
      );
    }

    await ensureTaleplerTable();

    await query(
      `INSERT INTO talepler (
        tc_kimlik_no, ad_soyad, email, siparis_no, talep_edilen_tutar,
        para_birimi, referans_tipi, iade_banka, para_kime_gitti, acici_kim,
        kapatici_kim, aciklama, durum
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Beklemede')`,
      [
        tc,
        String(adSoyad).trim(),
        String(email).trim(),
        String(siparisNo),
        String(talepEdilenTutar),
        String(paraBirimi) || "TL",
        String(referansTipi),
        String(iadeBanka),
        String(paraKimeGitti).trim(),
        String(aciciKim).trim(),
        String(kapaticiKim).trim(),
        String(aciklama).trim(),
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("talepler POST:", err);
    return NextResponse.json(
      { error: "Kayıt sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
