import Image from "next/image";

const BDDK_LOGO_URL =
  "https://www.bddk.org.tr/Content/TemplateDefault/layout_images/banner_sol_tr_eski.png";

export default function Header() {
  return (
    <header className="w-full shadow-md">
      {/* Üst sütun: beyaz, sadece logo */}
      <div className="w-full bg-white px-4 py-4 md:px-6 md:py-5">
        <div className="mx-auto max-w-6xl">
          <a href="https://www.bddk.org.tr/" target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center">
            <Image
              src={BDDK_LOGO_URL}
              alt="BDDK — Bankacılık Düzenleme ve Denetleme Kurumu"
              width={200}
              height={60}
              className="h-10 w-auto object-contain object-left md:h-12"
              priority
              unoptimized
            />
          </a>
        </div>
      </div>

      {/* Alt sütun: mavi menü */}
      <div className="w-full bg-[#004f9f] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          <a href="https://www.bddk.org.tr/KurumHakkinda" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Hakkımızda
          </a>
          <a href="https://www.bddk.org.tr/Duyuru" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Duyurular
          </a>
          <a href="https://www.bddk.org.tr/Mevzuat" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Mevzuat
          </a>
          <a href="https://www.bddk.org.tr/Veri" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Veriler
          </a>
          <a href="https://www.bddk.org.tr/Kurulus" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Kuruluşlar
          </a>
          <a href="https://www.bddk.org.tr/SSS" target="_blank" rel="noopener noreferrer" className="hover:underline">
            SSS
          </a>
          <a href="https://www.bddk.org.tr/Iletisim" target="_blank" rel="noopener noreferrer" className="hover:underline">
            İletişim
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs text-slate-700 shadow-sm md:flex">
            <input
              className="w-32 bg-transparent text-[11px] outline-none placeholder:text-slate-400"
              type="text"
              placeholder="Sitede ara..."
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-4 w-4 text-slate-500"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23C15.99 6.01 13.52 3.5 10.5 3.5S5.01 6.01 5.01 9.5 7.48 15.5 10.5 15.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L19 20.49 20.49 19zm-5 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z"
              />
            </svg>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/60 px-3 py-1 text-xs font-semibold tracking-[0.18em]"
          >
            EN
          </button>
        </div>
        </div>
      </div>
    </header>
  );
}

