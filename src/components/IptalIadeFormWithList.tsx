"use client";

import { useState, useEffect } from "react";
import AmountWithCurrency from "./AmountWithCurrency";

const REFUND_DELAY_MS = 60 * 60 * 1000; // 60 dakika

function formatAmount(value: string): string {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "—";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("tr-TR", {
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

function getRefundAtMs(createdAt: string): number {
  return new Date(createdAt).getTime() + REFUND_DELAY_MS;
}

function formatRefundTime(createdAt: string): string {
  const ms = getRefundAtMs(createdAt);
  return new Date(ms).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCountdown(createdAt: string, nowMs: number): string {
  const refundMs = getRefundAtMs(createdAt);
  const remaining = refundMs - nowMs;
  if (remaining <= 0) return "İade zamanı.";
  const dk = Math.floor(remaining / 60_000);
  const sn = Math.floor((remaining % 60_000) / 1_000);
  return `${dk} dk. ${sn} sn. kaldı`;
}

export default function IptalIadeFormWithList() {
  const [formKey, setFormKey] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sorguTc, setSorguTc] = useState("");
  const [sorguSonuc, setSorguSonuc] = useState<Array<{
    id: string;
    adSoyad: string;
    siparisNo: string;
    talepEdilenTutar: string;
    paraBirimi: string;
    iadeBanka: string;
    durum: string;
    createdAt: string;
  }> | null>(null);
  const [sorguLoading, setSorguLoading] = useState(false);
  const [sorguError, setSorguError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!sorguSonuc || sorguSonuc.length === 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sorguSonuc]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const tcKimlikNo = (formData.get("tcKimlikNo") as string)?.replace(/\D/g, "") ?? "";
    const fullName = (formData.get("fullName") as string)?.trim() ?? "";
    const email = (formData.get("email") as string)?.trim() ?? "";
    const orderNumber = (formData.get("orderNumber") as string) ?? "";
    const requestedAmount = (formData.get("requestedAmount") as string) ?? "";
    const currency = (formData.get("currency") as string) ?? "";
    const referenceType = (formData.get("referenceType") as string) ?? "";
    const description = (formData.get("description") as string)?.trim() ?? "";

    const bankSelect = form.querySelector('[name="refundBank"]') as HTMLSelectElement | null;
    const refundBankLabel = bankSelect?.selectedOptions?.[0]?.textContent ?? "";

    try {
      const res = await fetch("/api/talepler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tcKimlikNo,
          adSoyad: fullName,
          email,
          siparisNo: orderNumber,
          talepEdilenTutar: requestedAmount,
          paraBirimi: currency || "TL",
          referansTipi: referenceType,
          iadeBanka: refundBankLabel,
          aciklama: description,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.error || "Kayıt gönderilemedi.");
        setIsSubmitting(false);
        return;
      }
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 4000);
      form.reset();
      setFormKey((k) => k + 1);
    } catch {
      setSubmitError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSorgula = async () => {
    const tc = sorguTc.replace(/\D/g, "");
    if (tc.length !== 11) {
      setSorguError("TC Kimlik No 11 haneli olmalıdır.");
      setSorguSonuc(null);
      return;
    }
    setSorguError(null);
    setSorguSonuc(null);
    setSorguLoading(true);
    try {
      const res = await fetch(`/api/sorgula?tc=${encodeURIComponent(tc)}`);
      const data = await res.json();
      if (!res.ok) {
        setSorguError(data.error || "Sorgu yapılamadı.");
        return;
      }
      setSorguSonuc(
        data.talepler.map((t: { id: string; adSoyad: string; siparisNo: string; talepEdilenTutar: string; paraBirimi: string; iadeBanka: string; durum: string; createdAt: string }) => ({
          id: t.id,
          adSoyad: t.adSoyad,
          siparisNo: t.siparisNo,
          talepEdilenTutar: t.talepEdilenTutar,
          paraBirimi: t.paraBirimi,
          iadeBanka: t.iadeBanka,
          durum: t.durum,
          createdAt: t.createdAt,
        }))
      );
    } catch {
      setSorguError("Bağlantı hatası.");
    } finally {
      setSorguLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
        <header className="mb-8 border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            İptal ve İade Talep Formu
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-[15px]">
            Satın aldığınız ürün veya hizmetlere ilişkin iptal ve iade taleplerinizi,
            aşağıdaki formu eksiksiz doldurarak kurumumuza iletebilirsiniz.
          </p>
        </header>

        {submitError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {submitError}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 md:grid-cols-2 md:gap-6"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tcKimlikNo" className="text-sm font-medium text-slate-800">
              TC Kimlik No.
            </label>
            <input
              id="tcKimlikNo"
              name="tcKimlikNo"
              type="text"
              inputMode="numeric"
              maxLength={11}
              pattern="[0-9]{11}"
              required
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#004f9f] focus:bg-white focus:ring-2 focus:ring-[#004f9f]/20"
              placeholder="11 haneli TC Kimlik No."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-slate-800">
              Ad ve Soyad
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#004f9f] focus:bg-white focus:ring-2 focus:ring-[#004f9f]/20"
              placeholder="Adınızı ve soyadınızı girin."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-800">
              E-posta Adresi
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#004f9f] focus:bg-white focus:ring-2 focus:ring-[#004f9f]/20"
              placeholder="ornek@kurum.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="orderNumber" className="text-sm font-medium text-slate-800">
              İade Talebi Numarası
            </label>
            <select
              id="orderNumber"
              name="orderNumber"
              required
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#004f9f] focus:bg-white focus:ring-2 focus:ring-[#004f9f]/20"
            >
              <option value="">Seçiniz</option>
              <option value="B458-8514">B458-8514</option>
              <option value="B458-V5">B458-V5</option>
            </select>
          </div>

          <AmountWithCurrency key={formKey} />

          <div className="flex flex-col gap-1.5 md:col-span-2 md:max-w-xs">
            <label htmlFor="referenceType" className="text-sm font-medium text-slate-800">
              Referans Numarası veya İBAN
            </label>
            <select
              id="referenceType"
              name="referenceType"
              required
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#004f9f] focus:bg-white focus:ring-2 focus:ring-[#004f9f]/20"
            >
              <option value="">Seçiniz</option>
              <option value="referans-numarasi">Referans Numarası</option>
              <option value="iban">İBAN</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2 md:max-w-xs">
            <label htmlFor="refundBank" className="text-sm font-medium text-slate-800">
              İadenin Gerçekleşeceği Banka
            </label>
            <select
              id="refundBank"
              name="refundBank"
              required
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#004f9f] focus:bg-white focus:ring-2 focus:ring-[#004f9f]/20"
            >
              <option value="">Seçiniz</option>
              <option value="ziraat">Ziraat Bankası</option>
              <option value="is-bankasi">İş Bankası</option>
              <option value="garanti-bbva">Garanti BBVA</option>
              <option value="yapi-kredi">Yapı Kredi</option>
              <option value="akbank">Akbank</option>
              <option value="halkbank">Halkbank</option>
              <option value="vakifbank">Vakıfbank</option>
              <option value="qnbfinansbank">QNB Finansbank</option>
              <option value="denizbank">Denizbank</option>
              <option value="teb">Türk Ekonomi Bankası (TEB)</option>
              <option value="ing">ING Türkiye</option>
              <option value="hsbc">HSBC Türkiye</option>
              <option value="enpara">Enpara (QNB)</option>
              <option value="albaraka">Albaraka Türk</option>
              <option value="kuveyt-turk">Kuveyt Türk</option>
              <option value="turkiye-finans">Türkiye Finans</option>
              <option value="ziraat-katilim">Ziraat Katılım</option>
              <option value="vakif-katilim">Vakıf Katılım</option>
              <option value="tskb">TSKB</option>
              <option value="fibabanka">Fibabanka</option>
              <option value="sekerbank">Şekerbank</option>
              <option value="odeabank">Odeabank</option>
              <option value="citibank">Citibank</option>
              <option value="bank-of-china">Bank of China Turkey</option>
              <option value="deutsche-bank">Deutsche Bank</option>
              <option value="burgan">Burgan Bank</option>
              <option value="arab-turk">Arab Turkish Bank</option>
              <option value="diger">Diğer</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-800">
              Talep Açıklaması
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              required
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#004f9f] focus:bg-white focus:ring-2 focus:ring-[#004f9f]/20"
              placeholder="İptal veya iade talebinizin detaylarını bu alana yazınız."
            />
            <p className="mt-1 text-xs text-slate-500">
              Talebinizin hızlı değerlendirilebilmesi için mümkün olduğunca ayrıntılı
              bilgi vermeniz rica olunur.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-start gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                name="kvkk"
                required
                className="mt-[3px] h-4 w-4 rounded border-slate-300 text-[#004f9f] focus:ring-[#004f9f]"
              />
              <span>
                Söz konusu para transferlerinin ve kredi taleplerinin tarafımca
                gerçekleştirilmediğini; işlemlerin tarafımın bilgisi ve onayı
                dışında üçüncü kişilerce yapıldığını; bu işlemlere ilişkin herhangi
                bir talep, onay veya yetkilendirmemin bulunmadığını beyan eder;
                konuya ilişkin gerekli incelemenin yapılmasını talep ederim.
              </span>
            </label>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="reset"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Temizle
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[#004f9f] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003c79] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#004f9f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Gönderiliyor..." : "Talep gönder"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Sorgula
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          TC Kimlik No. ile işlem durumlarınızı sorgulayabilirsiniz.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sorguTc" className="text-sm font-medium text-slate-800">
              TC Kimlik No.
            </label>
            <input
              id="sorguTc"
              type="text"
              inputMode="numeric"
              maxLength={11}
              value={sorguTc}
              onChange={(e) => {
                setSorguTc(e.target.value.replace(/\D/g, "").slice(0, 11));
                setSorguError(null);
                setSorguSonuc(null);
              }}
              className="w-48 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#004f9f] focus:bg-white focus:ring-2 focus:ring-[#004f9f]/20"
              placeholder="11 haneli"
            />
          </div>
          <button
            type="button"
            onClick={handleSorgula}
            disabled={sorguLoading}
            className="rounded-full bg-[#004f9f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003c79] disabled:opacity-60"
          >
            {sorguLoading ? "Sorgulanıyor…" : "Sorgula"}
          </button>
        </div>
        {sorguError && (
          <p className="mt-3 text-sm text-red-600">{sorguError}</p>
        )}
        {sorguSonuc && (
          <div className="mt-6 overflow-x-auto">
            {sorguSonuc.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
                Bu TC Kimlik No. ile kayıtlı talep bulunamadı.
              </p>
            ) : (
              <>
                <h3 className="mb-3 text-lg font-semibold text-slate-800">
                  Bekleyen İptal ve İade İşlemleri
                </h3>
                <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-3 font-semibold text-slate-800">Tarih</th>
                    <th className="px-3 py-3 font-semibold text-slate-800">Ad ve Soyad</th>
                    <th className="px-3 py-3 font-semibold text-slate-800">Sipariş No.</th>
                    <th className="px-3 py-3 font-semibold text-slate-800">Tutar</th>
                    <th className="px-3 py-3 font-semibold text-slate-800">İadenin Gerçekleşeceği Banka</th>
                    <th className="px-3 py-3 font-semibold text-slate-800">İade Saati</th>
                    <th className="px-3 py-3 font-semibold text-slate-800">Kalan Süre</th>
                    <th className="px-3 py-3 font-semibold text-slate-800">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {sorguSonuc.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="px-3 py-3 text-slate-900">{t.adSoyad}</td>
                      <td className="px-3 py-3 text-slate-700">{t.siparisNo}</td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatAmount(t.talepEdilenTutar)} {t.paraBirimi || "TL"}
                      </td>
                      <td className="px-3 py-3 text-slate-700">{t.iadeBanka || "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-700 font-medium">
                        {formatRefundTime(t.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={
                            getCountdown(t.createdAt, now) === "İade zamanı."
                              ? "text-emerald-600 font-medium"
                              : "text-slate-700"
                          }
                        >
                          {getCountdown(t.createdAt, now)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          {t.durum}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </>
            )}
          </div>
        )}
      </section>

      {showSuccessPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSuccessPopup(false)}
          role="dialog"
          aria-live="polite"
          aria-label="Talep gönderildi"
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
          <div
            className="relative rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Talebiniz gönderildi</h3>
                <p className="mt-1 text-sm text-slate-600">İşleminiz alınmıştır. TC Kimlik No. ile sorgulayarak takip edebilirsiniz.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSuccessPopup(false)}
                className="rounded-full bg-[#004f9f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#003c79]"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
