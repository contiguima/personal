import { MACROS, rangeStatus } from '@/lib/calc';
import type { Preview } from '@/lib/preview';
import { fmtLong } from '@/lib/dates';
import { CONF_TONE, Pill, ScoreBadge } from '@/components/ui';

const n = (v: number | null | undefined, d = 1) => (v == null ? '—' : String(Math.round(v * 10 ** d) / 10 ** d).replace('.', ','));

/** Tabla de la carga + total del día vs objetivo y lo que falta. */
export function PreviewView({ preview, after = false }: { preview: Preview; after?: boolean }) {
  return (
    <div className="space-y-3">
      {preview.days.map((d) => (
        <section key={d.date} className="aparecer space-y-3 rounded-3xl border border-line bg-card p-4">
          <header className="flex flex-wrap items-center gap-2">
            <h2 className="font-extrabold first-letter:uppercase">{fmtLong(d.date)}</h2>
            {d.trainingDay === true && <Pill tone="coral">entreno</Pill>}
            {d.trainingDay === false && <Pill tone="agua">descanso</Pill>}
            {d.closed && <Pill tone="mostaza">cerrado</Pill>}
          </header>

          {d.meals.map((m) => (
            <div key={m.chatId} className="rounded-2xl bg-card-2 p-3">
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <b>{m.category}</b>
                {!after && <Pill tone={m.status === 'nueva' ? 'palta' : 'mostaza'}>{m.status === 'nueva' ? 'nueva' : 'corrige la existente'}</Pill>}
                <span className="ml-auto flex gap-1">
                  {m.confidence && <Pill tone={CONF_TONE[m.confidence] ?? 'neutral'}>{m.confidence}</Pill>}
                  <ScoreBadge score={m.puntaje} />
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-2">{m.desc}</p>
              {!after && m.before && m.before.kcal !== m.kcal && <p className="mt-1 text-xs text-ink-3">Antes: {n(m.before.kcal, 0)} kcal</p>}
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-right text-[11px] tabular-nums sm:text-xs">
                  <thead className="text-ink-3">
                    <tr><th className="py-1 text-left font-bold">Plato</th><th className="pl-1.5">Kcal</th><th className="pl-1.5">Prot</th><th className="pl-1.5">Carb</th><th className="pl-1.5">Gras</th><th className="pl-1.5">Fibra</th></tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {(m.items ?? []).map((it, i) => (
                      <tr key={i}>
                        <td className="py-1 text-left">{it.nombre}{it.cantidad && <span className="text-ink-3"> · {it.cantidad}</span>}</td>
                        <td>{n(it.kcal, 0)}</td><td>{n(it.protein)}</td><td>{n(it.carbs)}</td><td>{n(it.fat)}</td><td>{n(it.fiber)}</td>
                      </tr>
                    ))}
                    <tr className="font-extrabold">
                      <td className="py-1 text-left">{m.items?.length ? 'Total' : 'Comida'}</td>
                      <td>{n(m.kcal, 0)}</td><td>{n(m.protein)}</td><td>{n(m.carbs)}</td><td>{n(m.fat)}</td><td>{n(m.fiber)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {d.blocks.length > 0 && (
            <ul className="space-y-1 text-sm">
              {d.blocks.map((b) => <li key={b} className="flex gap-2"><span className="text-palta">✓</span>{b}</li>)}
            </ul>
          )}

          {d.totals && (
            <div>
              <h3 className="mb-1 text-sm font-extrabold">{after ? 'Así quedó el día' : 'Cómo queda el día'}</h3>
              <table className="w-full text-sm tabular-nums">
                <thead className="text-xs text-ink-3">
                  <tr><th className="py-1 text-left font-bold">Macro</th><th className="text-right">Total</th><th className="text-right">Objetivo</th><th className="text-right">Falta</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {MACROS.map((mac) => {
                    const t = d.totals![mac.key];
                    const st = rangeStatus(t, d.target[mac.key]);
                    const miss = d.missing![mac.key];
                    return (
                      <tr key={mac.key}>
                        <td className="py-1.5 font-semibold">{mac.label}</td>
                        <td className="text-right font-extrabold">{n(t, mac.key === 'kcal' ? 0 : 1)}</td>
                        <td className="text-right text-ink-2">{d.target[mac.key][0]}–{d.target[mac.key][1]}</td>
                        <td className={`text-right font-bold ${st === 'ok' ? 'text-palta' : st === 'alto' ? 'text-mostaza' : 'text-ink-2'}`}>
                          {st === 'ok' ? '✓' : st === 'alto' ? 'pasado' : `${n(miss, mac.key === 'kcal' ? 0 : 1)}${mac.unit}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {d.fiberTip && <p className="mt-2 rounded-2xl bg-mostaza-soft p-2.5 text-sm">🥦 {d.fiberTip}</p>}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
