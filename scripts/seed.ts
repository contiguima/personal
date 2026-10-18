// Migra todo el historial de data/bitacora_salud.jsx a la base.
// Uso: npm run db:seed            (falla si la base ya tiene comidas)
//      npm run db:seed -- --reset (borra todo y vuelve a migrar)
import { sql } from 'drizzle-orm';
import { createDb } from '../src/db';
import * as s from '../src/db/schema';
import { ingest } from '../src/lib/ingest';
import { DEFAULT_TARGETS } from '../src/lib/constants';
import { loadLegacy } from './legacy';

async function main() {
  const db = createDb();
  const reset = process.argv.includes('--reset');
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(s.meals);
  if (count > 0 && !reset) throw new Error(`La base ya tiene ${count} comidas. Usá --reset para volver a migrar desde cero.`);
  if (reset) await db.execute(sql`truncate days, meals, meal_photos, sleep, training, activity, measurements, time_use, targets restart identity cascade`);

  for (const [dayType, t] of Object.entries(DEFAULT_TARGETS)) {
    await db.insert(s.targets).values({
      dayType,
      kcalMin: t.kcal[0], kcalMax: t.kcal[1], proteinMin: t.protein[0], proteinMax: t.protein[1],
      carbsMin: t.carbs[0], carbsMax: t.carbs[1], fatMin: t.fat[0], fatMax: t.fat[1],
      fiberMin: t.fiber[0], fiberMax: t.fiber[1],
    });
  }

  const legacy = loadLegacy();
  const res = await ingest(db, { days: legacy.days, timeUse: legacy.timeUse }, { force: true });
  console.log(`Migrados ${res.days.length} días, ${res.mealsInserted} comidas nuevas, ${res.mealsUpdated} actualizadas, ${res.timeUse} días de uso del tiempo.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
