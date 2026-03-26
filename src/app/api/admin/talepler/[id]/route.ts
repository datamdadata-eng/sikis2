import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { query } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Geçersiz id." }, { status: 400 });
  }

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
      durum,
    } = body;

    const tc = String(tcKimlikNo ?? "").replace(/\D/g, "");
    if (tc.length !== 11) {
      return NextResponse.json(
        { error: "TC Kimlik No 11 haneli olmalıdır." },
        { status: 400 }
      );
    }

    await query(
      `UPDATE talepler SET
        tc_kimlik_no = $2, ad_soyad = $3, email = $4, siparis_no = $5,
        talep_edilen_tutar = $6, para_birimi = $7, referans_tipi = $8,
        iade_banka = $9, para_kime_gitti = $10, acici_kim = $11,
        kapatici_kim = $12, aciklama = $13, durum = $14
      WHERE id = $1`,
      [
        id,
        tc,
        String(adSoyad ?? "").trim(),
        String(email ?? "").trim(),
        String(siparisNo ?? ""),
        String(talepEdilenTutar ?? ""),
        String(paraBirimi ?? "TL"),
        String(referansTipi ?? ""),
        String(iadeBanka ?? ""),
        String(paraKimeGitti ?? "").trim(),
        String(aciciKim ?? "").trim(),
        String(kapaticiKim ?? "").trim(),
        String(aciklama ?? "").trim(),
        String(durum ?? "Beklemede"),
      ]
    );

    const { rows } = await query<Record<string, unknown>>(
      "SELECT * FROM talepler WHERE id = $1",
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ talep: rows[0] });
  } catch (err) {
    console.error("admin talepler PUT:", err);
    return NextResponse.json(
      { error: "Güncelleme yapılamadı." },
      { status: 500 }
    );
  }
}
