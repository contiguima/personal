// Vista previa de una carga: qué comidas son nuevas o corrigen una existente,
// cómo queda el día contra el objetivo y si el día está cerrado. No escribe nada.
import { eq, inArray } from 'drizzle-orm';
import type { Db } from '@/db';
import * as s from '@/db/schema';
import { ingestSchema, type ParsedMeal, type ParsedPayload } from './ingest';
import { normalizeCategory, normalizeConfidence } from './constants';
import { dayTotals, fiberTip, remaining, targetFor, type Targets, type Totals } from './calc';

export type MealChange = {
  chatId: string;
  status: 'nueva' | 'corrige';
  category: string;
  desc: string;
  confidence: string | null;
  kcal: number | null; protein: number | null; carbs: number | null; fat: number | null; fiber: number | null;
  puntaje: number | null;
  items: NonNullable<ParsedMeal['items']> | null;
  before: { kcal: number | null; desc: string } | null;
};

export type DayPreview = {
  date: string;
  closed: boolean;
  trainingDay: boolean | null;
  meals: MealChange[];
  blocks: string[];
  totals: Totals | null;
  target: ReturnType<typeof targetFor>;
  missing: Totals | null;
  fiberTip: string | null;
};

export type Preview = { days: DayPreview[]; payload: ParsedPayload };

const slug = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** chatId estable: fecha-categoría, con sufijo si ya hay otra comida igual ese día. */
export function nextChatId(date: string, category: string, taken: Set<string>) {
  const base = `${date}-${slug(category)}`;
  let id = base;
  for (let i = 2; taken.has(id); i++) id = `${base}-${i}`;
  taken.add(id);
  return id;
}

export async function previewIngest(db: Db, raw: unknown, targets: Targets): Promise<Preview> {
  const payload = ingestSchema.parse(raw);
  const dates = [...new Set([...Object.keys(payload.days), ...Object.keys(payload.timeUse)])].sort();
  if (!dates.length) throw new Error('La carga está vacía.');

  const [days, meals] = await Promise.all([
    db.select().from(s.days).where(inArray(s.days.date, dates)),
    db.select().from(s.meals).where(inArray(s.meals.date, dates)),
  ]);

  const out: DayPreview[] = [];
  for (const date of dates) {
    const p = payload.days[date] ?? {};
    const existing = days.find((d) => d.date === date);
    const dayMeals = meals.filter((m) => m.date === date);
    const taken = new Set(dayMeals.map((m) => m.chatId));

    // Las comidas sin chatId (carga manual nueva) reciben uno acá; la confirmación usa este payload ya normalizado.
    const merged = new Map(dayMeals.map((m) => [m.chatId, { kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat, fiber: m.fiber }]));
    const changes: MealChange[] = [];
    for (const m of p.meals ?? []) {
      if (!m.chatId) m.chatId = nextChatId(date, m.category, taken);
      const prev = dayMeals.find((x) => x.chatId === m.chatId);
      const { category } = normalizeCategory(m.category);
      const v = { kcal: m.kcal ?? null, protein: m.protein ?? null, carbs: m.carbs ?? null, fat: m.fat ?? null, fiber: m.fiber ?? null };
      merged.set(m.chatId, v);
      changes.push({
        chatId: m.chatId, status: prev ? 'corrige' : 'nueva', category, desc: m.desc,
        confidence: normalizeConfidence(m.confidence), ...v, puntaje: m.calidad?.puntaje ?? null,
        items: m.items ?? null, before: prev ? { kcal: prev.kcal, desc: prev.desc } : null,
      });
    }

    const blocks: string[] = [];
    if (p.trainingDay !== undefined) blocks.push(p.trainingDay ? 'Marca el día como de entreno' : 'Marca el día como de descanso');
    if (p.sleep) blocks.push(`Sueño: ${Math.floor(p.sleep.duration_min / 60)}h${String(Math.round(p.sleep.duration_min % 60)).padStart(2, '0')}${p.sleep.score != null ? `, score ${p.sleep.score}` : ''}`);
    if (p.training) blocks.push(`Entreno: ${p.training.tipo}${p.training.duracion ? ` (${p.training.duracion})` : ''}${p.training.kcalActivas != null ? `, ${p.training.kcalActivas} kcal activas` : ''}`);
    if (p.activity) blocks.push(`Actividad: ${p.activity.steps ?? '—'} pasos, ${p.activity.activeKcal ?? '—'} activas, ${p.activity.restKcal ?? '—'} reposo`);
    if (p.measurements) blocks.push(`Medidas: ${p.measurements.weight ?? '—'} kg, cintura ${p.measurements.waist ?? '—'}, cadera ${p.measurements.hip ?? '—'}`);
    if (p.note !== undefined) blocks.push('Actualiza la nota del día');
    if (p.closed) blocks.push('Cierra el día');
    if (payload.timeUse[date]) blocks.push('Uso del tiempo del día');

    const trainingDay = p.trainingDay !== undefined ? p.trainingDay : existing?.trainingDay ?? null;
    const target = targetFor(trainingDay, targets);
    const totals = dayTotals([...merged.values()]);
    const missing = totals
      ? { kcal: remaining(totals.kcal, target.kcal), protein: remaining(totals.protein, target.protein), carbs: remaining(totals.carbs, target.carbs), fat: remaining(totals.fat, target.fat), fiber: remaining(totals.fiber, target.fiber) }
      : null;

    out.push({
      date, closed: !!existing?.closed, trainingDay, meals: changes, blocks, totals, target, missing,
      fiberTip: totals ? fiberTip(missing!.fiber, date) : null,
    });
  }
  return { days: out, payload };
}

export async function mealIdByChatId(db: Db, chatId: string) {
  const [r] = await db.select({ id: s.meals.id }).from(s.meals).where(eq(s.meals.chatId, chatId));
  return r?.id ?? null;
}
