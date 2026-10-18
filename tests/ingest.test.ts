// Requiere DATABASE_URL a una base de prueba (corre después de db:seed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eq, sql } from 'drizzle-orm';
import { createDb } from '../src/db';
import * as s from '../src/db/schema';
import { ingest } from '../src/lib/ingest';

const db = createDb();
const date = '2030-01-07';

test('corregir una comida actualiza el mismo chatId, no duplica', async () => {
  await db.delete(s.days).where(eq(s.days.date, date));
  const meal = { chatId: `${date}-almuerzo`, category: 'Almuerzo', desc: 'Pollo con papa', confidence: 'media', kcal: 500, protein: 40, carbs: 50, fat: 12, fiber: 4 };
  let r = await ingest(db, { days: { [date]: { trainingDay: true, meals: [meal] } } });
  assert.equal(r.mealsInserted, 1);
  r = await ingest(db, { days: { [date]: { meals: [{ ...meal, desc: 'Pollo con papa (50 g)', kcal: 430 }] } } });
  assert.equal(r.mealsUpdated, 1);
  const rows = await db.select().from(s.meals).where(eq(s.meals.date, date));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].kcal, 430);
  const [d] = await db.select().from(s.days).where(eq(s.days.date, date));
  assert.equal(d.trainingDay, true, 'no pisa lo que no viene en la carga');
});

test('un día cerrado no se pisa salvo con force', async () => {
  await ingest(db, { days: { [date]: { closed: true } } });
  let r = await ingest(db, { days: { [date]: { note: 'otra cosa' } } });
  assert.deepEqual(r.skippedClosed, [date]);
  r = await ingest(db, { days: { [date]: { note: 'corrección' } } }, { force: true });
  assert.deepEqual(r.days, [date]);
  await db.delete(s.days).where(eq(s.days.date, date));
  const [{ c }] = await db.select({ c: sql<number>`count(*)::int` }).from(s.meals).where(eq(s.meals.date, date));
  assert.equal(c, 0);
});

test('cierre', async () => { await (db.$client as { end(): Promise<void> }).end(); });
