import type { DayTargets, Range } from './constants';
import type * as s from '@/db/schema';

export type Meal = typeof s.meals.$inferSelect;
export type DayFull = typeof s.days.$inferSelect & {
  meals: Meal[];
  sleep: typeof s.sleep.$inferSelect | null;
  training: typeof s.training.$inferSelect | null;
  activity: typeof s.activity.$inferSelect | null;
  measurements: typeof s.measurements.$inferSelect | null;
  timeUse: typeof s.timeUse.$inferSelect | null;
};
export type Targets = { training: DayTargets; rest: DayTargets };

export const MACROS = [
  { key: 'kcal', label: 'Kcal', unit: '' },
  { key: 'protein', label: 'Proteína', unit: 'g' },
  { key: 'carbs', label: 'Carbos', unit: 'g' },
  { key: 'fat', label: 'Grasa', unit: 'g' },
  { key: 'fiber', label: 'Fibra', unit: 'g' },
] as const;
export type MacroKey = (typeof MACROS)[number]['key'];
export type Totals = Record<MacroKey, number>;

/** Totales del día, o null si ninguna comida tiene macros estimados. */
export function dayTotals(meals: Pick<Meal, MacroKey>[]): Totals | null {
  const withData = meals.filter((m) => m.kcal != null);
  if (!withData.length) return null;
  const t: Totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  for (const m of withData) for (const k of Object.keys(t) as MacroKey[]) t[k] += m[k] ?? 0;
  return t;
}

export function targetFor(trainingDay: boolean | null, targets: Targets): DayTargets {
  return trainingDay ? targets.training : targets.rest;
}

export type RangeStatus = 'bajo' | 'ok' | 'alto';
export function rangeStatus(v: number, [min, max]: Range): RangeStatus {
  return v < min ? 'bajo' : v > max ? 'alto' : 'ok';
}

/** Lo que falta para llegar al mínimo del rango (0 si ya llegó). */
export function remaining(v: number, [min]: Range) {
  return Math.max(0, min - v);
}

/**
 * Balance calórico = consumidas − (reposo + activas). Negativo = déficit.
 * null si falta la actividad del Watch o no hay comidas estimadas.
 */
export function calorieBalance(day: Pick<DayFull, 'activity' | 'meals'>): number | null {
  const t = dayTotals(day.meals);
  const a = day.activity;
  if (!t || !a || a.restKcal == null || a.activeKcal == null) return null;
  return Math.round(t.kcal - (a.restKcal + a.activeKcal));
}

export function balanceLabel(b: number) {
  if (Math.abs(b) < 50) return 'Mantenimiento';
  return b < 0 ? `Déficit de ${Math.abs(b)} kcal` : `Superávit de ${b} kcal`;
}

export function avg(values: (number | null | undefined)[]): number | null {
  const v = values.filter((x): x is number => x != null && !Number.isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

export const round1 = (n: number) => Math.round(n * 10) / 10;

// Sugerencia de verdura cuando falta fibra (rota por día para no repetir siempre lo mismo).
const FIBER_TIPS = [
  { veg: 'brócoli', portion: '1 taza (~90 g)', fiber: 5 },
  { veg: 'espinaca', portion: '1 taza cocida (~180 g)', fiber: 4 },
  { veg: 'zanahoria', portion: '1 mediana rallada (~80 g)', fiber: 2.5 },
];
export function fiberTip(missing: number, date: string) {
  if (missing <= 0) return null;
  const tip = FIBER_TIPS[Number(date.slice(-2)) % FIBER_TIPS.length];
  return `Te faltan ${round1(missing)} g de fibra: sumá ${tip.veg} en la próxima comida — ${tip.portion} son ~${tip.fiber} g.`;
}
