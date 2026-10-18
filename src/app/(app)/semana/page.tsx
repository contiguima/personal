import { Suspense } from 'react';
import Link from 'next/link';
import { getDays, getMeasurements, getTargets, getDateBounds } from '@/lib/data';
import { addDays, fmtShort, isValidDate, isWeekend, minToHM, mondayOf, todayAR, weekdayName, weekdayShort, fmtLong } from '@/lib/dates';
import { avg, calorieBalance, dayTotals, rangeStatus, round1, targetFor } from '@/lib/calc';
import { Card, CardTitle, Empty, PageHeader, Pill, PrevNext, Stat } from '@/components/ui';
import { BalanceBars, TrendChart } from '@/components/charts';
import { Mate } from '@/components/doodles';

export default function SemanaPage({ searchParams }: PageProps<'/semana'>) {
  return (
    <Suspense fallback={<p className="p-6 text-ink-2">Cargando la semana…</p>}>
      <Semana searchParams={searchParams} />
    </Suspense>
  );
}

const r = (n: number | null, d = 0) => (n == null ? '—' : String(d ? round1(n) : Math.round(n)).replace('.', ','));

async function Semana({ searchParams }: Pick<PageProps<'/semana'>, 'searchParams'>) {
  const sp = await searchParams;
  const today = todayAR();
  const monday = mondayOf(isValidDate(sp.semana) ? sp.semana : today);
  const sunday = addDays(monday, 6);
  const [days, targets, measurements, bounds] = await Promise.all([getDays(monday, sunday), getTargets(), getMeasurements(), getDateBounds()]);

  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map((date) => {
    const day = days.find((d) => d.date === date) ?? null;
    const totals = day ? dayTotals(day.meals) : null;
    return { date, day, totals, balance: day ? calorieBalance(day) : null, target: targetFor(day?.trainingDay ?? null, targets) };
  });
  const withFood = week.filter((w) => w.totals);
  const avgKcal = avg(withFood.map((w) => w.totals!.kcal));
  const avgProt = avg(withFood.map((w) => w.totals!.protein));
  const avgFiber = avg(withFood.map((w) => w.totals!.fiber));
  const avgSleep = avg(week.map((w) => w.day?.sleep?.durationMin));
  const avgScore = avg(week.map((w) => w.day?.sleep?.score));
  const trainingDays = week.filter((w) => w.day?.trainingDay === true).length;
  const restDays = week.filter((w) => w.day?.trainingDay === false).length;

  // Finde vs semana: tono amable, nada de compensaciones.
  const wkend = withFood.filter((w) => isWeekend(w.date));
  const wkday = withFood.filter((w) => !isWeekend(w.date));
  const wkendKcal = avg(wkend.map((w) => w.totals!.kcal));
  const wkdayKcal = avg(wkday.map((w) => w.totals!.kcal));
  const wkendOver = wkend.filter((w) => w.totals!.kcal > w.target.kcal[1]);

  const weekMeas = measurements.filter((m) => m.date <= sunday);
  const lastMeas = weekMeas.at(-1);
  const prevMeas = weekMeas.at(-2);
  const measSeries = weekMeas.slice(-10).map((m) => ({ label: fmtShort(m.date), full: fmtLong(m.date), weight: m.weight, waist: m.waist, hip: m.hip }));

  const thisMonday = mondayOf(today);
  const prev = bounds.first && monday > bounds.first ? `/semana?semana=${addDays(monday, -7)}` : null;
  const next = monday < thisMonday ? (addDays(monday, 7) === thisMonday ? '/semana' : `/semana?semana=${addDays(monday, 7)}`) : null;

  return (
    <div className="space-y-4">
      <PageHeader title="Semana" subtitle={`${fmtShort(monday)} → ${fmtShort(sunday)}`}>
        <PrevNext prev={prev} next={next}>{monday === thisMonday ? 'esta semana' : `sem. del ${fmtShort(monday)}`}</PrevNext>
      </PageHeader>

      <Card>
        <CardTitle>Promedios</CardTitle>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Sueño" value={avgSleep != null ? minToHM(avgSleep) : '—'} />
          <Stat label="Score sueño" value={r(avgScore)} />
          <Stat label="Kcal" value={r(avgKcal)} sub={`${withFood.length} días con comidas`} />
          <Stat label="Proteína" value={avgProt != null ? `${r(avgProt)} g` : '—'} />
          <Stat label="Fibra" value={avgFiber != null ? `${r(avgFiber, 1)} g` : '—'} />
          <Stat label="Entreno / descanso" value={`${trainingDays} / ${restDays}`} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card delay={60}>
          <CardTitle>Balance calórico por día</CardTitle>
          {week.some((w) => w.balance != null) ? (
            <>
              <BalanceBars data={week.map((w) => ({ label: weekdayShort(w.date), balance: w.balance }))} />
              <p className="mt-1 text-xs text-ink-2">Abajo de 0 = déficit · arriba = superávit. Solo días con datos del Watch.</p>
            </>
          ) : (
            <Empty text="Sin datos de actividad esta semana." doodle={<Mate className="size-14" />} />
          )}
        </Card>

        <Card delay={90}>
          <CardTitle>Día por día</CardTitle>
          <ul className="divide-y divide-line text-sm">
            {week.map((w) => {
              const st = w.totals ? rangeStatus(w.totals.kcal, w.target.kcal) : null;
              return (
                <li key={w.date}>
                  <Link href={`/?fecha=${w.date}`} className={`flex items-center gap-2 py-2 hover:text-palta ${isWeekend(w.date) ? 'font-semibold' : ''}`}>
                    <span className="w-16 capitalize">{weekdayShort(w.date)} {w.date.slice(8)}</span>
                    {w.day?.trainingDay === true ? <Pill tone="coral">entreno</Pill> : w.day?.trainingDay === false ? <Pill tone="agua">descanso</Pill> : <Pill>—</Pill>}
                    <span className="ml-auto tabular-nums">{w.totals ? `${r(w.totals.kcal)} kcal · ${r(w.totals.protein)} g prot` : <span className="text-ink-3">sin comidas</span>}</span>
                    {st && <span className={`size-2 rounded-full ${st === 'ok' ? 'bg-palta' : st === 'alto' ? 'bg-mostaza' : 'bg-ink-3'}`} title={st === 'ok' ? 'en rango' : st === 'alto' ? 'arriba del rango' : 'abajo del rango'} />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 flex gap-3 text-xs text-ink-2">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-palta" />en rango</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-mostaza" />arriba</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-ink-3" />abajo</span>
          </p>
        </Card>
      </div>

      {wkend.length > 0 && (
        <Card delay={120} className="bg-mostaza-soft/60">
          <CardTitle>El finde 🧉</CardTitle>
          <p className="text-sm text-ink-2">
            {wkendOver.length > 0
              ? `El ${wkendOver.map((w) => `${weekdayName(w.date)} (${r(w.totals!.kcal)} kcal)`).join(' y el ')} te pasaste un poco del rango. Pasa, el finde es social y está bien. El lunes se vuelve a la estructura de siempre, sin compensar.`
              : `Finde dentro de rango: ${r(wkendKcal)} kcal de promedio${wkdayKcal != null ? ` (${r(wkdayKcal)} entre semana)` : ''}. ¡Re bien!`}
          </p>
        </Card>
      )}

      <Card delay={150}>
        <CardTitle right={lastMeas ? `última: ${fmtShort(lastMeas.date)}` : undefined}>Medidas</CardTitle>
        {lastMeas ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {([['Peso', 'weight', 'kg'], ['Cintura', 'waist', 'cm'], ['Cadera', 'hip', 'cm']] as const).map(([label, k, u]) => {
                const v = lastMeas[k];
                const d = v != null && prevMeas?.[k] != null ? round1(v - prevMeas[k]!) : null;
                return <Stat key={k} label={label} value={`${r(v, 1)} ${u}`} sub={d != null ? `${d > 0 ? '+' : ''}${r(d, 1)} vs anterior` : undefined} />;
              })}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-1 text-sm font-bold text-ink-2">Peso (kg)</h3>
                <TrendChart data={measSeries} x="label" series={[{ key: 'weight', label: 'Peso', color: 'var(--palta)', unit: ' kg' }]} height={160} />
              </div>
              <TrendChart data={measSeries} x="label" series={[{ key: 'waist', label: 'Cintura', color: 'var(--coral)', unit: ' cm' }, { key: 'hip', label: 'Cadera', color: 'var(--agua)', unit: ' cm' }]} height={160} />
            </div>
          </>
        ) : (
          <Empty text="Todavía no hay mediciones." />
        )}
      </Card>
    </div>
  );
}
