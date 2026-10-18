import 'server-only';
import { and, asc, desc, gte, ilike, inArray, lte, or, sql, type SQL } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { requireUser } from './session';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { DEFAULT_TARGETS } from './constants';
import type { DayFull, Targets } from './calc';

// Toda lectura pasa por acá: verifica la sesión además del proxy.
async function db() {
  await requireUser();
  return getDb();
}

export async function getTargets(): Promise<Targets> {
  const rows = await (await db()).select().from(s.targets);
  const out: Targets = structuredClone(DEFAULT_TARGETS);
  for (const r of rows) {
    if (r.dayType !== 'training' && r.dayType !== 'rest') continue;
    out[r.dayType] = {
      kcal: [r.kcalMin, r.kcalMax], protein: [r.proteinMin, r.proteinMax], carbs: [r.carbsMin, r.carbsMax],
      fat: [r.fatMin, r.fatMax], fiber: [r.fiberMin, r.fiberMax],
    };
  }
  return out;
}

/** Días completos (con comidas y bloques) entre from y to inclusive, ordenados. */
export async function getDays(from: string, to: string): Promise<DayFull[]> {
  const d = await db();
  const inRange = (col: AnyPgColumn) => and(gte(col, from), lte(col, to));
  const [days, meals, sleep, training, activity, measurements, timeUse] = await Promise.all([
    d.select().from(s.days).where(inRange(s.days.date)).orderBy(asc(s.days.date)),
    d.select().from(s.meals).where(inRange(s.meals.date)).orderBy(asc(s.meals.date), asc(s.meals.sortOrder)),
    d.select().from(s.sleep).where(inRange(s.sleep.date)),
    d.select().from(s.training).where(inRange(s.training.date)),
    d.select().from(s.activity).where(inRange(s.activity.date)),
    d.select().from(s.measurements).where(inRange(s.measurements.date)),
    d.select().from(s.timeUse).where(inRange(s.timeUse.date)),
  ]);
  const by = <T extends { date: string }>(rows: T[]) => new Map(rows.map((r) => [r.date, r]));
  const [sl, tr, ac, me, tu] = [by(sleep), by(training), by(activity), by(measurements), by(timeUse)];
  return days.map((day) => ({
    ...day,
    meals: meals.filter((m) => m.date === day.date),
    sleep: sl.get(day.date) ?? null,
    training: tr.get(day.date) ?? null,
    activity: ac.get(day.date) ?? null,
    measurements: me.get(day.date) ?? null,
    timeUse: tu.get(day.date) ?? null,
  }));
}

export async function getDay(date: string): Promise<DayFull | null> {
  return (await getDays(date, date))[0] ?? null;
}

export async function getDateBounds() {
  const [r] = await (await db()).select({ first: sql<string | null>`min(${s.days.date})`, last: sql<string | null>`max(${s.days.date})` }).from(s.days);
  return r;
}

export async function getMeasurements() {
  return (await db()).select().from(s.measurements).orderBy(asc(s.measurements.date));
}

/** Última medición anterior a una fecha (para comparar el lunes). */
export async function getPreviousMeasurement(before: string) {
  const [r] = await (await db()).select().from(s.measurements).where(sql`${s.measurements.date} < ${before}`).orderBy(desc(s.measurements.date)).limit(1);
  return r ?? null;
}

export async function getSleepSeries(from: string, to: string) {
  return (await db()).select().from(s.sleep).where(and(gte(s.sleep.date, from), lte(s.sleep.date, to))).orderBy(asc(s.sleep.date));
}

export async function getTimeUse(from: string, to: string) {
  return (await db()).select().from(s.timeUse).where(and(gte(s.timeUse.date, from), lte(s.timeUse.date, to))).orderBy(asc(s.timeUse.date));
}

export type MealFilters = { q?: string; categories?: string[]; confidence?: string[]; minScore?: number; limit: number };

export async function searchMeals(f: MealFilters) {
  const d = await db();
  const where: SQL[] = [];
  if (f.q) {
    const words = f.q.trim().split(/\s+/).filter(Boolean).slice(0, 6);
    for (const w of words) where.push(or(ilike(s.meals.desc, `%${w}%`), ilike(s.meals.categoryOriginal, `%${w}%`))!);
  }
  if (f.categories?.length) where.push(inArray(s.meals.category, f.categories));
  if (f.confidence?.length) where.push(inArray(s.meals.confidence, f.confidence));
  if (f.minScore) where.push(gte(s.meals.calidadPuntaje, f.minScore));
  const cond = where.length ? and(...where) : undefined;
  const [rows, [{ total }]] = await Promise.all([
    d.select().from(s.meals).where(cond).orderBy(desc(s.meals.date), desc(s.meals.sortOrder)).limit(f.limit),
    d.select({ total: sql<number>`count(*)::int` }).from(s.meals).where(cond),
  ]);
  const photos = rows.length
    ? await d.select().from(s.mealPhotos).where(inArray(s.mealPhotos.mealId, rows.map((r) => r.id)))
    : [];
  return { rows: rows.map((r) => ({ ...r, photos: photos.filter((p) => p.mealId === r.id) })), total };
}

export async function getDayPhotos(mealIds: number[]) {
  if (!mealIds.length) return [];
  return (await db()).select().from(s.mealPhotos).where(inArray(s.mealPhotos.mealId, mealIds));
}
