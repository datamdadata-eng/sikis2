import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool =
  connectionString &&
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

export async function query<T = unknown>(
  text: string,
  params?: (string | number | null)[]
): Promise<{ rows: T[] }> {
  if (!pool) throw new Error("DATABASE_URL tanımlı değil.");
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return { rows: (res.rows || []) as T[] };
  } finally {
    client.release();
  }
}

export async function ensureTaleplerTable(): Promise<void> {
  if (!pool) throw new Error("DATABASE_URL tanımlı değil.");
  const client = await pool.connect();
  try {
    await client.query(`
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
        aciklama TEXT NOT NULL,
        durum VARCHAR(50) NOT NULL DEFAULT 'Beklemede',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_talepler_tc ON talepler(tc_kimlik_no)"
    );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_talepler_created_at ON talepler(created_at DESC)"
    );
  } finally {
    client.release();
  }
}
