import { connection } from 'next/server';
import { Suspense } from 'react';
import { getTimeUse } from '@/lib/data';
import { TIME_CATEGORIES } from '@/lib/constants';
import { addDays, fmtLong, fmtShort, isValidDate, mondayOf, todayAR, weekdayShort } from '@/lib/dates';
import { round1 } from '@/lib/calc';
import { Card, CardTitle, Empty, PageHeader, PrevNext } from '@/components/ui';
import { StackedBars, type Series } from '@/components/charts';
import { Mate } from '@/components/doodles';

export default function TiempoPage({ searchParams }: PageProps<'/tiempo'>) {
  return (
    <div className="space-y-4">
      <Suspense fallback={<p className="p-6 text-ink-2">Cargando…</p>}>
        <Tiempo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const SERIES: Series[] = TIME_CATEGORIES.map((c) => ({ key: c.key, label: c.label, color: `var(--t-${c.key})`, unit: ' h' }));
const h = (n: number) => String(round1(n)).replace('.', ',');
const WEEKS = 8;

async function Tiempo({ searchParams }: Pick<PageProps<'/tiempo'>, 'searchParams'>) {
  await connection(); // dinámica desde el principio: usa la fecha de hoy y la sesión
  const sp = await searchParams;
  const today = todayAR();
  const thisMonday = mondayOf(today);
  const monday = mondayOf(isValidDate(sp.semana) ? sp.semana : today);
  const sunday = addDays(monday, 6);
  const histFrom = addDays(monday, -7 * (WEEKS - 1));
  const rows = await getTimeUse(histFrom, sunday);

  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map((date) => {
    const t = rows.find((r) => r.date === date);
    return { label: weekdayShort(date), full: fmtLong(date), ...Object.fromEntries(TIME_CATEGORIES.map((c) => [c.key, t ? t[c.key] : null])) };
  });
  const weekRows = rows.filter((r) => r.date >= monday && r.date <= sunday);
  const totals = TIME_CATEGORIES.map((c) => ({ ...c, hours: weekRows.reduce((a, r) => a + r[c.key], 0) }));
  const weekTotal = totals.reduce((a, t) => a + t.hours, 0);

  const weekly = Array.from({ length: WEEKS }, (_, i) => addDays(histFrom, i * 7)).map((m) => {
    const rs = rows.filter((r) => r.date >= m && r.date <= addDays(m, 6));
    return { label: fmtShort(m), full: `Semana del ${fmtShort(m)}`, ...Object.fromEntries(TIME_CATEGORIES.map((c) => [c.key, round1(rs.reduce((a, r) => a + r[c.key], 0))])) };
  });

  const prev = `/tiempo?semana=${addDays(monday, -7)}`;
  const next = monday < thisMonday ? (addDays(monday, 7) === thisMonday ? '/tiempo' : `/tiempo?semana=${addDays(monday, 7)}`) : null;

  return (
    <>
      <PageHeader title="Tiempo" subtitle={`${fmtShort(monday)} → ${fmtShort(sunday)}`}>
        <PrevNext prev={prev} next={next}>{monday === thisMonday ? 'esta semana' : `sem. del ${fmtShort(monday)}`}</PrevNext>
      </PageHeader>

      <Card>
        <CardTitle right={`${h(weekTotal)} h registradas`}>Horas por día</CardTitle>
        {weekRows.length ? <StackedBars data={week} x="label" series={SERIES} unit=" h" /> : <Empty text="Sin uso del tiempo esta semana. Se completa al cerrar cada día." doodle={<Mate className="size-14" />} />}
      </Card>

      {weekRows.length > 0 && (
        <Card delay={60}>
          <CardTitle>Total de la semana</CardTitle>
          <table className="w-full text-sm">
            <caption className="sr-only">Horas por categoría en la semana</caption>
            <tbody className="divide-y divide-line">
              {totals.filter((t) => t.hours > 0).sort((a, b) => b.hours - a.hours).map((t) => (
                <tr key={t.key}>
                  <th scope="row" className="py-2 text-left font-semibold">
                    <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: `var(--t-${t.key})` }} />{t.label}</span>
                  </th>
                  <td className="w-1/2 px-2">
                    <div className="h-2 rounded-full bg-card-2">
                      <div className="h-2 rounded-full" style={{ width: `${(t.hours / Math.max(...totals.map((x) => x.hours))) * 100}%`, background: `var(--t-${t.key})` }} />
                    </div>
                  </td>
                  <td className="py-2 text-right font-bold whitespace-nowrap tabular-nums">{h(t.hours)} h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card delay={90}>
        <CardTitle>Últimas {WEEKS} semanas</CardTitle>
        {rows.length ? <StackedBars data={weekly} x="label" series={SERIES} unit=" h" height={260} /> : <Empty text="Sin datos." />}
      </Card>
    </>
  );
}
