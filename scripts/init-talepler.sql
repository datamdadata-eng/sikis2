-- İptal ve iade talepleri tablosu (Neon PostgreSQL)
-- Neon SQL Editor veya psql ile çalıştırın.

CREATE TABLE IF NOT EXISTS talepler (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tc_kimlik_no VARCHAR(11) NOT NULL,
  ad_soyad VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  siparis_no VARCHAR(50) NOT NULL,
  talep_edilen_tutar VARCHAR(50) NOT NULL,
  para_birimi VARCHAR(20) NOT NULL DEFAULT 'TL',
  referans_tipi VARCHAR(50) NOT NULL,
  iade_banka VARCHAR(255) NOT NULL,
  para_kime_gitti VARCHAR(255) NOT NULL DEFAULT '',
  acici_kim VARCHAR(255) NOT NULL DEFAULT '',
  kapatici_kim VARCHAR(255) NOT NULL DEFAULT '',
  aciklama TEXT NOT NULL,
  durum VARCHAR(50) NOT NULL DEFAULT 'Beklemede',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_talepler_tc ON talepler(tc_kimlik_no);
CREATE INDEX IF NOT EXISTS idx_talepler_created_at ON talepler(created_at DESC);
