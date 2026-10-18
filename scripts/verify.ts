// Compara la base contra data/bitacora_salud.jsx: conteos, totales y cada comida por chatId.
import { createDb } from '../src/db';
import * as s from '../src/db/schema';
import { loadLegacy, legacyTotals } from './legacy';

const close = (a: number, b: number) => Math.abs(a - b) < 1e-6;

async function main() {
  const db = createDb();
  const legacy = loadLegacy();
  const want = legacyTotals(legacy);

  const [days, meals, sleep, training, activity, measurements, timeUse] = await Promise.all([
    db.select().from(s.days), db.select().from(s.meals), db.select().from(s.sleep), db.select().from(s.training),
    db.select().from(s.activity), db.select().from(s.measurements), db.select().from(s.timeUse),
  ]);
  const sum = (k: 'kcal' | 'protein' | 'carbs' | 'fat' | 'fiber') => meals.reduce((a, m) => a + (m[k] ?? 0), 0);
  const tuKeys = ['deporte', 'trabajoCorpo', 'sideHustle', 'emprendedurismo', 'aprendizaje', 'tiktok', 'social', 'otros'] as const;
  const got = {
    days: days.length, meals: meals.length,
    kcal: sum('kcal'), protein: sum('protein'), carbs: sum('carbs'), fat: sum('fat'), fiber: sum('fiber'),
    sleep: sleep.length, training: training.length, activity: activity.length, measurements: measurements.length,
    timeUse: timeUse.length, timeUseHours: timeUse.reduce((a, t) => a + tuKeys.reduce((x, k) => x + t[k], 0), 0),
  };

  const errors: string[] = [];
  console.log('Campo'.padEnd(14), 'Archivo'.padStart(12), 'Base'.padStart(12));
  for (const k of Object.keys(want) as (keyof typeof want)[]) {
    const ok = close(want[k], got[k]);
    if (!ok) errors.push(`${k}: archivo ${want[k]} vs base ${got[k]}`);
    console.log(k.padEnd(14), String(+want[k].toFixed(2)).padStart(12), String(+got[k].toFixed(2)).padStart(12), ok ? '✓' : '✗');
  }

  // Comida por comida
  const byChat = new Map(meals.map((m) => [m.chatId, m]));
  for (const [date, d] of Object.entries(legacy.days)) {
    const dbDay = days.find((x) => x.date === date);
    if (!dbDay) { errors.push(`falta el día ${date}`); continue; }
    if (dbDay.closed !== !!d.closed) errors.push(`${date}: closed distinto`);
    if (dbDay.trainingDay !== (d.trainingDay ?? null)) errors.push(`${date}: trainingDay distinto`);
    if (dbDay.note !== (d.note ?? '')) errors.push(`${date}: nota distinta`);
    for (const m of d.meals) {
      const id = m.chatId ?? `${date}-legacy-${m.id}`;
      const row = byChat.get(id);
      if (!row) { errors.push(`falta la comida ${id}`); continue; }
      if (row.date !== date || row.desc !== m.desc) errors.push(`${id}: fecha o descripción distinta`);
      for (const k of ['kcal', 'protein', 'carbs', 'fat', 'fiber'] as const) {
        if ((row[k] ?? null) !== (m[k] ?? null)) errors.push(`${id}: ${k} ${m[k]} vs ${row[k]}`);
      }
      if ((row.calidadPuntaje ?? null) !== (m.calidad?.puntaje ?? null)) errors.push(`${id}: puntaje distinto`);
    }
  }

  if (errors.length) { console.error(`\n✗ ${errors.length} diferencias:\n` + errors.slice(0, 50).join('\n')); process.exit(1); }
  console.log('\n✓ La base coincide con el archivo original (días, comidas, macros, sueño, entreno, actividad, medidas y tiempo).');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
