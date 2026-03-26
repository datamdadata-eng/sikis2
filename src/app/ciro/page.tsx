"use client";

import { useMemo, useState } from "react";

type CiroItem = {
  id: string;
  created_at: string;
  ad_soyad: string;
  kapatici_kim: string;
  talep_edilen_tutar: string;
  durum: string;
  para_kime_gitti: string;
  aciklama: string;
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatAmount(value: string): string {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "0 ₺";
  return `${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₺`;
}

function todayLocalInputValue() {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CiroPage() {
  const [date, setDate] = useState(todayLocalInputValue());
  const [rows, setRows] = useState<CiroItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toplamCiro = useMemo(() => {
    return rows.reduce((acc, item) => {
      const numeric = Number(String(item.talep_edilen_tutar).replace(/\D/g, ""));
      return acc + (Number.isFinite(numeric) ? numeric : 0);
    }, 0);
  }, [rows]);

  const fetchByDate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ciro?date=${encodeURIComponent(date)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kayıtlar alınamadı.");
        setRows([]);
        return;
      }
      setRows(data.rows || []);
    } catch {
      setError("Bağlantı hatası.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6 rounded-xl bg-[#1f2a3a] p-6 text-white shadow-sm ring-1 ring-[#2e3a4f] md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Ciro</h1>
          <p className="mt-1 text-sm text-slate-300">
            Tarih seçerek o güne ait detayları görüntüleyin.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label htmlFor="ciro-date" className="mb-1 block text-xs text-slate-300">
              Tarih
            </label>
            <input
              id="ciro-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-white/15 bg-[#243247] px-3 py-2 text-sm text-white outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30"
            />
          </div>
          <button
            type="button"
            onClick={fetchByDate}
            disabled={loading}
            className="rounded-md bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Yükleniyor..." : "Getir"}
          </button>
        </div>
      </header>

      <div className="rounded-lg border border-white/10 bg-[#233044] p-4">
        <p className="text-xs text-slate-300">Toplam Ciro</p>
        <p className="mt-1 text-2xl font-semibold text-emerald-400">
          {formatAmount(String(toplamCiro))}
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#28354b] text-slate-300">
            <tr>
              <th className="px-3 py-3">Tarih</th>
              <th className="px-3 py-3">Kullanıcı</th>
              <th className="px-3 py-3">Kapatıcı</th>
              <th className="px-3 py-3">Tutar</th>
              <th className="px-3 py-3">Durum</th>
              <th className="px-3 py-3">Para Kime</th>
              <th className="px-3 py-3">Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="border-t border-white/10 bg-[#1f2a3a]">
                <td className="px-3 py-4 text-slate-400" colSpan={7}>
                  Bu tarih için kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id} className="border-t border-white/10 bg-[#1f2a3a]">
                  <td className="px-3 py-3 text-slate-300">{formatDateTime(item.created_at)}</td>
                  <td className="px-3 py-3">{item.ad_soyad || "-"}</td>
                  <td className="px-3 py-3">{item.kapatici_kim || "-"}</td>
                  <td className="px-3 py-3 font-semibold text-emerald-400">
                    {formatAmount(item.talep_edilen_tutar)}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                      {item.durum || "-"}
                    </span>
                  </td>
                  <td className="px-3 py-3">{item.para_kime_gitti || "-"}</td>
                  <td className="px-3 py-3 text-slate-300">{item.aciklama || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

