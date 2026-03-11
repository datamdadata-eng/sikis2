"use client";

import { useState, useId } from "react";

const CURRENCIES = [
  { value: "TL", label: "TL (₺)", symbol: "₺" },
  { value: "USD", label: "Dolar ($)", symbol: "$" },
  { value: "GRAM_ALTIN", label: "Gram Altın (g)", symbol: "g" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
] as const;

function formatWithPunctuation(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  // Binlik ayracı: nokta (1.500)
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseFormatted(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

export default function AmountWithCurrency() {
  const [displayValue, setDisplayValue] = useState("");
  const [currency, setCurrency] = useState("");
  const amountId = useId();
  const currencyId = useId();

  const currentSymbol =
    CURRENCIES.find((c) => c.value === currency)?.symbol ?? "₺";

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const limited = raw.slice(0, 12);
    const formatted = formatWithPunctuation(limited);
    setDisplayValue(formatted);
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={amountId}
          className="text-sm font-medium text-slate-800"
        >
          Talep Edilen Tutar
        </label>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 ring-0 transition focus-within:border-[#004f9f] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004f9f]/20">
            <span className="pl-3 text-sm font-medium text-slate-500">
              {currency ? currentSymbol : "₺"}
            </span>
            <input
              id={amountId}
              type="text"
              inputMode="decimal"
              value={displayValue}
              onChange={handleAmountChange}
              placeholder="1.500,00"
              className="w-full border-0 bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              required
            />
          </div>
        </div>
        <input
          type="hidden"
          name="requestedAmount"
          value={parseFormatted(displayValue) || ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={currencyId}
          className="text-sm font-medium text-slate-800"
        >
          Para Birimi
        </label>
        <select
          id={currencyId}
          name="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#004f9f] focus:bg-white focus:ring-2 focus:ring-[#004f9f]/20"
        >
          <option value="">Seçiniz</option>
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
