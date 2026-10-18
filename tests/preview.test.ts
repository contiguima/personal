import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { createDb } from '../src/db';
import * as s from '../src/db/schema';
import { ingest } from '../src/lib/ingest';
import { previewIngest } from '../src/lib/preview';
import { DEFAULT_TARGETS } from '../src/lib/constants';

const db = createDb();
const date = '2030-02-04';

test('la vista previa asigna chatId, marca nuevas vs correcciones y calcula lo que falta', async () => {
  await db.delete(s.days).where(eq(s.days.date, date));
  await ingest(db, { days: { [date]: { trainingDay: true, meals: [{ chatId: `${date}-almuerzo`, category: 'Almuerzo', desc: 'Pollo', kcal: 600, protein: 50, carbs: 60, fat: 15, fiber: 5 }] } } });

  const p = await previewIngest(db, { days: { [date]: { meals: [
    { category: 'Almuerzo', desc: 'Segundo almuerzo', kcal: 100, protein: 5, carbs: 10, fat: 2, fiber: 1 },
    { chatId: `${date}-almuerzo`, category: 'Almuerzo', desc: 'Pollo (corregido)', kcal: 500, protein: 45, carbs: 50, fat: 12, fiber: 4 },
  ] } } }, DEFAULT_TARGETS);

  const [d] = p.days;
  assert.equal(d.meals[0].chatId, `${date}-almuerzo-2`);
  assert.equal(d.meals[0].status, 'nueva');
  assert.equal(d.meals[1].status, 'corrige');
  assert.equal(d.totals!.kcal, 600, 'reemplaza la corregida, no la suma dos veces');
  assert.deepEqual(d.target, DEFAULT_TARGETS.training);
  assert.equal(d.missing!.protein, 135 - 50);
  assert.equal(p.payload.days[date].meals![0].chatId, `${date}-almuerzo-2`, 'el payload confirmado lleva el chatId asignado');

  const rows = await db.select({ count: s.meals.id }).from(s.meals).where(eq(s.meals.date, date));
  assert.equal(rows.length, 1, 'la vista previa no escribe nada');
  await db.delete(s.days).where(eq(s.days.date, date));
});

test('cierre', async () => { await (db.$client as { end(): Promise<void> }).end(); });
