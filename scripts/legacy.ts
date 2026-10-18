// Lee data/bitacora_salud.jsx (el artefacto original), evalúa sus constantes de datos
// y reproduce exactamente el merge que hacía el artefacto (SEED_DAYS + CHAT_UPDATES + TIME_USE_UPDATES).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type LegacyMeal = Record<string, any> & { category: string; desc: string };
export type LegacyDay = Record<string, any> & { meals: LegacyMeal[] };
export type Legacy = { days: Record<string, LegacyDay>; timeUse: Record<string, Record<string, number>> };

export function loadLegacy(file = join(process.cwd(), 'data/bitacora_salud.jsx')): Legacy {
  const src = readFileSync(file, 'utf8');
  const start = src.indexOf('const TZ');
  const end = src.indexOf('function normalizeActivityKeys');
  if (start < 0 || end < 0) throw new Error('No encontré los bloques de datos en el .jsx');
  const code = src.slice(start, end) + '\n;({ SEED_DAYS, CHAT_UPDATES, TIME_USE_UPDATES })';
  const { SEED_DAYS, CHAT_UPDATES, TIME_USE_UPDATES } = vm.runInNewContext(code, { Intl, Date, Math, String, Number });

  const days: Record<string, LegacyDay> = JSON.parse(JSON.stringify(SEED_DAYS));
  for (const [date, patch] of Object.entries<any>(CHAT_UPDATES.days)) {
    const existing = days[date];
    if (existing && existing.closed) continue; // el artefacto no tocaba días cerrados
    const base: LegacyDay = existing || { date, trainingDay: null, closed: false, meals: [], training: null, sleep: null, measurements: null, activity: null, estimatedTotals: null, note: '' };
    const meals = [...(base.meals || [])];
    for (const m of patch.meals || []) {
      const i = meals.findIndex((x) => x.chatId && x.chatId === m.chatId);
      if (i === -1) meals.push({ ...m }); else meals[i] = { ...meals[i], ...m };
    }
    const pick = (k: string) => (patch[k] !== undefined ? patch[k] : base[k]);
    days[date] = {
      ...base, meals,
      trainingDay: pick('trainingDay'), training: pick('training'), sleep: pick('sleep'),
      measurements: pick('measurements'), activity: pick('activity'),
      estimatedTotals: pick('estimatedTotals'), note: pick('note'), closed: pick('closed'),
    };
  }
  // normalizeActivityKeys del artefacto
  for (const d of Object.values(days)) {
    const a = d.activity;
    if (a && (a.restingKcal !== undefined || a.activeEnergy !== undefined || a.restEnergy !== undefined)) {
      const { restingKcal, activeEnergy, restEnergy, ...rest } = a;
      d.activity = { ...rest, activeKcal: rest.activeKcal ?? activeEnergy ?? null, restKcal: rest.restKcal ?? restEnergy ?? restingKcal ?? null };
    }
  }
  return { days, timeUse: TIME_USE_UPDATES.days };
}

export function legacyTotals(l: Legacy) {
  const meals = Object.values(l.days).flatMap((d) => d.meals);
  const sum = (k: string) => meals.reduce((a, m) => a + (Number(m[k]) || 0), 0);
  return {
    days: Object.keys(l.days).length,
    meals: meals.length,
    kcal: sum('kcal'), protein: sum('protein'), carbs: sum('carbs'), fat: sum('fat'), fiber: sum('fiber'),
    sleep: Object.values(l.days).filter((d) => d.sleep).length,
    training: Object.values(l.days).filter((d) => d.training).length,
    activity: Object.values(l.days).filter((d) => d.activity).length,
    measurements: Object.values(l.days).filter((d) => d.measurements).length,
    timeUse: Object.keys(l.timeUse).length,
    timeUseHours: Object.values(l.timeUse).reduce((a, t) => a + Object.values(t).reduce((x, y) => x + (Number(y) || 0), 0), 0),
  };
}
