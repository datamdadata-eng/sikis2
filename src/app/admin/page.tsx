"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Talep = {
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
};

const BANKA_OPTIONS = [
  "Ziraat Bankası",
  "İş Bankası",
  "Garanti BBVA",
  "Yapı Kredi",
  "Akbank",
  "Halkbank",
  "Vakıfbank",
  "QNB Finansbank",
  "Denizbank",
  "Türk Ekonomi Bankası (TEB)",
  "ING Türkiye",
  "HSBC Türkiye",
  "Enpara (QNB)",
  "Albaraka Türk",
  "Kuveyt Türk",
  "Türkiye Finans",
  "Ziraat Katılım",
  "Vakıf Katılım",
  "TSKB",
  "Fibabanka",
  "Şekerbank",
  "Odeabank",
  "Citibank",
  "Bank of China Turkey",
  "Deutsche Bank",
  "Burgan Bank",
  "Arab Turkish Bank",
  "Diğer",
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [loading, setLoading] = useState(false);
  const [editTalep, setEditTalep] = useState<Talep | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/me", { credentials: "include" });
    setAuth(res.ok);
    return res.ok;
  }, []);

  const fetchTalepler = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/talepler", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setTalepler(data.talepler || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth().then((ok) => {
      if (ok) fetchTalepler();
    });
  }, [checkAuth, fetchTalepler]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoginError(data.error || "Giriş yapılamadı.");
      return;
    }
    setAuth(true);
    fetchTalepler();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setAuth(false);
    setTalepler([]);
    setEditTalep(null);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTalep) return;
    setSaveError("");
    setSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      tcKimlikNo: formData.get("tcKimlikNo"),
      adSoyad: formData.get("adSoyad"),
      email: formData.get("email"),
      siparisNo: formData.get("siparisNo"),
      talepEdilenTutar: formData.get("talepEdilenTutar"),
      paraBirimi: formData.get("paraBirimi"),
      referansTipi: formData.get("referansTipi"),
      iadeBanka: formData.get("iadeBanka"),
      paraKimeGitti: formData.get("paraKimeGitti"),
      aciciKim: formData.get("aciciKim"),
      kapaticiKim: formData.get("kapaticiKim"),
      aciklama: formData.get("aciklama"),
      durum: formData.get("durum"),
    };
    const res = await fetch(`/api/admin/talepler/${editTalep.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setSaveError(data.error || "Kaydedilemedi.");
      return;
    }
    setEditTalep(null);
    fetchTalepler();
  };

  if (auth === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Yükleniyor…</p>
      </div>
    );
  }

  if (auth === false) {
    return (
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-xl font-semibold text-slate-900">Admin Girişi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Devam etmek için şifrenizi girin.
        </p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-800">
              Şifre
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-[#004f9f] focus:ring-2 focus:ring-[#004f9f]/20"
              required
              autoFocus
            />
          </div>
          {loginError && (
            <p className="text-sm text-red-600">{loginError}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-[#004f9f] py-2.5 text-sm font-semibold text-white hover:bg-[#003c79]"
          >
            Giriş yap
          </button>
        </form>
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-[#004f9f] hover:underline">
            ← Ana sayfaya dön
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Panel — Talepler</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-[#004f9f] hover:underline"
          >
            Ana sayfa
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Çıkış yap
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        {loading ? (
          <p className="py-8 text-center text-slate-500">Yükleniyor…</p>
        ) : talepler.length === 0 ? (
          <p className="py-8 text-center text-slate-500">Henüz talep yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-3 font-semibold text-slate-800">Tarih</th>
                  <th className="px-3 py-3 font-semibold text-slate-800">TC</th>
                  <th className="px-3 py-3 font-semibold text-slate-800">Ad Soyad</th>
                  <th className="px-3 py-3 font-semibold text-slate-800">Sipariş No.</th>
                  <th className="px-3 py-3 font-semibold text-slate-800">Tutar</th>
                  <th className="px-3 py-3 font-semibold text-slate-800">Banka</th>
                  <th className="px-3 py-3 font-semibold text-slate-800">Para Kime Gitti?</th>
                  <th className="px-3 py-3 font-semibold text-slate-800">Açıcı Kim?</th>
                  <th className="px-3 py-3 font-semibold text-slate-800">Kapatıcı Kim?</th>
                  <th className="px-3 py-3 font-semibold text-slate-800">Durum</th>
                  <th className="px-3 py-3 font-semibold text-slate-800"></th>
                </tr>
              </thead>
              <tbody>
                {talepler.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{t.tc_kimlik_no}</td>
                    <td className="px-3 py-3 text-slate-900">{t.ad_soyad}</td>
                    <td className="px-3 py-3 text-slate-700">{t.siparis_no}</td>
                    <td className="px-3 py-3 text-slate-700">
                      {t.talep_edilen_tutar} {t.para_birimi}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{t.iade_banka}</td>
                    <td className="px-3 py-3 text-slate-700">{t.para_kime_gitti || "—"}</td>
                    <td className="px-3 py-3 text-slate-700">{t.acici_kim || "—"}</td>
                    <td className="px-3 py-3 text-slate-700">{t.kapatici_kim || "—"}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        {t.durum}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setEditTalep(t)}
                        className="text-[#004f9f] hover:underline"
                      >
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editTalep && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setEditTalep(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-900">Talep düzenle</h2>
            <form onSubmit={handleSaveEdit} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-800">TC Kimlik No.</label>
                <input
                  name="tcKimlikNo"
                  defaultValue={editTalep.tc_kimlik_no}
                  maxLength={11}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800">Ad Soyad</label>
                <input
                  name="adSoyad"
                  defaultValue={editTalep.ad_soyad}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800">E-posta</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editTalep.email}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800">Sipariş No.</label>
                <input
                  name="siparisNo"
                  defaultValue={editTalep.siparis_no}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800">Talep Edilen Tutar</label>
                <input
                  name="talepEdilenTutar"
                  defaultValue={editTalep.talep_edilen_tutar}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800">Para Birimi</label>
                <select
                  name="paraBirimi"
                  defaultValue={editTalep.para_birimi}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="TL">TL</option>
                  <option value="USD">USD</option>
                  <option value="GRAM_ALTIN">Gram Altın</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800">Referans Tipi</label>
                <select
                  name="referansTipi"
                  defaultValue={editTalep.referans_tipi}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="referans-numarasi">Referans Numarası</option>
                  <option value="iban">İBAN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800">İade Banka</label>
                <select
                  name="iadeBanka"
                  defaultValue={editTalep.iade_banka}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  {BANKA_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800">Para Kime Gitti?</label>
                <input
                  name="paraKimeGitti"
                  defaultValue={editTalep.para_kime_gitti}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800">Açıcı Kim?</label>
                <input
                  name="aciciKim"
                  defaultValue={editTalep.acici_kim}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800">Kapatıcı Kim?</label>
                <input
                  name="kapaticiKim"
                  defaultValue={editTalep.kapatici_kim}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800">Durum</label>
                <select
                  name="durum"
                  defaultValue={editTalep.durum}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="Beklemede">Beklemede</option>
                  <option value="İşlemde">İşlemde</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                  <option value="Reddedildi">Reddedildi</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-800">Açıklama</label>
                <textarea
                  name="aciklama"
                  defaultValue={editTalep.aciklama}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              {saveError && (
                <p className="sm:col-span-2 text-sm text-red-600">{saveError}</p>
              )}
              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditTalep(null)}
                  disabled={saving}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#004f9f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#003c79] disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
