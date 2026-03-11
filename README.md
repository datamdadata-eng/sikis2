# İptal ve İade Talep Formu

Next.js ile geliştirilmiş, BDDK tarzı arayüze sahip iptal ve iade talep formu uygulaması.

## Özellikler

- **Talep formu:** TC Kimlik No., ad soyad, e-posta, sipariş no., tutar, para birimi, referans/İBAN, iade bankası, açıklama
- **Sorgula:** TC ile işlem durumlarını sorgulama; 60 dakikalık iade geri sayımı
- **Admin paneli:** `/admin` — Talepleri listeleme ve düzenleme (şifre ile giriş)
- **Veritabanı:** PostgreSQL (Neon); tablo ilk kayıtta otomatik oluşturulur

## Kurulum

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. `.env.local` dosyası oluşturup aşağıdaki değişkenleri tanımlayın:
   ```env
   DATABASE_URL=postgresql://...
   ADMIN_PASSWORD=admin_paneli_sifreniz
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

4. Tarayıcıda [http://localhost:3000](http://localhost:3000) adresine gidin.

## Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | PostgreSQL bağlantı dizesi (Neon vb.) |
| `ADMIN_PASSWORD` | Admin paneli giriş şifresi |

`.env.local` dosyası Git’e eklenmez; deploy ortamında bu değişkenleri ayrıca tanımlayın.

## Veritabanı

Tablo yoksa ilk API çağrısında otomatik oluşturulur. Elle kurmak için `scripts/init-talepler.sql` dosyasını veritabanında çalıştırabilirsiniz. Ayrıntı için `VERITABANI.md` dosyasına bakın.

## Teknolojiler

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL (pg / Neon)
