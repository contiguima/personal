'use client';

import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

type Row = Record<string, string | number | null>;
export type Series = { key: string; label: string; color: string; unit?: string };

const axis = { stroke: 'var(--ink-3)', fontSize: 11, tickLine: false, axisLine: false } as const;
const fmt = (v: unknown, unit = '') => (typeof v === 'number' ? `${String(Math.round(v * 100) / 100).replace('.', ',')}${unit}` : '—');

// Las funciones no cruzan de servidor a cliente: el título del tooltip sale del campo `full` de cada fila.
function TipBox({ active, payload, label, series }: {
  active?: boolean; payload?: { dataKey?: string | number; value?: unknown; payload?: Row }[]; label?: string | number; series: Series[];
}) {
  if (!active || !payload?.length) return null;
  const rows = series.map((s) => ({ s, v: payload.find((p) => p.dataKey === s.key)?.value })).filter((r) => r.v != null);
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-bold">{payload[0]?.payload?.full ?? label}</div>
      {rows.map(({ s, v }) => (
        <div key={s.key} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: s.color }} />
          <span className="text-ink-2">{s.label}</span>
          <b className="ml-auto pl-3 tabular-nums">{fmt(v, s.unit)}</b>
        </div>
      ))}
    </div>
  );
}

export function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-2">
      {series.map((s) => (
        <span key={s.key} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: s.color }} />{s.label}</span>
      ))}
    </div>
  );
}

/** Líneas de una misma unidad (un solo eje). */
export function TrendChart({ data, x, series, height = 200, domain, band, }: {
  data: Row[]; x: string; series: Series[]; height?: number; domain?: [number | 'auto', number | 'auto']; band?: [number, number];
}) {
  return (
    <div>
      <Legend series={series} />
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="0" vertical={false} />
          <XAxis dataKey={x} {...axis} minTickGap={16} />
          <YAxis {...axis} domain={domain ?? ['auto', 'auto']} width={40} tickFormatter={(v) => fmt(v)} />
          {band && <ReferenceArea y1={band[0]} y2={band[1]} fill="var(--palta)" fillOpacity={0.08} />}
          <Tooltip content={<TipBox series={series} />} cursor={{ stroke: 'var(--ink-3)', strokeWidth: 1 }} />
          {series.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} connectNulls
              dot={data.length > 31 ? false : { r: 3.5, fill: s.color, stroke: 'var(--card)', strokeWidth: 2 }} activeDot={{ r: 5, stroke: 'var(--card)', strokeWidth: 2 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Barras apiladas (horas por categoría, fases de sueño). */
export function StackedBars({ data, x, series, height = 240, unit }: {
  data: Row[]; x: string; series: Series[]; height?: number; unit?: string;
}) {
  const withUnit = series.map((s) => ({ ...s, unit: s.unit ?? unit }));
  return (
    <div>
      <Legend series={series} />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }} barCategoryGap="18%">
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey={x} {...axis} minTickGap={8} />
          <YAxis {...axis} width={40} />
          <Tooltip content={<TipBox series={withUnit} />} cursor={{ fill: 'var(--card-2)' }} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} stackId="a" fill={s.color} stroke="var(--card)" strokeWidth={1}
              radius={i === series.length - 1 ? [4, 4, 0, 0] : 0} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Balance diario: divergente, déficit (agua) abajo / superávit (coral) arriba. */
export function BalanceBars({ data, height = 200 }: { data: { label: string; balance: number | null }[]; height?: number }) {
  const series: Series[] = [{ key: 'balance', label: 'Balance', color: 'var(--ink-2)', unit: ' kcal' }];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -6 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" {...axis} />
        <YAxis {...axis} width={46} />
        <ReferenceLine y={0} stroke="var(--ink-3)" />
        <Tooltip content={<TipBox series={series} />} cursor={{ fill: 'var(--card-2)' }} />
        <Bar dataKey="balance" radius={4}>
          {data.map((d) => <Cell key={d.label} fill={(d.balance ?? 0) < 0 ? 'var(--deficit)' : 'var(--superavit)'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
