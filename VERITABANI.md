# Veritabanı Kurulumu (Neon PostgreSQL)

1. **Bağlantı:** `.env.local` dosyasında `DATABASE_URL` tanımlı olmalı (proje kökünde).

2. **Tablo oluşturma:** Neon Dashboard → SQL Editor bölümünde aşağıdaki dosyayı çalıştırın:
   - `scripts/init-talepler.sql`

   Veya psql ile:
   ```bash
   psql "postgresql://..." -f scripts/init-talepler.sql
   ```

3. **Tablolar:** `talepler` tablosu iptal/iade taleplerini tutar. TC Kimlik No. ile sorgulama bu tabloya göre yapılır.
