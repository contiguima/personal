import Link from 'next/link';
import type { Meal } from '@/lib/calc';
import { fmtLong } from '@/lib/dates';
import { CONF_TONE, Pill, ScoreBadge } from './ui';

const r1 = (n: number | null) => (n == null ? '—' : String(Math.round(n * 10) / 10).replace('.', ','));

export function MealCard({ meal, showDate = false, photos = [] }: { meal: Meal; showDate?: boolean; photos?: { id: number; url: string }[] }) {
  const hasMacros = meal.kcal != null;
  return (
    <article className="rounded-2xl border border-line bg-card p-3.5">
      <div className="flex gap-3">
        {photos[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photos[0].url} alt="" className="size-16 shrink-0 rounded-xl object-cover" loading="lazy" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-extrabold">{meal.category}</span>
            {meal.categoryOriginal && <span className="text-xs text-ink-3">({meal.categoryOriginal})</span>}
            {showDate && <Link href={`/?fecha=${meal.date}`} className="text-xs text-ink-2 underline-offset-2 hover:underline">{fmtLong(meal.date)}</Link>}
            <span className="ml-auto flex gap-1">
              {meal.confidence && <Pill tone={CONF_TONE[meal.confidence] ?? 'neutral'}>{meal.confidence}</Pill>}
              <ScoreBadge score={meal.calidadPuntaje} />
            </span>
          </div>
          <p className="mt-1 text-sm leading-snug text-ink-2">{meal.desc}</p>
        </div>
      </div>
      {hasMacros ? (
        <dl className="mt-2.5 grid grid-cols-5 gap-1 text-center">
          {([['kcal', meal.kcal, ''], ['prot', meal.protein, 'g'], ['carbos', meal.carbs, 'g'], ['grasa', meal.fat, 'g'], ['fibra', meal.fiber, 'g']] as const).map(([k, v, u]) => (
            <div key={k} className="rounded-xl bg-card-2 py-1.5">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-ink-3">{k}</dt>
              <dd className="text-sm font-extrabold tabular-nums">{r1(v)}{v != null && u}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-xs text-ink-3">Sin macros estimados (no suma al total).</p>
      )}
      {(meal.calidadUltraprocesado || meal.calidadBeneficios) && (
        <details className="group mt-2 text-sm">
          <summary className="cursor-pointer list-none text-xs font-bold text-palta">Ver calidad <span className="inline-block transition-transform group-open:rotate-90">›</span></summary>
          <div className="mt-1.5 space-y-1.5 text-ink-2">
            {meal.calidadUltraprocesado && <p><b className="text-ink">Ultraprocesado:</b> {meal.calidadUltraprocesado}</p>}
            {meal.calidadBeneficios && <p><b className="text-ink">Beneficios:</b> {meal.calidadBeneficios}</p>}
          </div>
        </details>
      )}
    </article>
  );
}
