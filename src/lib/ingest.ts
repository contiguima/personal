// Carga de datos con la misma forma que usaba CHAT_UPDATES:
// { days: { 'YYYY-MM-DD': { trainingDay, sleep, training, activity, measurements, note, meals: [...] } }, timeUse: {...} }
// Regla de oro: una comida con el mismo chatId se actualiza, nunca se duplica.
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import type { Db } from '@/db';
import * as s from '@/db/schema';
import { normalizeCategory, normalizeConfidence } from './constants';

const num = z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/).transform(Number)]).nullable().optional();
const txt = z.union([z.string(), z.number()]).transform(String).nullable().optional();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const mealSchema = z.object({
  chatId: z.string().min(1).optional(),
  id: z.string().optional(),
  category: z.string(),
  desc: z.string(),
  confidence: z.string().nullable().optional(),
  kcal: num, protein: num, carbs: num, fat: num, fiber: num,
  calidad: z.object({ ultraprocesado: txt, beneficios: txt, puntaje: num }).nullable().optional(),
  // Desglose por plato (modo estricto): cada plato con sus macros.
  items: z.array(z.object({
    nombre: z.string(), cantidad: txt, kcal: num, protein: num, carbs: num, fat: num, fiber: num,
  })).nullable().optional(),
});

const daySchema = z.object({
  trainingDay: z.boolean().nullable().optional(),
  closed: z.boolean().optional(),
  migrated: z.boolean().optional(),
  note: z.string().optional(),
  estimatedTotals: z.unknown().optional(),
  sleep: z.object({
    duration_min: z.number(), score: num, wakeEnergy: num, endEnergy: num,
    phases: z.object({ vigilia: num, rem: num, ligero: num, profundo: num }).nullable().optional(),
  }).nullable().optional(),
  training: z.object({
    tipo: z.string(), duracion: txt, ejercicios: txt, kcalActivas: num, kcalTotal: num,
    fcProm: txt, esfuerzo: txt, energia: txt, dolor: txt,
  }).nullable().optional(),
  activity: z.object({ steps: num, activeKcal: num, restKcal: num, totalEnergy: num }).nullable().optional(),
  measurements: z.object({ weight: num, waist: num, hip: num }).nullable().optional(),
  meals: z.array(mealSchema).optional(),
});

const timeUseSchema = z.object({
  deporte: num, trabajoCorpo: num, sideHustle: num, emprendedurismo: num,
  aprendizaje: num, tiktok: num, social: num, otros: num,
});

export const ingestSchema = z.object({
  days: z.record(isoDate, daySchema).default({}),
  timeUse: z.record(isoDate, timeUseSchema).default({}),
});
export type IngestPayload = z.input<typeof ingestSchema>;
export type ParsedPayload = z.output<typeof ingestSchema>;
export type ParsedMeal = z.output<typeof mealSchema>;

export type IngestOptions = {
  /** Permite pisar días cerrados (el seed inicial y correcciones explícitas). */
  force?: boolean;
};

export type IngestResult = {
  days: string[];
  skippedClosed: string[];
  mealsInserted: number;
  mealsUpdated: number;
  timeUse: number;
};

const n = (v: number | null | undefined) => (v == null ? null : v);
const int = (v: number | null | undefined) => (v == null ? null : Math.round(v));

export async function ingest(db: Db, raw: unknown, opts: IngestOptions = {}): Promise<IngestResult> {
  const payload = ingestSchema.parse(raw);
  const res: IngestResult = { days: [], skippedClosed: [], mealsInserted: 0, mealsUpdated: 0, timeUse: 0 };

  await db.transaction(async (tx) => {
    const allDates = [...new Set([...Object.keys(payload.days), ...Object.keys(payload.timeUse)])].sort();
    for (const date of allDates) {
      const existing = (await tx.select().from(s.days).where(eq(s.days.date, date)))[0];
      if (existing?.closed && !opts.force) { res.skippedClosed.push(date); continue; }
      const p = payload.days[date] ?? {};

      const dayValues = {
        date,
        trainingDay: p.trainingDay !== undefined ? p.trainingDay : existing?.trainingDay ?? null,
        closed: p.closed ?? existing?.closed ?? false,
        note: p.note ?? existing?.note ?? '',
        estimatedTotals: p.estimatedTotals !== undefined ? p.estimatedTotals : existing?.estimatedTotals ?? null,
        migrated: p.migrated ?? existing?.migrated ?? false,
        updatedAt: new Date(),
      };
      await tx.insert(s.days).values(dayValues).onConflictDoUpdate({ target: s.days.date, set: dayValues });
      res.days.push(date);

      // Bloques 1:1 — undefined = no tocar, null = borrar.
      if (p.sleep !== undefined) {
        await tx.delete(s.sleep).where(eq(s.sleep.date, date));
        if (p.sleep) {
          const ph = p.sleep.phases;
          await tx.insert(s.sleep).values({
            date, durationMin: Math.round(p.sleep.duration_min), score: int(p.sleep.score),
            wakeEnergy: int(p.sleep.wakeEnergy), endEnergy: int(p.sleep.endEnergy),
            vigilia: n(ph?.vigilia), rem: n(ph?.rem), ligero: n(ph?.ligero), profundo: n(ph?.profundo),
          });
        }
      }
      if (p.training !== undefined) {
        await tx.delete(s.training).where(eq(s.training.date, date));
        if (p.training) {
          const t = p.training;
          await tx.insert(s.training).values({
            date, tipo: t.tipo, duracion: t.duracion ?? null, ejercicios: t.ejercicios ?? null,
            kcalActivas: n(t.kcalActivas), kcalTotal: n(t.kcalTotal), fcProm: t.fcProm ?? null,
            esfuerzo: t.esfuerzo ?? null, energia: t.energia ?? null, dolor: t.dolor ?? null,
          });
        }
      }
      if (p.activity !== undefined) {
        await tx.delete(s.activity).where(eq(s.activity.date, date));
        if (p.activity) {
          const a = p.activity;
          await tx.insert(s.activity).values({ date, steps: int(a.steps), activeKcal: n(a.activeKcal), restKcal: n(a.restKcal), totalEnergy: n(a.totalEnergy) });
        }
      }
      if (p.measurements !== undefined) {
        await tx.delete(s.measurements).where(eq(s.measurements.date, date));
        if (p.measurements) {
          const m = p.measurements;
          await tx.insert(s.measurements).values({ date, weight: n(m.weight), waist: n(m.waist), hip: n(m.hip) });
        }
      }

      if (p.meals?.length) {
        const [{ maxOrder }] = await tx
          .select({ maxOrder: sql<number>`coalesce(max(${s.meals.sortOrder}), -1)` })
          .from(s.meals).where(eq(s.meals.date, date));
        let order = Number(maxOrder) + 1;
        for (const m of p.meals) {
          const chatId = m.chatId ?? (m.id ? `${date}-legacy-${m.id}` : null);
          if (!chatId) throw new Error(`Comida sin chatId en ${date}: "${m.desc.slice(0, 40)}"`);
          const { category, original } = normalizeCategory(m.category);
          const values = {
            chatId, date, category, categoryOriginal: original, desc: m.desc,
            confidence: normalizeConfidence(m.confidence),
            kcal: n(m.kcal), protein: n(m.protein), carbs: n(m.carbs), fat: n(m.fat), fiber: n(m.fiber),
            calidadUltraprocesado: m.calidad?.ultraprocesado ?? null,
            calidadBeneficios: m.calidad?.beneficios ?? null,
            calidadPuntaje: int(m.calidad?.puntaje),
            items: m.items ?? null,
            updatedAt: new Date(),
          };
          const prev = (await tx.select({ id: s.meals.id }).from(s.meals).where(eq(s.meals.chatId, chatId)))[0];
          if (prev) {
            await tx.update(s.meals).set(values).where(eq(s.meals.id, prev.id));
            res.mealsUpdated++;
          } else {
            await tx.insert(s.meals).values({ ...values, sortOrder: order++ });
            res.mealsInserted++;
          }
        }
      }

      const tu = payload.timeUse[date];
      if (tu) {
        const v = {
          date, deporte: tu.deporte ?? 0, trabajoCorpo: tu.trabajoCorpo ?? 0, sideHustle: tu.sideHustle ?? 0,
          emprendedurismo: tu.emprendedurismo ?? 0, aprendizaje: tu.aprendizaje ?? 0, tiktok: tu.tiktok ?? 0,
          social: tu.social ?? 0, otros: tu.otros ?? 0, confirmed: true,
        };
        await tx.insert(s.timeUse).values(v).onConflictDoUpdate({ target: s.timeUse.date, set: v });
        res.timeUse++;
      }
    }
  });
  return res;
}
