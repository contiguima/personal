import { Suspense } from 'react';
import Link from 'next/link';
import { searchMeals } from '@/lib/data';
import { CONFIDENCE, MEAL_CATEGORIES } from '@/lib/constants';
import { fmtLong } from '@/lib/dates';
import { Empty, PageHeader } from '@/components/ui';
import { MealCard } from '@/components/meal-card';
import { Tostada } from '@/components/doodles';

export default function ComidasPage({ searchParams }: PageProps<'/comidas'>) {
  return (
    <div className="space-y-4">
      <PageHeader title="Comidas" subtitle="Todo lo que cargaste, con macros, confianza y calidad" />
      <Suspense fallback={<p className="p-6 text-ink-2">Buscando…</p>}>
        <Comidas searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const list = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const PAGE = 40;

async function Comidas({ searchParams }: Pick<PageProps<'/comidas'>, 'searchParams'>) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 80) : '';
  const categories = list(sp.cat).filter((c) => (MEAL_CATEGORIES as readonly string[]).includes(c));
  const confidence = list(sp.conf).filter((c) => (CONFIDENCE as readonly string[]).includes(c));
  const minScore = Number(sp.min) || 0;
  const limit = Math.min(1000, Math.max(PAGE, Number(sp.n) || PAGE));
  const { rows, total } = await searchMeals({ q, categories, confidence, minScore, limit });

  const groups: { date: string; meals: typeof rows }[] = [];
  for (const m of rows) {
    if (groups.at(-1)?.date !== m.date) groups.push({ date: m.date, meals: [] });
    groups.at(-1)!.meals.push(m);
  }
  const moreParams = new URLSearchParams();
  if (q) moreParams.set('q', q);
  categories.forEach((c) => moreParams.append('cat', c));
  confidence.forEach((c) => moreParams.append('conf', c));
  if (minScore) moreParams.set('min', String(minScore));
  moreParams.set('n', String(limit + PAGE));
  const filtered = q || categories.length || confidence.length || minScore;

  return (
    <>
      <form className="space-y-3 rounded-3xl border border-line bg-card p-4" role="search">
        <div className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Buscar: pollo, yogur, ravioles…" className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2.5 text-sm outline-none focus:border-palta" />
          <button className="rounded-full bg-palta px-5 text-sm font-bold text-white dark:text-bg">Buscar</button>
        </div>
        <details open={!!(categories.length || confidence.length || minScore)}>
          <summary className="cursor-pointer text-sm font-bold text-ink-2">Filtros</summary>
          <div className="mt-3 space-y-3 text-sm">
            <Chips name="cat" options={MEAL_CATEGORIES} selected={categories} />
            <Chips name="conf" options={CONFIDENCE} selected={confidence} label="Confianza" />
            <label className="flex items-center gap-2">
              <span className="font-semibold text-ink-2">Calidad mínima</span>
              <select name="min" defaultValue={minScore || ''} className="rounded-full border border-line bg-bg px-3 py-1.5">
                <option value="">cualquiera</option>
                {[5, 6, 7, 8, 9].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </label>
          </div>
        </details>
      </form>

      <p className="text-sm text-ink-2">
        {total} {total === 1 ? 'comida' : 'comidas'}{filtered ? ' con esos filtros' : ''}.{' '}
        {filtered ? <Link href="/comidas" className="font-bold text-palta">Limpiar</Link> : null}
      </p>

      {groups.length ? (
        <div className="space-y-5">
          {groups.map((g) => (
            <section key={g.date} className="aparecer">
              <h2 className="mb-2 text-sm font-extrabold text-ink-2 first-letter:uppercase">
                <Link href={`/?fecha=${g.date}`} className="hover:text-palta">{fmtLong(g.date)}</Link>
              </h2>
              <div className="grid gap-2.5 md:grid-cols-2">
                {g.meals.map((m) => <MealCard key={m.id} meal={m} photos={m.photos} />)}
              </div>
            </section>
          ))}
          {rows.length < total && (
            <Link href={`/comidas?${moreParams}`} scroll={false} className="block rounded-full border border-line bg-card py-3 text-center text-sm font-bold text-palta">
              Ver más ({total - rows.length} restantes)
            </Link>
          )}
        </div>
      ) : (
        <Empty text="No encontré comidas con eso. Probá con otra palabra." doodle={<Tostada className="size-16" />} />
      )}
    </>
  );
}

function Chips({ name, options, selected, label }: { name: string; options: readonly string[]; selected: string[]; label?: string }) {
  return (
    <fieldset>
      {label && <legend className="mb-1.5 font-semibold text-ink-2">{label}</legend>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="checkbox" name={name} value={o} defaultChecked={selected.includes(o)} className="peer sr-only" />
            <span className="block rounded-full border border-line px-3 py-1 text-xs font-bold text-ink-2 peer-checked:border-palta peer-checked:bg-palta-soft peer-checked:text-palta peer-focus-visible:ring-2 peer-focus-visible:ring-palta">{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
