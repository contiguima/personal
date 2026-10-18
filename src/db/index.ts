import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import * as schema from './schema';

export function createDb(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('Falta DATABASE_URL');
  // Neon en producción (websocket, soporta transacciones); Postgres común en local.
  if (url.includes('neon.tech')) return drizzleNeon(new NeonPool({ connectionString: url }), { schema });
  return drizzlePg(new PgPool({ connectionString: url }), { schema });
}

export type Db = ReturnType<typeof createDb>;

const g = globalThis as unknown as { __db?: Db };
export function getDb(): Db {
  return (g.__db ??= createDb());
}
