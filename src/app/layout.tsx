import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "İptal ve İade Talep Formu | Kurumsal",
  description: "İptal ve iade taleplerinizi güvenli ve kurumsal kanallar üzerinden iletebilirsiniz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col bg-slate-50">
          <Header />
          <main className="flex-1">
            <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Tüm hakları saklıdır.</p>
            <p className="mt-1">Bu site kurumsal iletişim ve talep yönetimi amacıyla hazırlanmıştır.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

