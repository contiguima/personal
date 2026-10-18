import { Suspense } from 'react';
import { getMeasurements, getSleepSeries, getDateBounds } from '@/lib/data';
import { addDays, fmtLong, fmtShort, minToHM, todayAR } from '@/lib/dates';
import { avg, round1 } from '@/lib/calc';
import { Card, CardTitle, Empty, PageHeader, Stat } from '@/components/ui';
import { StackedBars, TrendChart } from '@/components/charts';
import { Luna } from '@/components/doodles';

export default function CuerpoPage({ searchParams }: PageProps<'/cuerpo'>) {
  return (
    <div className="space-y-4">
      <PageHeader title="Cuerpo y sueño" subtitle="Medición de los lunes y cómo venís durmiendo" />
      <Suspense fallback={<p className="p-6 text-ink-2">Cargando…</p>}>
        <Cuerpo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const RANGES = { '30': 30, '90': 90, todo: 0 } as const;
type RangeKey = keyof typeof RANGES;
const c = (n: number | null | undefined) => (n == null ? '—' : String(round1(n)).replace('.', ','));

async function Cuerpo({ searchParams }: Pick<PageProps<'/cuerpo'>, 'searchParams'>) {
  const sp = await searchParams;
  const rk: RangeKey = typeof sp.rango === 'string' && sp.rango in RANGES ? (sp.rango as RangeKey) : '30';
  const today = todayAR();
  const bounds = await getDateBounds();
  const from = RANGES[rk] ? addDays(today, -RANGES[rk] + 1) : bounds.first ?? today;
  const [measurements, sleep] = await Promise.all([getMeasurements(), getSleepSeries(from, today)]);

  const first = measurements[0];
  const last = measurements.at(-1);
  const meas = measurements.map((m) => ({ label: fmtShort(m.date), full: fmtLong(m.date), weight: m.weight, waist: m.waist, hip: m.hip }));
  const sl = sleep.map((s) => ({
    label: fmtShort(s.date), full: fmtLong(s.date), horas: round1(s.durationMin / 60), score: s.score,
    vigilia: s.vigilia, rem: s.rem, ligero: s.ligero, profundo: s.profundo,
  }));
  const withPhases = sl.filter((s) => s.rem != null);

  return (
    <>
      <Card>
        <CardTitle right={first && last ? `desde ${fmtShort(first.date)}` : undefined}>Medidas</CardTitle>
        {last && first ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {([['Peso', 'weight', 'kg'], ['Cintura', 'waist', 'cm'], ['Cadera', 'hip', 'cm']] as const).map(([label, k, u]) => {
                const d = last[k] != null && first[k] != null ? last[k]! - first[k]! : null;
                return <Stat key={k} label={label} value={`${c(last[k])} ${u}`} sub={d != null ? `${d > 0 ? '+' : ''}${c(d)} ${u} en total` : undefined} />;
              })}
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="mb-1 text-sm font-bold text-ink-2">Peso (kg)</h3>
                <TrendChart data={meas} x="label" series={[{ key: 'weight', label: 'Peso', color: 'var(--palta)', unit: ' kg' }]} />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-bold text-ink-2">Cintura y cadera (cm)</h3>
                <TrendChart data={meas} x="label" series={[{ key: 'waist', label: 'Cintura', color: 'var(--coral)', unit: ' cm' }, { key: 'hip', label: 'Cadera', color: 'var(--agua)', unit: ' cm' }]} />
              </div>
            </div>
          </>
        ) : (
          <Empty text="Todavía no hay mediciones. Los lunes toca medir." />
        )}
      </Card>

      <Card delay={60}>
        <CardTitle
          icon={<Luna className="size-6" />}
          right={
            <span className="flex gap-1">
              {(Object.keys(RANGES) as RangeKey[]).map((k) => (
                <a key={k} href={`/cuerpo?rango=${k}`} className={`rounded-full px-2.5 py-1 text-xs font-bold ${k === rk ? 'bg-agua-soft text-agua' : 'text-ink-2'}`}>
                  {k === 'todo' ? 'todo' : `${k} días`}
                </a>
              ))}
            </span>
          }
        >
          Sueño
        </CardTitle>
        {sl.length ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Duración prom." value={minToHM(avg(sleep.map((s) => s.durationMin)))} />
              <Stat label="Score prom." value={c(avg(sleep.map((s) => s.score)))} />
              <Stat label="Noches" value={sleep.length} />
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="mb-1 text-sm font-bold text-ink-2">Duración (horas)</h3>
                <TrendChart data={sl} x="label" series={[{ key: 'horas', label: 'Horas', color: 'var(--agua)', unit: ' h' }]} band={[7, 9]} />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-bold text-ink-2">Score</h3>
                <TrendChart data={sl} x="label" series={[{ key: 'score', label: 'Score', color: 'var(--m-fat)' }]} domain={[40, 100]} />
              </div>
            </div>
            {withPhases.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-1 text-sm font-bold text-ink-2">Fases (%)</h3>
                <StackedBars
                  data={withPhases} x="label" unit="%" height={220}
                  series={[
                    { key: 'profundo', label: 'Profundo', color: 'var(--t-otros)' },
                    { key: 'ligero', label: 'Ligero', color: 'var(--agua)' },
                    { key: 'rem', label: 'REM', color: 'var(--m-fat)' },
                    { key: 'vigilia', label: 'Vigilia', color: 'var(--coral)' },
                  ]}
                />
              </div>
            )}
          </>
        ) : (
          <Empty text="Sin datos de sueño en este rango." doodle={<Luna className="size-14" />} />
        )}
      </Card>
    </>
  );
}
