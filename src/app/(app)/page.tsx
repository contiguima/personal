import { connection } from 'next/server';
import { Suspense } from 'react';
import { getDay, getDateBounds, getPreviousMeasurement, getTargets, getDayPhotos } from '@/lib/data';
import { addDays, fmtLong, isValidDate, minToHM, todayAR, weekdayIdx } from '@/lib/dates';
import { MACROS, balanceLabel, calorieBalance, dayTotals, fiberTip, remaining, round1, targetFor } from '@/lib/calc';
import { MEAL_CATEGORIES } from '@/lib/constants';
import { Card, CardTitle, Empty, PageHeader, Pill, PrevNext, Ring, Stat } from '@/components/ui';
import { MealCard } from '@/components/meal-card';
import { IconFuego, IconPasos, IconPesa } from '@/components/icons';
import { Luna, Nadadora, Palta, Pesa, Tostada } from '@/components/doodles';

export default function HoyPage({ searchParams }: PageProps<'/'>) {
  return (
    <Suspense fallback={<p className="p-6 text-ink-2">Cargando el día…</p>}>
      <Hoy searchParams={searchParams} />
    </Suspense>
  );
}

const MACRO_COLOR = { kcal: 'var(--m-kcal)', protein: 'var(--m-protein)', carbs: 'var(--m-carbs)', fat: 'var(--m-fat)', fiber: 'var(--m-fiber)' };

async function Hoy({ searchParams }: Pick<PageProps<'/'>, 'searchParams'>) {
  await connection(); // dinámica desde el principio: usa la fecha de hoy y la sesión
  const sp = await searchParams;
  const today = todayAR();
  const date = isValidDate(sp.fecha) ? sp.fecha : today;
  const [day, targets, bounds] = await Promise.all([getDay(date), getTargets(), getDateBounds()]);
  const isMonday = weekdayIdx(date) === 0;
  const prevMeas = isMonday ? await getPreviousMeasurement(date) : null;
  const photos = day ? await getDayPhotos(day.meals.map((m) => m.id)) : [];

  const meals = [...(day?.meals ?? [])].sort(
    (a, b) => MEAL_CATEGORIES.indexOf(a.category as never) - MEAL_CATEGORIES.indexOf(b.category as never) || a.sortOrder - b.sortOrder,
  );
  const totals = dayTotals(meals);
  const target = targetFor(day?.trainingDay ?? null, targets);
  const balance = day ? calorieBalance(day) : null;
  const proteinDone = totals && totals.protein >= target.protein[0];
  const tip = totals ? fiberTip(remaining(totals.fiber, target.fiber), date) : null;

  const prev = bounds.first && date > bounds.first ? `/?fecha=${addDays(date, -1)}` : null;
  const next = date < today ? (addDays(date, 1) === today ? '/' : `/?fecha=${addDays(date, 1)}`) : null;

  return (
    <div className="space-y-4">
      <PageHeader
        title={date === today ? 'Hoy' : fmtLong(date)}
        subtitle={
          <span className="flex flex-wrap items-center gap-1.5">
            {date === today && <span className="first-letter:uppercase">{fmtLong(date)}</span>}
            {day?.trainingDay === true && <Pill tone="coral">día de entreno</Pill>}
            {day?.trainingDay === false && <Pill tone="agua">día de descanso</Pill>}
            {day?.closed && <Pill tone="palta">cerrado ✓</Pill>}
          </span>
        }
      >
        <PrevNext prev={prev} next={next}>{date === today ? 'hoy' : fmtLong(date).split(' ').slice(1).join(' ')}</PrevNext>
      </PageHeader>

      {/* Macros */}
      <Card>
        <CardTitle right={day?.trainingDay ? 'objetivo entreno' : 'objetivo descanso'}>Macros del día</CardTitle>
        {totals ? (
          <>
            <div className="grid grid-cols-3 gap-y-4 sm:grid-cols-5">
              {MACROS.map((m) => (
                <Ring key={m.key} value={totals[m.key]} range={target[m.key]} label={m.label} unit={m.unit} color={MACRO_COLOR[m.key]} />
              ))}
            </div>
            {proteinDone && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-palta-soft p-3 text-sm">
                <Palta className="size-10 shrink-0" />
                <p><b>¡Llegaste a la proteína del día!</b> {round1(totals.protein)} g. Bien ahí.</p>
              </div>
            )}
            {tip && (
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-mostaza-soft p-3 text-sm">
                <span className="text-2xl" aria-hidden>🥦</span>
                <p>{tip}</p>
              </div>
            )}
          </>
        ) : day?.estimatedTotals ? (
          <EstimatedTotals est={day.estimatedTotals as Record<string, unknown>} />
        ) : (
          <Empty text="Todavía no hay comidas cargadas para este día." doodle={<Tostada className="size-16" />} />
        )}
      </Card>

      {/* Balance */}
      {balance != null && totals && day?.activity && (
        <Card delay={60}>
          <CardTitle icon={<IconFuego className="size-5" />}>Balance calórico</CardTitle>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-extrabold tabular-nums" style={{ color: balance < 0 ? 'var(--deficit)' : 'var(--superavit)' }}>
              {balance > 0 ? '+' : ''}{balance}
            </span>
            <span className="font-bold">{balanceLabel(balance)}</span>
          </div>
          <p className="mt-1 text-sm text-ink-2 tabular-nums">
            Consumiste {Math.round(totals.kcal)} · quemaste {Math.round((day.activity.restKcal ?? 0) + (day.activity.activeKcal ?? 0))} ({Math.round(day.activity.restKcal ?? 0)} reposo + {Math.round(day.activity.activeKcal ?? 0)} activas)
          </p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        {/* Comidas */}
        <Card delay={90}>
          <CardTitle right={`${meals.length} ${meals.length === 1 ? 'comida' : 'comidas'}`}>Comidas</CardTitle>
          {meals.length ? (
            <div className="space-y-2.5">
              {meals.map((m) => <MealCard key={m.id} meal={m} photos={photos.filter((p) => p.mealId === m.id)} />)}
            </div>
          ) : (
            <Empty text="Nada por acá todavía. Tocá Cargar y mandá la foto de lo que comiste." />
          )}
        </Card>

        <div className="space-y-4">
          {/* Sueño */}
          <Card delay={120}>
            <CardTitle icon={<Luna className="size-6" />}>Sueño</CardTitle>
            {day?.sleep ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Duración" value={minToHM(day.sleep.durationMin)} />
                  <Stat label="Score" value={day.sleep.score ?? '—'} />
                </div>
                {day.sleep.rem != null && <SleepPhasesBar s={day.sleep} />}
              </>
            ) : (
              <Empty text="Sin datos de sueño." doodle={<Luna className="size-12" />} />
            )}
          </Card>

          {/* Entreno */}
          <Card delay={150}>
            <CardTitle icon={<IconPesa className="size-5" />}>Entrenamiento</CardTitle>
            {day?.training ? (
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold">{day.training.tipo}</span>
                  {day.training.duracion && <Pill>{day.training.duracion}</Pill>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Kcal activas" value={day.training.kcalActivas ?? '—'} sub={day.training.kcalTotal ? `${day.training.kcalTotal} totales` : undefined} />
                  <Stat label="FC prom." value={day.training.fcProm ?? '—'} sub={day.training.esfuerzo ? `esfuerzo ${day.training.esfuerzo}` : undefined} />
                </div>
                {day.training.ejercicios && <p className="text-ink-2">{day.training.ejercicios}</p>}
                {day.training.dolor && day.training.dolor !== 'No' && <p className="text-coral">Dolor: {day.training.dolor}</p>}
              </div>
            ) : (
              <Empty text={day?.trainingDay === false ? 'Día de descanso. A recargar.' : 'Sin entrenamiento cargado.'} doodle={day?.trainingDay === false ? <Nadadora className="size-14" /> : <Pesa className="size-14" />} />
            )}
          </Card>

          {/* Actividad */}
          <Card delay={180}>
            <CardTitle icon={<IconPasos className="size-5" />}>Actividad</CardTitle>
            {day?.activity ? (
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Pasos" value={day.activity.steps?.toLocaleString('es-AR') ?? '—'} />
                <Stat label="Activas" value={Math.round(day.activity.activeKcal ?? 0)} />
                <Stat label="Reposo" value={Math.round(day.activity.restKcal ?? 0)} />
              </div>
            ) : (
              <p className="text-sm text-ink-2">Los datos del Watch se cargan al cerrar el día.</p>
            )}
          </Card>

          {/* Medición del lunes */}
          {isMonday && (
            <Card delay={210}>
              <CardTitle>Medición del lunes</CardTitle>
              {day?.measurements ? (
                <div className="grid grid-cols-3 gap-2">
                  {([['Peso', 'weight', 'kg'], ['Cintura', 'waist', 'cm'], ['Cadera', 'hip', 'cm']] as const).map(([label, k, u]) => {
                    const v = day.measurements![k];
                    const p = prevMeas?.[k];
                    const diff = v != null && p != null ? round1(v - p) : null;
                    return <Stat key={k} label={label} value={v != null ? `${String(v).replace('.', ',')} ${u}` : '—'} sub={diff != null ? `${diff > 0 ? '+' : ''}${String(diff).replace('.', ',')} vs ${prevMeas!.date.slice(8)}/${prevMeas!.date.slice(5, 7)}` : undefined} />;
                  })}
                </div>
              ) : (
                <p className="text-sm text-ink-2">Es lunes: toca medir peso, cintura y cadera. Cargalo desde Cargar.</p>
              )}
            </Card>
          )}
        </div>
      </div>

      {day?.note && (
        <Card delay={240}>
          <CardTitle>Nota del día</CardTitle>
          <p className="text-sm leading-relaxed whitespace-pre-line text-ink-2">{day.note}</p>
        </Card>
      )}
    </div>
  );
}

function SleepPhasesBar({ s }: { s: { vigilia: number | null; rem: number | null; ligero: number | null; profundo: number | null } }) {
  const phases = [
    { k: 'Vigilia', v: s.vigilia ?? 0, c: 'var(--coral)' },
    { k: 'REM', v: s.rem ?? 0, c: 'var(--m-fat)' },
    { k: 'Ligero', v: s.ligero ?? 0, c: 'var(--agua)' },
    { k: 'Profundo', v: s.profundo ?? 0, c: 'var(--t-otros)' },
  ];
  const total = phases.reduce((a, p) => a + p.v, 0) || 1;
  return (
    <div className="mt-3">
      <div className="flex h-3 gap-[2px] overflow-hidden rounded-full">
        {phases.map((p) => p.v > 0 && <div key={p.k} style={{ width: `${(p.v / total) * 100}%`, background: p.c }} title={`${p.k} ${p.v}%`} />)}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-2">
        {phases.map((p) => (
          <span key={p.k} className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ background: p.c }} />{p.k} <b className="tabular-nums text-ink">{p.v}%</b></span>
        ))}
      </div>
    </div>
  );
}

function EstimatedTotals({ est }: { est: Record<string, unknown> }) {
  const rows = [['Kcal', 'kcal', ''], ['Proteína', 'protein', ' g'], ['Carbos', 'carbs', ' g'], ['Grasa', 'fat', ' g']] as const;
  return (
    <div className="space-y-2 text-sm">
      <p className="text-ink-2">Este día no tiene comidas detalladas, solo una estimación por rango{est.confidence ? ` (confianza ${String(est.confidence)})` : ''}.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rows.map(([label, k, u]) => {
          const r = est[k] as [number, number] | undefined;
          return <Stat key={k} label={label} value={r ? `${r[0]}–${r[1]}${u}` : '—'} />;
        })}
      </div>
      {typeof est.balance === 'string' && <p className="text-ink-2">Balance: {est.balance}</p>}
    </div>
  );
}
