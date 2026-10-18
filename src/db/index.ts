import { drizzle } from 'drizzle-orm/node-postgres';
import { attachDatabasePool } from '@vercel/functions';
import { Pool } from 'pg';
import * as schema from './schema';

// node-postgres + Fluid compute de Vercel (recomendación de Neon). DATABASE_URL es la URL pooled de Neon.
export function createDb(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('Falta DATABASE_URL');
  const pool = new Pool({ connectionString: url, max: 5 });
  attachDatabasePool(pool);
  return drizzle(pool, { schema });
}

export type Db = ReturnType<typeof createDb>;

const g = globalThis as unknown as { __db?: Db };
export function getDb(): Db {
  return (g.__db ??= createDb());
}
